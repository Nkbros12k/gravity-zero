import React from 'react';
import { Canvas } from '@react-three/fiber';

const GravityZeroPage: React.FC = () => {
  return (
    <Canvas>
      {/* Add your Three.js scene here */}
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
        <meshBasicMaterial attach="material" color="#ff0000" />
      </mesh>
    </Canvas>
  );
};

export default GravityZeroPage;