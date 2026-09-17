import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const ScrollReactiveCamera = () => {
  useFrame((state) => {
    // Smoothly interpolate camera position based on scroll
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollProgress = scrollY / maxScroll;
    
    // Move camera through space
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 10 - scrollProgress * 15, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -scrollProgress * 5, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, scrollProgress * 0.5, 0.05);
  });
  return null;
};

const CyberGrid = () => {
  const gridRef = useRef();
  
  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z = (gridRef.current.position.z + delta * 2) % 2;
    }
  });

  return (
    <group ref={gridRef} position={[0, -5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
      <gridHelper args={[100, 100, '#00f2fe', '#00f2fe']} position={[0, 0, 0]}>
        <lineBasicMaterial attach="material" color="#00f2fe" transparent opacity={0.15} />
      </gridHelper>
    </group>
  );
};

const FloatingCubes = () => {
  const cubes = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30 - 10
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? '#00f2fe' : '#4facfe'
    }));
  }, []);

  return (
    <>
      {cubes.map((cube, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
          <mesh position={cube.position} rotation={cube.rotation} scale={cube.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={cube.color} wireframe={Math.random() > 0.5} transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </>
  );
};

const InteractiveTorus = () => {
  const ref = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.x = t * 0.2;
      ref.current.rotation.y = t * 0.3;
      
      // React to scroll
      const scrollY = window.scrollY;
      const scale = 1 + scrollY * 0.001;
      ref.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -5]}>
      <torusGeometry args={[4, 0.1, 16, 100]} />
      <meshStandardMaterial color="#00f2fe" wireframe emissive="#00f2fe" emissiveIntensity={0.5} />
    </mesh>
  );
};

export default function Hero3DScene() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', opacity: 0.8 }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00f2fe" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b388ff" />
        
        <ScrollReactiveCamera />
        <CyberGrid />
        <FloatingCubes />
        <InteractiveTorus />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <fog attach="fog" args={['#000000', 5, 30]} />
      </Canvas>
    </div>
  );
}
