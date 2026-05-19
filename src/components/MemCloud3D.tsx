import { useRef, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '../store/AppContext';
import type { RawMemory, InsightMemory } from '../types';

function ParticleCloud() {
  const { rawMemories, currentView, selectMemory } = useAppState();

  const { positions, colors } = useMemo(() => {
    const mems = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
    const pos = new Float32Array(mems.length * 3);
    const col = new Float32Array(mems.length * 3);

    mems.forEach((m, i) => {
      const p = m.positions[currentView] || m.position3D;
      pos[i * 3] = p[0];
      pos[i * 3 + 1] = p[1];
      pos[i * 3 + 2] = p[2];

      const c = new THREE.Color(m.color);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });

    return { positions: pos, colors: col };
  }, [rawMemories, currentView]);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    const index = event.index;
    if (index !== undefined && index < rawMemories.length) {
      const rawMems = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
      selectMemory(rawMems[index]);
    }
  }, [rawMemories, selectMemory]);

  return (
    <points onClick={handleClick}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

function InsightRings() {
  const { insightMemories, selectMemory } = useAppState();
  const groupRef = useRef<THREE.Group>(null);

  const rings = useMemo(() => {
    return insightMemories.map(ins => ({
      position: new THREE.Vector3(ins.position3D[0], ins.position3D[1], ins.position3D[2]),
      size: ins.size * 0.4,
      id: ins.id,
      insight: ins,
    }));
  }, [insightMemories]);

  const handleClick = useCallback((insight: InsightMemory) => (event: any) => {
    event.stopPropagation();
    selectMemory(insight);
  }, [selectMemory]);

  return (
    <group ref={groupRef}>
      {rings.map((ring) => (
        <group key={ring.id}>
          <mesh position={ring.position} onClick={handleClick(ring.insight)}>
            <torusGeometry args={[ring.size * 0.6, 0.04, 16, 32]} />
            <meshBasicMaterial color="#ffb800" transparent opacity={0.5} />
          </mesh>
          <mesh position={ring.position} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[ring.size * 0.6, 0.04, 16, 32]} />
            <meshBasicMaterial color="#ffb800" transparent opacity={0.3} />
          </mesh>
          <mesh position={ring.position} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[ring.size * 0.6, 0.04, 16, 32]} />
            <meshBasicMaterial color="#ffb800" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function InsightNetworkLines() {
  const { insightMemories } = useAppState();

  const lines = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < insightMemories.length; i++) {
      for (let j = i + 1; j < insightMemories.length; j++) {
        const a = insightMemories[i];
        const b = insightMemories[j];
        const dist = Math.sqrt(
          Math.pow(a.position3D[0] - b.position3D[0], 2) +
          Math.pow(a.position3D[1] - b.position3D[1], 2) +
          Math.pow(a.position3D[2] - b.position3D[2], 2)
        );
        if (dist < 4) {
          pairs.push([
            new THREE.Vector3(a.position3D[0], a.position3D[1], a.position3D[2]),
            new THREE.Vector3(b.position3D[0], b.position3D[1], b.position3D[2]),
          ]);
        }
      }
    }
    return pairs;
  }, [insightMemories]);

  if (lines.length === 0) return null;

  const vertices: number[] = [];
  lines.forEach(([a, b]) => {
    vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
  });

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={vertices.length / 3}
          array={new Float32Array(vertices)}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ffb800" transparent opacity={0.08} />
    </lineSegments>
  );
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
    </>
  );
}

export default function MemCloud3D() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        performance={{ min: 0.3 }}
      >
        <SceneLights />
        <Stars radius={30} depth={50} count={200} factor={4} saturation={0} fade speed={0} />
        <ParticleCloud />
        <InsightNetworkLines />
        <InsightRings />
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI * 0.75}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}