// The Tier A WebGL world: the dot sphere (Phase 2) + the phone and plate
// GLBs with the cream bloom (Phase 3). Orthographic camera at zoom 1 —
// 1 GL unit = 1 CSS px — and every object tracks its DOM anchor, so the
// 3D world and the DOM world can never drift apart.
//
// All choreography lives on the master timeline (src/scene/scene.ts,
// src/dot/path.ts); this file only renders state.

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import {
  Box3,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { glBridge, DOT_BASE_SIZE } from '../dot/state';
import { sceneState } from '../scene/scene';
import { colors } from '../theme/tokens';

const PHONE_URL = '/3D/phone.draco.glb';
const PLATE_URL = '/3D/plate.draco.glb';
const SCREEN_NODE = 'Object_18'; // 6.53×14.08 emissive plane — the display
const SCREEN_TEXTURES = ['/3D/screens/camera.png', '/3D/screens/scan.png', '/3D/screens/results.png'];

// Module-scope materials: static token-derived config, mutated per frame by
// useFrame (imperative three.js — deliberately outside React's data flow).
const screenMaterial = new MeshBasicMaterial({ toneMapped: false });
const bloomMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    uColor: { value: new Color(colors.surface.raised) },
    uAlpha: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv;
    void main() {
      float d = distance(vUv, vec2(0.5));
      float edge = smoothstep(0.5, 0.18, d);
      gl_FragColor = vec4(uColor, edge * uAlpha);
    }
  `,
});

// Anchor tracking: doc-space center measured once (+resize via remount),
// converted to viewport space per frame with the current scroll offset.
function useAnchorDocCenter(name: string) {
  return useMemo(() => {
    const el = document.querySelector<HTMLElement>(`[data-dot-anchor="${name}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + window.scrollX + r.width / 2,
      y: r.top + window.scrollY + r.height / 2,
      height: r.height,
    };
  }, [name]);
}

const toGl = (vx: number, vy: number) => ({
  x: vx - window.innerWidth / 2,
  y: window.innerHeight / 2 - vy,
});

function DotSphere() {
  const ref = useRef<Mesh>(null);
  useEffect(() => {
    glBridge.sphere = ref.current;
    glBridge.glReady = true;
    return () => {
      glBridge.glReady = false;
      glBridge.sphere = null;
      // hand the dot back to the DOM in the same synchronous moment
      glBridge.releaseToDom?.();
    };
  }, []);
  return (
    // depthTest off + last render order: NOTHING in the GL world may ever
    // occlude the dot (an occluded dot is a zero-dot frame — a defect the
    // visibility-flag audit can't see; this makes it structurally
    // impossible instead).
    <mesh ref={ref} visible={false} renderOrder={100}>
      <sphereGeometry args={[DOT_BASE_SIZE / 2, 32, 32]} />
      <meshBasicMaterial color={colors.accent.DEFAULT} depthTest={false} />
    </mesh>
  );
}

function Phone() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(PHONE_URL, '/draco/');
  const textures = useTexture(SCREEN_TEXTURES);
  const anchor = useAnchorDocCenter('phone-screen');

  // Overlay the display with a plane carrying the baked screen states —
  // no dependence on the GLB's UV layout. Three.js scene graphs are
  // imperative by design; this effect runs before the first R3F frame
  // (group transform still identity), so world space == group-local space.
  /* eslint-disable react-hooks/immutability */
  useEffect(() => {
    for (const t of textures) t.colorSpace = SRGBColorSpace;
    const screen = scene.getObjectByName(SCREEN_NODE);
    if (!screen) return;
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(screen);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const plane = new Mesh(new PlaneGeometry(size.x * 0.98, size.y * 0.98), screenMaterial);
    plane.name = 'mishi-screen-overlay';
    plane.position.copy(center).add(new Vector3(0, 0, size.z / 2 + 0.02));
    scene.add(plane);
    return () => {
      scene.remove(plane);
      plane.geometry.dispose();
    };
  }, [scene, textures]);
  /* eslint-enable react-hooks/immutability */

  useFrame(() => {
    if (!group.current || !anchor) return;
    const rise = sceneState.phoneRise;
    const scrollY = window.scrollY;
    const v = toGl(anchor.x, anchor.y - scrollY);
    // scale phone display (14.08 units) to the anchor box height
    const scale = anchor.height / 14.08;
    group.current.visible = rise > 0.001 && Math.abs(anchor.y - scrollY - window.innerHeight / 2) < window.innerHeight * 1.5;
    group.current.position.set(v.x, v.y - (1 - rise) * 160, 0);
    group.current.rotation.y = (1 - rise) * -0.9;
    group.current.scale.setScalar(scale);
    screenMaterial.map = textures[Math.min(2, Math.max(0, Math.round(sceneState.screen)))];
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={scene} />
    </group>
  );
}

