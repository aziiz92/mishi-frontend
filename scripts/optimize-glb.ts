// Mishi landing — 3D asset pipeline (Phase 0).
//
// Reads the ORIGINAL assets in assets-src/ (outside public/, so they
// can never reach the deploy artifact — DL13) and writes compressed,
// self-contained GLBs into public/3D/, the only 3D files the app loads.
//
//   npm run optimize:glb
//
// Stages: dedup → prune → weld → Draco (geometry) → KTX2 (textures,
// via toktx — no-op while an asset has zero textures, which is the
// case for both assets at Phase 0; the phone gains baked screen
// textures in Phase 3 and flows through the same stage).

import { execFileSync } from 'node:child_process';
import { existsSync, statSync, renameSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

import { NodeIO, Document, getBounds, type vec3 } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, draco } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

// Draco quantization — explicit so the evidence report states real numbers.
const QUANTIZE = { quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 };

// textureCodec 'webp': KTX2 (uastc AND etc1s) renders corrupted through the
// GPU transcode path on iOS-family WebGL (verified in simulator: CPU-side
// `ktx extract` of the same file is pixel-perfect, GPU render is garbage —
// DL38). WebP-in-GLB decodes universally and is 8× smaller here. The KTX2
// stage below stays wired for assets where it proves out.
const ASSETS: { in: string; out: string; baseColorTexture?: string; textureCodec?: 'webp' | 'ktx2' }[] = [
  { in: 'assets-src/iphone_16_-_free.glb', out: 'public/3D/phone.draco.glb' },
  // DL4 (Aziiz): plate_texture.png wired as the plate's base color.
  { in: 'assets-src/plate/scene.gltf', out: 'public/3D/plate.draco.glb', baseColorTexture: 'assets-src/plate_texture.png', textureCodec: 'webp' },
];

const BUDGET_BYTES = 2 * 1024 * 1024; // hard gate: ≤ 2MB per GLB post-compression

interface Stats {
  bytes: number;
  triangles: number;
  vertices: number;
  materials: number;
  textures: number;
  nodes: number;
  bbox: { min: vec3; max: vec3 };
}

function collectStats(doc: Document, bytes: number): Stats {
  const root = doc.getRoot();
  let triangles = 0;
  let vertices = 0;
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices();
      const position = prim.getAttribute('POSITION');
      triangles += (indices ? indices.getCount() : position?.getCount() ?? 0) / 3;
      vertices += position?.getCount() ?? 0;
    }
  }
  const scene = root.getDefaultScene() ?? root.listScenes()[0];
  const { min, max } = getBounds(scene);
  return {
    bytes,
    triangles,
    vertices,
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
    nodes: root.listNodes().length,
    bbox: { min, max },
  };
}

// On-disk size of an asset including external resources (.gltf + .bin + images).
function inputBytes(path: string): number {
  let total = statSync(path).size;
  if (path.endsWith('.gltf')) {
    const json = JSON.parse(readFileSync(path, 'utf8'));
    for (const res of [...(json.buffers ?? []), ...(json.images ?? [])]) {
      if (res.uri && !res.uri.startsWith('data:')) {
        total += statSync(join(dirname(path), decodeURIComponent(res.uri))).size;
      }
    }
  }
  return total;
}

const fmtMB = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;
const diag = (b: Stats['bbox']) =>
  Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]);

async function main() {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule(),
      'draco3d.decoder': await draco3d.createDecoderModule(),
    });

  for (const asset of ASSETS) {
    if (!existsSync(asset.in)) throw new Error(`missing input: ${asset.in}`);

    const before = collectStats(await io.read(asset.in), inputBytes(asset.in));

    const doc = await io.read(asset.in);

    // Wire an external base-color texture onto a material that shipped
    // without one (the plate, DL4). Resized to 1024² before KTX2.
    if (asset.baseColorTexture) {
      const sharp = (await import('sharp')).default;
      const img = sharp(asset.baseColorTexture).resize(1024, 1024);
      const useWebp = asset.textureCodec === 'webp';
      const resized = useWebp ? await img.webp({ quality: 82 }).toBuffer() : await img.png().toBuffer();
      const texture = doc
        .createTexture('baseColor')
        .setImage(new Uint8Array(resized))
        .setMimeType(useWebp ? 'image/webp' : 'image/png');
      for (const material of doc.getRoot().listMaterials()) {
        material.setBaseColorTexture(texture);
        material.setBaseColorFactor([1, 1, 1, 1]);
      }
      before.bytes += statSync(asset.baseColorTexture).size;
    }

    // The plate's photogrammetry normals are noisy (radial shading
    // artifacts) — strip them here (smaller GLB) and let three.js
    // computeVertexNormals() rebuild smooth ones at load (Stage.tsx).
    if (asset.baseColorTexture) {
      for (const mesh of doc.getRoot().listMeshes()) {
        for (const prim of mesh.listPrimitives()) prim.setAttribute('NORMAL', null);
      }
    }
    await doc.transform(dedup(), prune(), weld(), draco(QUANTIZE));
    await io.write(asset.out, doc);

    // KTX2 stage — gltf-transform CLI shells out to the ktx/toktx binaries.
    // Skipped for webp-codec assets (DL38).
    const readBack = await io.read(asset.out);
    if (asset.textureCodec !== 'webp' && readBack.getRoot().listTextures().length > 0) {
      const tmp = `${asset.out}.ktx2-tmp.glb`;
      execFileSync(
        'npx',
        // uastc: etc1s transcode produced garbage in simulator WebGL (see
        // decisions-landing DL38); uastc transcodes reliably
        ['--no-install', 'gltf-transform', 'uastc', asset.out, tmp, '--level', '2', '--zstd', '18', '--mipmaps', 'true'],
        {
          stdio: 'inherit',
          env: { ...process.env, PATH: `${process.env.PATH}${delimiter}${join(homedir(), '.local/bin')}` },
        },
      );
      renameSync(tmp, asset.out);
    }

    const after = collectStats(await io.read(asset.out), statSync(asset.out).size);

    // Worst-case Draco position error: bbox diagonal / 2^quantizePosition.
    const posErr = diag(after.bbox) / 2 ** QUANTIZE.quantizePosition;
    const bboxDrift = Math.abs(diag(after.bbox) - diag(before.bbox));

    console.log(`\n=== ${asset.in} → ${asset.out} ===`);
    console.log(`size:      ${fmtMB(before.bytes)} → ${fmtMB(after.bytes)} (${((1 - after.bytes / before.bytes) * 100).toFixed(1)}% smaller)`);
    console.log(`triangles: ${before.triangles} → ${after.triangles}`);
    console.log(`vertices:  ${before.vertices} → ${after.vertices}`);
    console.log(`materials: ${before.materials} → ${after.materials} | textures: ${before.textures} → ${after.textures} | nodes: ${before.nodes} → ${after.nodes}`);
    console.log(`bbox diag: ${diag(before.bbox).toFixed(5)} → ${diag(after.bbox).toFixed(5)} (drift ${bboxDrift.toExponential(2)})`);
    console.log(`max quantization error (position, ${QUANTIZE.quantizePosition}-bit): ${posErr.toExponential(2)} scene units`);
    console.log(`budget:    ${after.bytes <= BUDGET_BYTES ? 'PASS' : 'FAIL'} (${fmtMB(after.bytes)} vs ≤ ${fmtMB(BUDGET_BYTES)})`);

    if (after.bytes > BUDGET_BYTES) process.exitCode = 1;
  }
}

main();
