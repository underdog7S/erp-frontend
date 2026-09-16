import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Extremely basic spinning box to prevent any WebGL OOM issues on low-end devices
const SpinningShape = ({ position, color, speed = 1 }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.2;
      meshRef.current.rotation.y += delta * speed * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[1, 0]} />
      {/* Basic material doesn't use complex lighting shaders, avoiding HLSL compiler crashes */}
      <meshBasicMaterial color={color} wireframe={true} />
    </mesh>
  );
};

// Simple particle system without complex materials
const Particles = ({ count = 50 }) => {
  const meshRef = useRef();
  
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
  }

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00f2fe" />
    </points>
  );
};

export default function Hero3DScene() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={1}>
        <SpinningShape position={[3, 0, -2]} color="#00f2fe" speed={1} />
        <SpinningShape position={[-4, 2, -5]} color="#4facfe" speed={1.5} />
        <SpinningShape position={[4, -3, -4]} color="#b388ff" speed={0.8} />
        <Particles count={100} />
      </Canvas>
    </div>
  );
}
