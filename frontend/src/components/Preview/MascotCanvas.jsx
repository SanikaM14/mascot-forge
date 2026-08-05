import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import MascotEngine from './MascotEngine';

export default function MascotCanvas({ spec, currentAnimation, currentFaceStyle }) {
  // Extract accent color for the rim light glow
  const accentColor = spec?.appearance?.accent_color || '#ff007f';

  return (
    <div className="canvas-container" style={{ width: '100%', height: '100%', minHeight: '400px', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 0.4, 4.2], fov: 42 }} shadows>
        {/* Soft fill ambient light */}
        <ambientLight intensity={0.7} />
        
        {/* High-quality key light for soft shadows */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />

        {/* Fill light from the opposite side */}
        <directionalLight 
          position={[-5, 3, 2]} 
          intensity={0.6} 
          color="#ffffff"
        />

        {/* Rim / Backlight to separate the mascot from the dark background (glow effect) */}
        <pointLight 
          position={[0, 4, -4]} 
          intensity={2.5} 
          color={accentColor} 
        />

        {/* Subtle ground bounce light */}
        <directionalLight 
          position={[0, -5, 0]} 
          intensity={0.3} 
          color={spec?.appearance?.primary_color || '#ffffff'}
        />

        <Suspense fallback={null}>
          <MascotEngine spec={spec} currentAnimation={currentAnimation} currentFaceStyle={currentFaceStyle} />
          <Environment preset="studio" />
          {/* Beautiful soft contact shadow under the mascot */}
          <ContactShadows 
            position={[0, -1.1, 0]} 
            opacity={0.65} 
            scale={6} 
            blur={2.4} 
            far={3} 
            resolution={512}
          />
        </Suspense>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          minDistance={2.5}
          maxDistance={6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
}