function Plate() {
  const group = useRef<Group>(null);
  // plate textures are WebP-in-GLB (DL38) — no KTX2 runtime loader needed
  // (DL45: transcoder pruned from the bundle in Phase 5)
  const { scene } = useGLTF(PLATE_URL, '/draco/');
  const anchor = useAnchorDocCenter('plate');

  // The pipeline strips the scan's noisy normals; rebuild smooth ones here.
   
  useEffect(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.isMesh && !mesh.geometry.getAttribute('normal')) mesh.geometry.computeVertexNormals();
    });
  }, [scene]);

  useFrame(() => {
    if (!group.current || !anchor) return;
    const rise = sceneState.plateRise;
    const scrollY = window.scrollY;
    const v = toGl(anchor.x, anchor.y - scrollY);
    // plate is 9.08 units wide — fill the anchor box (viewed tilted)
    const scale = anchor.height / 9.1;
    group.current.visible = rise > 0.001 && Math.abs(anchor.y - scrollY - window.innerHeight / 2) < window.innerHeight * 1.5;
    group.current.position.set(v.x, v.y - (1 - rise) * 220, 0);
    // face-on (top-down) at rest — the Results-Screen plate view; tilts up
    // into place as it rises. Model top faces +Y, camera looks down -Z.
    group.current.rotation.x = Math.PI / 2 + (1 - rise) * 0.55;
    group.current.rotation.z = (1 - rise) * -0.4;
    group.current.scale.setScalar(scale);
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={scene} />
    </group>
  );
}

// The cream bloom — the Results-Screen reveal gesture, radiating from the
// dot's landing point across the plate. Soft radial disc, token cream.
function Bloom() {
  const ref = useRef<Mesh>(null);
  const anchor = useAnchorDocCenter('plate');

  useFrame(() => {
    if (!ref.current || !anchor) return;
    const b = sceneState.bloom;
    const scrollY = window.scrollY;
    const v = toGl(anchor.x, anchor.y - scrollY);
    ref.current.visible = b > 0.001;
    ref.current.position.set(v.x, v.y, 1);
    // expands past the plate edge and fades — bloom, not a sticker
    ref.current.scale.setScalar(0.2 + b * (anchor.height * 1.15));
    bloomMaterial.uniforms.uAlpha.value = b < 0.7 ? b : 1 - (b - 0.7) / 0.3;
  });

  return (
    <mesh ref={ref} material={bloomMaterial} visible={false} renderOrder={5}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

export default function Stage() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 500], zoom: 1, near: 0.1, far: 2000 }} gl={{ alpha: true }}>
        {/* warm cream light world: ambient lift + a camera-side key (no
            distance decay — the ortho "camera" is conceptual, not physical);
            the phone screen stays the perceptual light of the espresso act */}
        <ambientLight intensity={2.2} color={colors.surface.raised} />
        <directionalLight position={[120, 300, 500]} intensity={1.6} color={colors.surface.raised} />
        <DotSphere />
        <Phone />
        <Plate />
        <Bloom />
      </Canvas>
    </div>
  );
}

useGLTF.preload(PHONE_URL, '/draco/');
