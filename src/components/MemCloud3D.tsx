import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '../store/AppContext';
import type { RawMemory, InsightMemory } from '../types';

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function getNavPosition(mem: RawMemory, category: string, subCategory: string | null): [number, number, number] {
  const seed = mem.id + category + (subCategory || '');
  const h = Math.abs(hashCode(seed));
  const phi = Math.acos(2 * ((h % 10000) / 10000) - 1);
  const theta = 2 * Math.PI * ((Math.floor(h / 10000) % 10000) / 10000);
  const radius = 3 + 2.5 * ((Math.floor(h / 100000000) % 10000) / 10000);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

function getInsightNavPosition(ins: InsightMemory, category: string, subCategory: string | null): [number, number, number] {
  const seed = ins.id + category + (subCategory || '');
  const h = Math.abs(hashCode(seed));
  const phi = Math.acos(2 * ((h % 10000) / 10000) - 1);
  const theta = 2 * Math.PI * ((Math.floor(h / 10000) % 10000) / 10000);
  const radius = 3.8 + 2 * ((Math.floor(h / 100000000) % 10000) / 10000);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

const NAV_MAP: Record<string, string[]> = {
  '家庭生活': ['家', '客厅', '卧室', '厨房', '阳台', '花园'],
  '学习与成长': ['学校', '书房', '教室', '图书馆'],
  '社交与情感': ['公园', '商场', '游乐场'],
  '兴趣与探索': ['公园', '游乐场', '其他'],
};

const SUB_MAP: Record<string, string[]> = {
  '快乐时光': ['游乐场', '公园'],
  '父子协作': ['家'],
  '日常生活': ['家', '客厅', '卧室', '厨房', '阳台'],
  '编程学习': ['学校', '家'],
  '数学学习': ['学校'],
  '阅读习惯': ['家', '学校'],
  '朋友互动': ['公园', '商场', '游乐场'],
  '情感表达': ['家', '公园'],
  '户外活动': ['公园', '游乐场'],
  '科幻兴趣': ['家', '其他'],
};

function isMemoryInCategory(mem: RawMemory, category: string, subCategory: string | null): boolean {
  if (mem.source === 'chatgpt') return true;
  if (subCategory) {
    const subPlaces = SUB_MAP[subCategory];
    if (!subPlaces) return false;
    return subPlaces.includes(mem.dimensions.spatial.placeType);
  }
  const places = NAV_MAP[category];
  if (!places || !places.includes(mem.dimensions.spatial.placeType)) return false;
  return true;
}

type Theme = 'dark' | 'light';

function ParticleCloud({ theme }: { theme: Theme }) {
  const { rawMemories, navCategory, navSubCategory, selectMemory, hideRawOnly } = useAppState();
  const visibleRef = useRef<RawMemory[]>([]);
  const isLight = theme === 'light';

  const visible = useMemo(() => {
    if (!navCategory) {
      const result = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
      visibleRef.current = result;
      return result;
    }
    let filtered = rawMemories.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
    const result = filtered.filter(m => m.type === 'raw') as RawMemory[];
    visibleRef.current = result;
    return result;
  }, [rawMemories, navCategory, navSubCategory]);

  const { positions, colors } = useMemo(() => {
    const mems = visible;
    const pos = new Float32Array(mems.length * 3);
    const col = new Float32Array(mems.length * 3);

    mems.forEach((m, i) => {
      let p: [number, number, number];
      if (navCategory) {
        p = getNavPosition(m, navCategory, navSubCategory);
      } else {
        p = m.position3D;
      }
      pos[i * 3] = p[0];
      pos[i * 3 + 1] = p[1];
      pos[i * 3 + 2] = p[2];

      const c = new THREE.Color(m.color);
      if (isLight) {
        c.multiplyScalar(0.7);
        col[i * 3] = Math.min(c.r, 0.9);
        col[i * 3 + 1] = Math.min(c.g, 0.9);
        col[i * 3 + 2] = Math.min(c.b, 0.9);
      } else {
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
      }
    });

    return { positions: pos, colors: col };
  }, [visible, navCategory, navSubCategory, isLight]);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    const index = event.index;
    if (index !== undefined && index >= 0 && index < visibleRef.current.length) {
      selectMemory(visibleRef.current[index]);
    }
  }, [selectMemory]);

  if (hideRawOnly) return null;

  return (
    <points key={`raw-${visible.length}-${navCategory || 'all'}-${navSubCategory || 'none'}-${theme}`} onClick={handleClick}>
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
        size={isLight ? 0.5 : 0.45}
        vertexColors
        blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={isLight ? 0.95 : 0.9}
        sizeAttenuation
      />
    </points>
  );
}

