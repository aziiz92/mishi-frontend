// The Tier A WebGL world: the floating iPhone of the feature showcase.
// Orthographic camera at zoom 1 — 1 GL unit = 1 CSS px — so phonePose's
// viewport-fraction coordinates map straight to pixels.
//
// All choreography lives on the master timeline (src/showcase/timeline.ts);
// this file only renders phonePose, plus the idle float (a per-frame
// wobble is presentation, not choreography — it never moves the pose).

import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Box3, Group, Vector3 } from 'three';
import { phonePose, phoneOnStage } from '../showcase/state';
import { colors } from '../theme/tokens';

const PHONE_URL = '/3D/iphone_17_pro_max.glb';

function Phone() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(PHONE_URL);

  // The GLB's origin is off-center; measure once and recenter so the group
  // origin (the rotation pivot) sits at the phone's center.
  const fit = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene);
    return { height: box.getSize(new Vector3()).y, center: box.getCenter(new Vector3()) };
  }, [scene]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.visible = phoneOnStage(phonePose);
    if (!g.visible) return;
    const t = clock.elapsedTime;
    const f = phonePose.float;
    g.position.set(
      phonePose.x * window.innerWidth,
      phonePose.y * window.innerHeight + Math.sin(t * 1.1) * 9 * f,
      0,
    );
    g.rotation.set(
      phonePose.rotX + Math.sin(t * 0.9) * 0.035 * f,
      phonePose.rotY + Math.sin(t * 0.6) * 0.06 * f,
      phonePose.rotZ + Math.cos(t * 0.75) * 0.02 * f,
    );
    g.scale.setScalar((phonePose.scale * window.innerHeight) / fit.height);
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={scene} position={[-fit.center.x, -fit.center.y, -fit.center.z]} />
    </group>
  );
}

export default function Stage() {
  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <Canvas orthographic camera={{ position: [0, 0, 500], zoom: 1, near: 0.1, far: 2000 }} gl={{ alpha: true }}>
        {/* warm cream light world: ambient lift + a camera-side key (no
            distance decay — the ortho "camera" is conceptual, not physical) */}
        <ambientLight intensity={2.2} color={colors.surface.raised} />
        <directionalLight position={[120, 300, 500]} intensity={1.6} color={colors.surface.raised} />
        <Phone />
      </Canvas>
    </div>
  );
}

useGLTF.preload(PHONE_URL);
