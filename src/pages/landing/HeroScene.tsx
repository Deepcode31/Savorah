import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* Slowly rotating particle field that leans toward the cursor */
function ParticleField({ count = 1800 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = (r * Math.sin(phi) * Math.sin(theta)) * 0.55;
      arr[i * 3 + 2] = r * Math.cos(phi) - 4;
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    const targetX = state.pointer.y * 0.12;
    const targetY = state.pointer.x * 0.18;
    ref.current.rotation.x += (targetX - ref.current.rotation.x) * 0.04;
    ref.current.rotation.z += (targetY * 0.3 - ref.current.rotation.z) * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#34d399"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GlowOrb({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.85}
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
    </Float>
  );
}

function TorusRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.08;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.25;
  });
  return (
    <mesh ref={ref} position={[3.2, 0.4, -2]}>
      <torusGeometry args={[1.6, 0.012, 16, 120]} />
      <meshBasicMaterial color="#2dd4bf" transparent opacity={0.55} />
    </mesh>
  );
}

const HeroScene: React.FC = () => (
  <Canvas
    dpr={[1, 1.5]}
    camera={{ position: [0, 0, 8], fov: 55 }}
    gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
    style={{ position: 'absolute', inset: 0 }}
    aria-hidden
  >
    <ambientLight intensity={0.4} />
    <pointLight position={[6, 4, 6]} intensity={1.2} color="#34d399" />
    <pointLight position={[-6, -3, 2]} intensity={0.6} color="#818cf8" />
    <ParticleField />
    <GlowOrb position={[-4.4, 1.4, -3]} color="#10b981" scale={0.9} />
    <GlowOrb position={[4.6, -1.6, -4]} color="#818cf8" scale={0.7} />
    <TorusRing />
  </Canvas>
);

export default HeroScene;