function InsightRings({ theme }: { theme: Theme }) {
  const { insightMemories, rawMemories, navCategory, navSubCategory, selectMemory, hideInsightOnly } = useAppState();
  const isLight = theme === 'light';

  const visibleInsights = useMemo(() => {
    if (!navCategory) return insightMemories;
    const categoryRawIds = new Set(
      rawMemories.filter(m => isMemoryInCategory(m, navCategory, navSubCategory)).map(m => m.id)
    );
    return insightMemories.filter(ins =>
      ins.sourceRawMemoryIds.some(id => categoryRawIds.has(id))
    );
  }, [insightMemories, rawMemories, navCategory, navSubCategory]);

  const handleInsightClick = useCallback((insight: InsightMemory) => (event: any) => {
    event.stopPropagation();
    event.nativeEvent?.stopPropagation();
    selectMemory(insight);
  }, [selectMemory]);

  if (hideInsightOnly) return null;

  const ringColor = isLight ? '#b8860b' : '#ffb800';
  const ringOpacity = isLight ? 0.85 : 0.7;

  return (
    <group key={`rings-${navCategory || 'all'}-${navSubCategory || 'none'}-${theme}`}>
      {visibleInsights.map(ins => {
        let position: [number, number, number];
        if (navCategory) {
          position = getInsightNavPosition(ins, navCategory, navSubCategory);
        } else {
          position = ins.position3D;
        }
        const pos = new THREE.Vector3(position[0], position[1], position[2]);
        const sz = ins.size * 0.4;
        return (
          <group key={ins.id}>
            <mesh position={pos} onClick={handleInsightClick(ins)}>
              <sphereGeometry args={[sz * 0.8, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthTest={false} />
            </mesh>
            <mesh position={pos}>
              <torusGeometry args={[sz * 0.6, 0.05, 16, 32]} />
              <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity} />
            </mesh>
            <mesh position={pos} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[sz * 0.6, 0.05, 16, 32]} />
              <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity * 0.6} />
            </mesh>
            <mesh position={pos} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[sz * 0.6, 0.05, 16, 32]} />
              <meshBasicMaterial color={ringColor} transparent opacity={ringOpacity * 0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function InsightNetworkLines({ theme }: { theme: Theme }) {
  const { insightMemories, rawMemories, navCategory, navSubCategory } = useAppState();
  const isLight = theme === 'light';

  const { positions, lines } = useMemo(() => {
    let visible: InsightMemory[];
    if (!navCategory) {
      visible = insightMemories;
    } else {
      const categoryRawIds = new Set(
        rawMemories.filter(m => isMemoryInCategory(m, navCategory, navSubCategory)).map(m => m.id)
      );
      visible = insightMemories.filter(ins =>
        ins.sourceRawMemoryIds.some(id => categoryRawIds.has(id))
      );
    }

    // Limit to prevent O(n²) explosion
    const maxInsights = 100;
    const limited = visible.length > maxInsights ? visible.slice(0, maxInsights) : visible;

    const posMap = new Map<string, [number, number, number]>();
    limited.forEach(ins => {
      if (navCategory) {
        posMap.set(ins.id, getInsightNavPosition(ins, navCategory, navSubCategory));
      } else {
        posMap.set(ins.id, ins.position3D);
      }
    });

    const causal: [THREE.Vector3, THREE.Vector3][] = [];
    const supporting: [THREE.Vector3, THREE.Vector3][] = [];
    const related: [THREE.Vector3, THREE.Vector3][] = [];

    const maxDist = 4;
    const maxDistSq = maxDist * maxDist;

    for (let i = 0; i < limited.length; i++) {
      const pa = posMap.get(limited[i].id)!;
      for (let j = i + 1; j < limited.length; j++) {
        const pb = posMap.get(limited[j].id)!;
        const dx = pa[0] - pb[0];
        const dy = pa[1] - pb[1];
        const dz = pa[2] - pb[2];
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq >= maxDistSq) continue;
        const dist = Math.sqrt(distSq);
        const va = new THREE.Vector3(pa[0], pa[1], pa[2]);
        const vb = new THREE.Vector3(pb[0], pb[1], pb[2]);
        if (dist < 2) causal.push([va, vb]);
        else if (dist < 3) supporting.push([va, vb]);
        else related.push([va, vb]);
      }
    }
    return { positions: posMap, lines: { causal, supporting, related } };
  }, [insightMemories, rawMemories, navCategory, navSubCategory]);

  const allPairs = isLight
    ? [
        { pairs: lines.causal, color: '#8b6914', opacity: 0.85 },
        { pairs: lines.supporting, color: '#9e7a20', opacity: 0.6 },
        { pairs: lines.related, color: '#3a5fa0', opacity: 0.45 },
      ]
    : [
        { pairs: lines.causal, color: '#ffb800', opacity: 0.5 },
        { pairs: lines.supporting, color: '#ffb800', opacity: 0.3 },
        { pairs: lines.related, color: '#66aaff', opacity: 0.25 },
      ];

  return (
    <group key={`lines-${navCategory || 'all'}-${navSubCategory || 'none'}-${theme}`}>
      {allPairs.map(({ pairs, color, opacity }, idx) => {
        if (pairs.length === 0) return null;
        const vertices: number[] = [];
        pairs.forEach(([a, b]) => {
          vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
        });
        return (
          <lineSegments key={`ls-${idx}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={vertices.length / 3}
                array={new Float32Array(vertices)}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={opacity} depthTest={false} />
          </lineSegments>
        );
      })}
    </group>
  );
}

function SceneLights({ theme }: { theme: Theme }) {
  const isLight = theme === 'light';
  return (
    <>
      <ambientLight intensity={isLight ? 0.9 : 0.6} />
      <pointLight position={[10, 10, 10]} intensity={isLight ? 0.6 : 0.8} color="#ffffff" />
      <pointLight position={[-8, -4, -6]} intensity={isLight ? 0.3 : 0.4} color="#4488ff" />
    </>
  );
}

function InteractionLoop() {
  const { invalidate, gl } = useThree();
  const isActiveRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastInteractionRef = useRef(0);

  const keepAlive = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      invalidate();
    }
  }, [invalidate]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointerdown', keepAlive);
    canvas.addEventListener('pointermove', keepAlive);
    canvas.addEventListener('wheel', keepAlive);
    window.addEventListener('demo-camera-move', keepAlive);

    return () => {
      canvas.removeEventListener('pointerdown', keepAlive);
      canvas.removeEventListener('pointermove', keepAlive);
      canvas.removeEventListener('wheel', keepAlive);
      window.removeEventListener('demo-camera-move', keepAlive);
      isActiveRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gl, keepAlive]);

  return null;
}

function DemoCameraController() {
  const { camera, invalidate } = useThree();
  const animatingRef = useRef(false);
  const angleRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMove = (e: any) => {
      if (e.detail?.action === 'rotate') {
        animatingRef.current = true;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          animatingRef.current = false;
        }, 5000);
        invalidate();
      }
    };
    window.addEventListener('demo-camera-move', handleMove);
    return () => {
      window.removeEventListener('demo-camera-move', handleMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [invalidate]);

  useFrame((_, delta) => {
    if (animatingRef.current) {
      angleRef.current += delta * 0.5;
      const radius = 8;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(angleRef.current) * radius, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, Math.cos(angleRef.current) * radius, 0.05);
      camera.lookAt(0, 0, 0);
      invalidate();
    }
  });

  return null;
}

const DEMO_PARTICLE_IDS = ['mem_007', 'insight_001', 'chatgpt_001', 'chatgpt_insight_001'];

function ParticlePositionProjector() {
  const { camera, gl } = useThree();
  const { rawMemories, insightMemories, navCategory, navSubCategory } = useAppState();

  useEffect(() => {
    const handler = () => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const positions: Record<string, { x: number; y: number }> = {};

      DEMO_PARTICLE_IDS.forEach(id => {
        const mem = rawMemories.find(m => m.id === id) || insightMemories.find(m => m.id === id);
        if (!mem) return;

        let pos: [number, number, number];
        if (navCategory) {
          if (mem.type === 'raw') {
            pos = getNavPosition(mem as RawMemory, navCategory, navSubCategory);
          } else {
            pos = getInsightNavPosition(mem as InsightMemory, navCategory, navSubCategory);
          }
        } else {
          pos = (mem as any).position3D;
        }

        const worldPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
        const screenPos = worldPos.clone().project(camera);
        const x = (screenPos.x * 0.5 + 0.5) * rect.width + rect.left;
        const y = (-screenPos.y * 0.5 + 0.5) * rect.height + rect.top;

        if (screenPos.z < 1) {
          positions[id] = { x, y };
        }
      });

      window.dispatchEvent(new CustomEvent('demo-particle-positions', { detail: positions }));
    };

    window.addEventListener('demo-request-particle-positions', handler);
    return () => window.removeEventListener('demo-request-particle-positions', handler);
  }, [camera, gl, rawMemories, insightMemories, navCategory, navSubCategory]);

  return null;
}

function ClusterTags({ theme, heldMemoryId }: { theme: Theme; heldMemoryId: string | null }) {
  const { rawMemories, navCategory, navSubCategory } = useAppState();
  const isLight = theme === 'light';

  const allRawMems = useMemo(() => {
    let mems = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
    if (navCategory) {
      mems = mems.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
    }
    return mems;
  }, [rawMemories, navCategory, navSubCategory]);

  const defaultTags = useMemo(() =>
    allRawMems
      .filter(m => m.dimensions.narrative.isMilestone || m.dimensions.value.importance >= 7)
      .slice(0, 5),
  [allRawMems]);

  const heldMem = useMemo(() =>
    heldMemoryId ? allRawMems.find(m => m.id === heldMemoryId) : null,
  [heldMemoryId, allRawMems]);

  const tagBg = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
  const tagColor = isLight ? '#555' : '#aaa';
  const tagBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
  const heldBg = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(10,16,31,0.92)';
  const heldColor = isLight ? '#fff' : '#ddd';
  const heldBorder = isLight ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)';

  const renderTag = (mem: RawMemory, isHeld: boolean) => {
    const position = navCategory
      ? getNavPosition(mem, navCategory, navSubCategory)
      : mem.position3D;
    const imageUrl = mem.dimensions.sensory.images?.[0];
    const isMilestone = mem.dimensions.narrative.isMilestone;

    return (
      <Html
        key={mem.id}
        position={position}
        sprite={!isHeld}
        center={!isHeld}
        distanceFactor={isHeld ? 20 : 8}
        occlude={false}
      >
        <div style={isHeld ? {
          background: heldBg,
          color: heldColor,
          fontSize: '11px',
          padding: '6px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          border: `1px solid ${heldBorder}`,
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backdropFilter: 'blur(8px)',
          maxWidth: '220px',
        } : {
          background: tagBg,
          color: tagColor,
          fontSize: '9px',
          padding: '1px 6px',
          borderRadius: '3px',
          whiteSpace: 'nowrap',
          border: `1px solid ${tagBorder}`,
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
        }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              style={{
                width: isHeld ? '32px' : '12px',
                height: isHeld ? '32px' : '12px',
                borderRadius: isHeld ? '4px' : '2px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}
          <span>{isMilestone && !isHeld ? '⭐ ' : ''}{mem.label.slice(0, isHeld ? 20 : 8)}</span>
        </div>
      </Html>
    );
  };

  return (
    <>
      {defaultTags.map(mem => renderTag(mem, false))}
      {heldMem && !defaultTags.find(t => t.id === heldMem.id) && renderTag(heldMem, true)}
    </>
  );
}

function HoldTagController({ onHoldChange }: { onHoldChange: (id: string | null) => void }) {
  const { camera, gl } = useThree();
  const { rawMemories, navCategory, navSubCategory } = useAppState();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerDown = useRef(false);
  const onHoldChangeRef = useRef(onHoldChange);
  onHoldChangeRef.current = onHoldChange;

  useEffect(() => {
    const canvas = gl.domElement;

    const getMemoryPositions = () => {
      let raws = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
      if (navCategory) {
        raws = raws.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
      }
      return raws.map(m => ({
        id: m.id,
        pos: new THREE.Vector3(...(navCategory
          ? getNavPosition(m, navCategory, navSubCategory)
          : m.position3D)),
      }));
    };

    const findNearest = (clientX: number, clientY: number): string | null => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);

      const memPositions = getMemoryPositions();
      let nearestId: string | null = null;
      let nearestDist = Infinity;

      memPositions.forEach(({ id, pos }) => {
        const dist = raycaster.ray.distanceToPoint(pos);
        if (dist < nearestDist && dist < 1.8) {
          nearestDist = dist;
          nearestId = id;
        }
      });

      return nearestId;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDown.current = true;
      holdTimer.current = setTimeout(() => {
        if (pointerDown.current) {
          const nearest = findNearest(e.clientX, e.clientY);
          onHoldChangeRef.current(nearest);
        }
      }, 400);
    };

    const handlePointerUp = () => {
      pointerDown.current = false;
      if (holdTimer.current !== null) {
        clearTimeout(holdTimer.current);
        holdTimer.current = null;
      }
      onHoldChangeRef.current(null);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
      if (holdTimer.current !== null) {
        clearTimeout(holdTimer.current);
      }
    };
  }, [camera, gl, rawMemories, navCategory, navSubCategory]);

  return null;
}

interface MemCloud3DProps {
  bgColor: string;
  theme: Theme;
}

export default function MemCloud3D({ bgColor, theme }: MemCloud3DProps) {
  const isLight = theme === 'light';
  const [heldClusterId, setHeldClusterId] = useState<string | null>(null);

  const handleHoldChange = useCallback((id: string | null) => {
    setHeldClusterId(id);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas
        id="mem-cloud-canvas"
        key={bgColor}
        camera={{ position: [0, 2, 8], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        dpr={[0.75, 1.5]}
        performance={{ min: 0.3 }}
        frameloop="demand"
        onCreated={({ gl }) => { gl.setClearColor(new THREE.Color(bgColor)); }}
        style={{ background: bgColor }}
      >
        <SceneLights theme={theme} />
        {!isLight && <Stars radius={30} depth={50} count={300} factor={3} saturation={0.2} speed={0.1} />}
        <ParticleCloud theme={theme} />
        <InsightNetworkLines theme={theme} />
        <InsightRings theme={theme} />
        <ClusterTags theme={theme} heldMemoryId={heldClusterId} />
        <HoldTagController onHoldChange={handleHoldChange} />
        <DemoCameraController />
        <ParticlePositionProjector />
        <InteractionLoop />
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