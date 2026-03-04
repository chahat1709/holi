import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// Authentic Holi Water Colors
const holiColors = [
  new THREE.Color('#ff0055'), // Neon Red/Pink
  new THREE.Color('#ffaa00'), // Marigold Yellow
  new THREE.Color('#00ddff'), // Cyan
  new THREE.Color('#aa00ff'), // Purple
  new THREE.Color('#ff3300'), // Orange
  new THREE.Color('#00ff44'), // Green
];

const Balloon = ({ color, position }: { color: string, position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // High-frequency wobble to simulate air resistance
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 20) * 0.05;
      groupRef.current.rotation.x = Math.cos(clock.elapsedTime * 15) * 0.05;
    }
  });

  return (
    <group position={position} ref={groupRef}>
      {/* Main Balloon Body */}
      <mesh scale={[1, 1.2, 1]} castShadow>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.1} 
          metalness={0.1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          transmission={0.8}
          ior={1.33} // Water IOR
          thickness={1}
        />
      </mesh>
      {/* Balloon Knot */}
      <mesh position={[0, -1.8, 0]}>
        <coneGeometry args={[0.3, 0.5, 32]} />
        <meshPhysicalMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
};

const SplashWater = ({ burstColor }: { burstColor: string }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 12000; // 12k instances for a massive, realistic water splash
  
  const [dummy] = useState(() => new THREE.Object3D());
  const upVector = new THREE.Vector3(0, 1, 0);

  const particles = useMemo(() => {
    const parts = [];
    const mainColor = new THREE.Color(burstColor);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Water shoots out fast and heavy
      const speed = Math.random() > 0.8 ? Math.random() * 40 + 15 : Math.random() * 20 + 5;
      
      const isMainColor = Math.random() > 0.3;
      const c = isMainColor ? mainColor : holiColors[Math.floor(Math.random() * holiColors.length)];
      
      parts.push({
        position: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
        velocity: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ),
        color: c,
        // Base size of the water droplet
        scale: Math.random() * 0.15 + 0.02 
      });
    }
    return parts;
  }, [burstColor]);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setColorAt(i, particles[i].color);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [particles]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dt = Math.min(delta, 0.05);
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      
      // Water physics: Heavy gravity, very low drag
      p.velocity.y -= 50 * dt; // Strong gravity pulls water down fast
      p.velocity.x *= 0.99; // Low air resistance
      p.velocity.y *= 0.99;
      p.velocity.z *= 0.99;
      
      p.position.addScaledVector(p.velocity, dt);
      
      dummy.position.copy(p.position);
      
      // Stretch the droplet based on how fast it's moving (motion blur effect)
      const speed = p.velocity.length();
      const stretch = Math.max(1, speed * 0.08);
      dummy.scale.set(p.scale, p.scale * stretch, p.scale);
      
      // Point the stretched droplet in the direction it is flying
      if (speed > 0.1) {
        dummy.quaternion.setFromUnitVectors(upVector, p.velocity.clone().normalize());
      }
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshPhysicalMaterial 
        roughness={0.05} 
        metalness={0.1} 
        transmission={0.9} // Makes it look like transparent liquid
        ior={1.33} // Index of refraction for water
        thickness={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};

const Scene = ({ phase, balloonColor, balloonY }: { phase: string, balloonColor: string, balloonY: number }) => {
  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[10, 20, 10]} intensity={5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={3} color={balloonColor} />
      
      {phase === 'flying' && <Balloon color={balloonColor} position={[0, balloonY, 0]} />}
      {phase === 'burst' && <SplashWater burstColor={balloonColor} />}
      
      {/* Subtle bloom for the specular highlights on the water */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.9} mipmapBlur intensity={0.5} luminanceSmoothing={0.9} />
      </EffectComposer>
    </>
  );
};

export default function BalloonSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'flying' | 'burst'>('flying');
  const [balloonY, setBalloonY] = useState(-20);
  const [balloonColorStr] = useState(() => ['#ff0055', '#ffaa00', '#00ddff', '#aa00ff', '#ff3300', '#00ff44'][Math.floor(Math.random() * 6)]);

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();
    const duration = 800; // 800ms flight time

    const animateFlight = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for fast launch, slowing down near the top
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setBalloonY(-20 + easeProgress * 20); // Fly from y=-20 to y=0

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateFlight);
      } else {
        setPhase('burst');
        // Let the water splash fall for 3 seconds before unmounting
        setTimeout(() => {
          onComplete();
        }, 3000); 
      }
    };

    animationFrame = requestAnimationFrame(animateFlight);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Scene phase={phase} balloonColor={balloonColorStr} balloonY={balloonY} />
      </Canvas>
    </div>
  );
}
