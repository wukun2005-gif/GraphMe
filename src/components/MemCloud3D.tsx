import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppState } from '../store/AppContext';
import type { RawMemory, InsightMemory } from '../types';
import { isMemoryInCategory } from '../utils/navUtils';
import { computeDailyTrajectories } from '../utils/valueUtils';
import { EMOTION_COLORS } from '../types';

function createGlowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const glowTexture = createGlowTexture();

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


type Theme = 'dark' | 'light';

function ParticleCloud({ theme }: { theme: Theme }) {
  const { rawMemories, navCategory, navSubCategory, selectMemory, hideRawOnly, currentView, searchQuery, timeRangeFilter } = useAppState();
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

  console.log('[ParticleCloud] render', { timeRangeFilter, visibleCount: visible.length });

  const { positions, colors, sizes } = useMemo(() => {
    const mems = visible;
    console.log('[ParticleCloud] useMemo positions/colors/sizes', { mems: mems.length, hasFilter: !!timeRangeFilter });
    const pos = new Float32Array(mems.length * 3);
    const col = new Float32Array(mems.length * 3);
    const sz = new Float32Array(mems.length);

    mems.forEach((m, i) => {
      let p: [number, number, number];
      if (navCategory) {
        p = getNavPosition(m, navCategory, navSubCategory);
      } else {
        p = m.positions[currentView] || m.position3D;
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
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const haystack = `${m.id} ${m.label} ${m.summary}`.toLowerCase();
        const matches = q.split(/\s+/).filter(Boolean).every(kw => haystack.includes(kw));
        if (!matches) {
          col[i * 3] *= 0.2;
          col[i * 3 + 1] *= 0.2;
          col[i * 3 + 2] *= 0.2;
        }
      }

      const importance = m.dimensions.value.importance;
      const baseSize = 0.2 + importance * 0.6;
      const jitter = 0.8 + Math.random() * 0.4;
      let size = baseSize * jitter * (m.dimensions.narrative.isMilestone ? 1.5 : 1);

      // Time range filter: shrink and dim particles outside range
      if (timeRangeFilter) {
        const ts = m.dimensions.temporal.timestamp;
        const inRange = ts >= timeRangeFilter[0] && ts <= timeRangeFilter[1];
        if (!inRange) {
          size *= 0.4;
          col[i * 3] *= 0.15;
          col[i * 3 + 1] *= 0.15;
          col[i * 3 + 2] *= 0.15;
        }
      }

      sz[i] = size;
    });

    return { positions: pos, colors: col, sizes: sz };
  }, [visible, navCategory, navSubCategory, isLight, currentView, searchQuery, timeRangeFilter]);

  const handleClick = useCallback((event: any) => {
    event.stopPropagation();
    const index = event.index;
    if (index !== undefined && index >= 0 && index < visibleRef.current.length) {
      selectMemory(visibleRef.current[index]);
    }
  }, [selectMemory]);

  if (hideRawOnly) return null;

  return (
    <points key={`raw-${visible.length}-${navCategory || 'all'}-${navSubCategory || 'none'}-${currentView}-${timeRangeFilter ? 'filtered' : 'all'}`} onClick={handleClick}>
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
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isLight ? 0.5 : 0.45}
        map={glowTexture}
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
    <group key={`rings-${navCategory || 'all'}-${navSubCategory || 'none'}`}>
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

function RippleEffect({ theme }: { theme: Theme }) {
  const { selectedMemory, rawMemories, currentView } = useAppState();
  const isLight = theme === 'light';
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);
  const [relatedPositions, setRelatedPositions] = useState<[number, number, number][]>([]);

  useEffect(() => {
    if (!selectedMemory || selectedMemory.type !== 'raw') {
      setRelatedPositions([]);
      return;
    }
    const mem = selectedMemory as RawMemory;
    const storyline = mem.dimensions.narrative.storyline;
    const persons = new Set(mem.dimensions.social.persons);

    const related = rawMemories.filter(m => {
      if (m.id === mem.id) return false;
      if (storyline && m.dimensions.narrative.storyline === storyline) return true;
      if (persons.size > 0 && m.dimensions.social.persons.some(p => persons.has(p))) return true;
      return false;
    }).slice(0, 8);

    setRelatedPositions(related.map(m => m.positions[currentView] || m.position3D));
  }, [selectedMemory, rawMemories, currentView]);

  useFrame((_, delta) => {
    if (!selectedMemory || selectedMemory.type !== 'raw') return;
    timeRef.current += delta;

    // Pulse the glow sphere
    if (glowRef.current) {
      const scale = 1 + Math.sin(timeRef.current * 3) * 0.2;
      glowRef.current.scale.setScalar(scale);
    }

    // Expand the ring
    if (ringRef.current) {
      const ringScale = 1 + (timeRef.current % 2) * 0.8;
      ringRef.current.scale.setScalar(ringScale);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 0.4 - (timeRef.current % 2) * 0.2);
    }
  });

  if (!selectedMemory || selectedMemory.type !== 'raw') return null;
  const mem = selectedMemory as RawMemory;
  const pos = mem.positions[currentView] || mem.position3D;
  const position = new THREE.Vector3(pos[0], pos[1], pos[2]);
  const color = isLight ? '#0088cc' : '#00f2ff';

  return (
    <group>
      {/* Glow sphere at selected position */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Expanding ring */}
      <mesh ref={ringRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Ripple dots on related memories */}
      {relatedPositions.map((rp, i) => (
        <mesh key={i} position={new THREE.Vector3(rp[0], rp[1], rp[2])}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2 + Math.sin(timeRef.current * 2 + i) * 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function EmotionTrajectoryLines({ theme }: { theme: Theme }) {
  const { rawMemories, currentView } = useAppState();
  const isLight = theme === 'light';

  const trajectories = useMemo(() => computeDailyTrajectories(rawMemories), [rawMemories]);

  // Limit to recent trajectories to avoid visual clutter
  const recentTrajectories = useMemo(() => trajectories.slice(-7), [trajectories]);

  const lineData = useMemo(() => {
    const lines: { points: [number, number, number][]; fromColor: string; toColor: string; tooltip: string }[] = [];
    recentTrajectories.forEach(t => {
      t.pairs.forEach(pair => {
        const fromPos = pair.from.positions[currentView] || pair.from.position3D;
        const toPos = pair.to.positions[currentView] || pair.to.position3D;
        const fromColor = EMOTION_COLORS[pair.from.dimensions.emotional.primary] || '#888';
        const toColor = EMOTION_COLORS[pair.to.dimensions.emotional.primary] || '#888';

        // Create curved path via midpoint with vertical offset
        const mid: [number, number, number] = [
          (fromPos[0] + toPos[0]) / 2,
          (fromPos[1] + toPos[1]) / 2 + 0.5,
          (fromPos[2] + toPos[2]) / 2,
        ];

        lines.push({
          points: [fromPos, mid, toPos],
          fromColor,
          toColor,
          tooltip: `${t.date} ${pair.description}`,
        });
      });
    });
    return lines;
  }, [recentTrajectories, currentView]);

  if (lineData.length === 0) return null;

  return (
    <group>
      {lineData.map((line, i) => {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(...line.points[0]),
          new THREE.Vector3(...line.points[1]),
          new THREE.Vector3(...line.points[2]),
        );
        const points = curve.getPoints(16);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Vertex colors: from → to gradient
        const colors = new Float32Array(points.length * 3);
        const c1 = new THREE.Color(line.fromColor);
        const c2 = new THREE.Color(line.toColor);
        points.forEach((_, j) => {
          const t = j / (points.length - 1);
          const c = c1.clone().lerp(c2, t);
          colors[j * 3] = c.r;
          colors[j * 3 + 1] = c.g;
          colors[j * 3 + 2] = c.b;
        });
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const lineObj = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: isLight ? 0.3 : 0.25 }),
        );

        return <primitive key={i} object={lineObj} />;
      })}
    </group>
  );
}

function InsightNetworkLines({ theme }: { theme: Theme }) {
  const { insightMemories, rawMemories, navCategory, navSubCategory } = useAppState();
  const isLight = theme === 'light';

  // Step 1: Filter visible insights (lightweight, runs on nav switch)
  const filteredInsights = useMemo(() => {
    if (!navCategory) return insightMemories;
    const categoryRawIds = new Set(
      rawMemories.filter(m => isMemoryInCategory(m, navCategory, navSubCategory)).map(m => m.id)
    );
    return insightMemories.filter(ins =>
      ins.sourceRawMemoryIds.some(id => categoryRawIds.has(id))
    );
  }, [insightMemories, rawMemories, navCategory, navSubCategory]);

  // Step 2: Compute connection lines (expensive O(n²), only re-runs when filtered set changes)
  const { positions, lines } = useMemo(() => {
    const maxInsights = 100;
    const limited = filteredInsights.length > maxInsights ? filteredInsights.slice(0, maxInsights) : filteredInsights;

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

    const sourceIndex = new Map<string, number[]>();
    limited.forEach((ins, idx) => {
      ins.sourceRawMemoryIds.forEach(srcId => {
        if (!sourceIndex.has(srcId)) sourceIndex.set(srcId, []);
        sourceIndex.get(srcId)!.push(idx);
      });
    });

    const connectionMap = new Map<string, number>();
    sourceIndex.forEach(indices => {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          const key = `${Math.min(indices[i], indices[j])}-${Math.max(indices[i], indices[j])}`;
          connectionMap.set(key, (connectionMap.get(key) || 0) + 1);
        }
      }
    });

    connectionMap.forEach((sharedCount, key) => {
      const [iStr, jStr] = key.split('-');
      const i = parseInt(iStr), j = parseInt(jStr);
      const pa = posMap.get(limited[i].id)!;
      const pb = posMap.get(limited[j].id)!;
      const va = new THREE.Vector3(pa[0], pa[1], pa[2]);
      const vb = new THREE.Vector3(pb[0], pb[1], pb[2]);
      if (sharedCount >= 5) causal.push([va, vb]);
      else if (sharedCount >= 2) supporting.push([va, vb]);
      else related.push([va, vb]);
    });
    return { positions: posMap, lines: { causal, supporting, related } };
  }, [filteredInsights, navCategory, navSubCategory]);

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
    <group key={`lines-${navCategory || 'all'}-${navSubCategory || 'none'}`}>
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
  const { currentView, timeRangeFilter } = useAppState();

  const keepAlive = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!isActiveRef.current) {
      isActiveRef.current = true;
      invalidate();
    }
  }, [invalidate]);

  useEffect(() => {
    invalidate();
  }, [currentView, invalidate]);

  useEffect(() => {
    invalidate();
  }, [timeRangeFilter, invalidate]);

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

function CameraFlyTo() {
  const { selectedMemory, currentView } = useAppState();
  const { camera, invalidate } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!selectedMemory) {
      isAnimating.current = false;
      return;
    }
    const mem = selectedMemory;
    let pos: [number, number, number];
    if (mem.type === 'raw') {
      pos = mem.positions[currentView] || mem.position3D;
    } else {
      pos = mem.position3D;
    }
    targetPos.current.set(pos[0], pos[1], pos[2]);
    isAnimating.current = true;
    invalidate();
  }, [selectedMemory, currentView, invalidate]);

  useFrame(() => {
    if (!isAnimating.current) return;
    const dist = camera.position.distanceTo(targetPos.current);
    if (dist < 0.1) {
      isAnimating.current = false;
      return;
    }
    camera.position.lerp(
      new THREE.Vector3(
        targetPos.current.x + 2,
        targetPos.current.y + 1.5,
        targetPos.current.z + 3,
      ),
      0.04,
    );
    camera.lookAt(targetPos.current);
    invalidate();
  });

  return null;
}

function SearchFlyTo() {
  const { rawMemories, insightMemories, searchQuery, navCategory, navSubCategory, currentView } = useAppState();
  const { camera, invalidate } = useThree();
  const isAnimating = useRef(false);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!searchQuery) {
      isAnimating.current = false;
      return;
    }

    const q = searchQuery.toLowerCase();
    const keywords = q.split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      isAnimating.current = false;
      return;
    }

    const matchingPositions: THREE.Vector3[] = [];

    rawMemories.forEach(m => {
      if (m.type !== 'raw') return;
      const haystack = `${m.id} ${m.label} ${m.summary}`.toLowerCase();
      if (!keywords.every(kw => haystack.includes(kw))) return;
      let pos: [number, number, number];
      if (navCategory) {
        pos = getNavPosition(m, navCategory, navSubCategory);
      } else {
        pos = m.positions[currentView] || m.position3D;
      }
      matchingPositions.push(new THREE.Vector3(pos[0], pos[1], pos[2]));
    });

    insightMemories.forEach(ins => {
      const haystack = `${ins.id} ${ins.statement} ${ins.description}`.toLowerCase();
      if (!keywords.every(kw => haystack.includes(kw))) return;
      let pos: [number, number, number];
      if (navCategory) {
        pos = getInsightNavPosition(ins, navCategory, navSubCategory);
      } else {
        pos = ins.position3D;
      }
      matchingPositions.push(new THREE.Vector3(pos[0], pos[1], pos[2]));
    });

    if (matchingPositions.length === 0) {
      isAnimating.current = false;
      return;
    }

    const centroid = new THREE.Vector3();
    matchingPositions.forEach(p => centroid.add(p));
    centroid.divideScalar(matchingPositions.length);

    targetPos.current.copy(centroid);
    isAnimating.current = true;
    invalidate();
  }, [searchQuery, rawMemories, insightMemories, navCategory, navSubCategory, currentView, camera, invalidate]);

  useFrame(() => {
    if (!isAnimating.current) return;
    const dist = camera.position.distanceTo(targetPos.current);
    if (dist < 0.5) {
      isAnimating.current = false;
      return;
    }
    camera.position.lerp(
      new THREE.Vector3(
        targetPos.current.x + 3,
        targetPos.current.y + 2,
        targetPos.current.z + 4,
      ),
      0.04,
    );
    camera.lookAt(targetPos.current);
    invalidate();
  });

  return null;
}

const DEMO_PARTICLE_IDS = ['mem_007', 'insight_001', 'chatgpt_001', 'chatgpt_insight_001'];

function ParticlePositionProjector() {
  const { camera, gl } = useThree();
  const { rawMemories, insightMemories, navCategory, navSubCategory, currentView } = useAppState();

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
          pos = mem.type === 'raw'
            ? (mem as RawMemory).positions[currentView] || mem.position3D
            : (mem as any).position3D;
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
  }, [camera, gl, rawMemories, insightMemories, navCategory, navSubCategory, currentView]);

  return null;
}

function ClusterTags({ theme, heldMemoryId }: { theme: Theme; heldMemoryId: string | null }) {
  const { rawMemories, navCategory, navSubCategory, currentView } = useAppState();
  const isLight = theme === 'light';

  const allRawMems = useMemo(() => {
    let mems = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
    if (navCategory) {
      mems = mems.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
    }
    return mems;
  }, [rawMemories, navCategory, navSubCategory, currentView]);

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
      : mem.positions[currentView] || mem.position3D;
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

type HoverInfo = { id: string; x: number; y: number } | null;

function HoverDetector({ onHover }: { onHover: (info: HoverInfo) => void }) {
  const { camera, gl } = useThree();
  const { rawMemories, navCategory, navSubCategory, currentView } = useAppState();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => {
    const canvas = gl.domElement;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;
    let latestEvent: PointerEvent | null = null;

    const getMemoryPositions = () => {
      let raws = rawMemories.filter(m => m.type === 'raw') as RawMemory[];
      if (navCategory) {
        raws = raws.filter(m => isMemoryInCategory(m, navCategory, navSubCategory));
      }
      return raws.map(m => ({
        id: m.id,
        pos: new THREE.Vector3(...(navCategory
          ? getNavPosition(m, navCategory, navSubCategory)
          : m.positions[currentView] || m.position3D)),
      }));
    };

    const processHover = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);

      const memPositions = getMemoryPositions();
      let nearestId: string | null = null;
      let nearestDist = Infinity;

      memPositions.forEach(({ id, pos }) => {
        const dist = raycaster.ray.distanceToPoint(pos);
        if (dist < nearestDist && dist < 1.5) {
          nearestDist = dist;
          nearestId = id;
        }
      });

      if (nearestId) {
        onHover({ id: nearestId, x: e.clientX, y: e.clientY });
      } else {
        onHover(null);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      latestEvent = e;
      if (throttleTimer === null) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
          if (latestEvent) processHover(latestEvent);
        }, 100);
      }
    };

    const handlePointerLeave = () => {
      onHover(null);
      if (throttleTimer !== null) {
        clearTimeout(throttleTimer);
        throttleTimer = null;
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      if (throttleTimer !== null) clearTimeout(throttleTimer);
    };
  }, [camera, gl, rawMemories, navCategory, navSubCategory, currentView, raycaster, onHover]);

  return null;
}

function DustParticles({ theme }: { theme: Theme }) {
  const isLight = theme === 'light';

  const { positions, colors, sizes } = useMemo(() => {
    const count = 100;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const brightness = isLight ? 0.6 : 0.3;
      col[i * 3] = brightness;
      col[i * 3 + 1] = brightness;
      col[i * 3 + 2] = brightness + (isLight ? 0.1 : 0.2);

      sz[i] = 0.02 + Math.random() * 0.03;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [isLight]);

  const ref = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.001;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        map={glowTexture}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={isLight ? 0.15 : 0.25}
        sizeAttenuation
      />
    </points>
  );
}

function HoldTagController({ onHoldChange }: { onHoldChange: (id: string | null) => void }) {
  const { camera, gl } = useThree();
  const { rawMemories, navCategory, navSubCategory, currentView } = useAppState();
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
          : m.positions[currentView] || m.position3D)),
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
  }, [camera, gl, rawMemories, navCategory, navSubCategory, currentView]);

  return null;
}

function DynamicClearColor({ color }: { color: string }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setClearColor(new THREE.Color(color));
  }, [gl, color]);
  return null;
}

function OrbitControlsWithInvalidation(props: React.ComponentProps<typeof OrbitControls>) {
  const { invalidate } = useThree();
  return <OrbitControls {...props} onChange={() => invalidate()} />;
}

interface MemCloud3DProps {
  bgColor: string;
  theme: Theme;
}

export default function MemCloud3D({ bgColor, theme }: MemCloud3DProps) {
  const { rawMemories } = useAppState();
  const isLight = theme === 'light';
  const [heldClusterId, setHeldClusterId] = useState<string | null>(null);
  const [hovered, setHovered] = useState<HoverInfo>(null);
  const isDark = theme === 'dark';

  const handleHoldChange = useCallback((id: string | null) => {
    setHeldClusterId(id);
  }, []);

  const handleHover = useCallback((info: HoverInfo) => {
    setHovered(info);
  }, []);

  const hoveredMem = hovered ? rawMemories.find(m => m.id === hovered.id) : null;

  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas
        id="mem-cloud-canvas"
        camera={{ position: [0, 2, 8], fov: 60, near: 0.1, far: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        dpr={[0.75, 1.5]}
        performance={{ min: 0.3 }}
        style={{ background: bgColor }}
      >
        <DynamicClearColor color={bgColor} />
        <SceneLights theme={theme} />
        {!isLight && <Stars radius={30} depth={50} count={300} factor={3} saturation={0.2} speed={0.1} />}
        <DustParticles theme={theme} />
        <ParticleCloud theme={theme} />
        <InsightNetworkLines theme={theme} />
        <InsightRings theme={theme} />
        <RippleEffect theme={theme} />
        <EmotionTrajectoryLines theme={theme} />
        <ClusterTags theme={theme} heldMemoryId={heldClusterId} />
        <HoldTagController onHoldChange={handleHoldChange} />
        <HoverDetector onHover={handleHover} />
        <DemoCameraController />
        <CameraFlyTo />
        <SearchFlyTo />
        <ParticlePositionProjector />
        <InteractionLoop />
        <OrbitControlsWithInvalidation
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI * 0.75}
          target={[0, 0, 0]}
        />
      </Canvas>
      {hoveredMem && (
        <div
          className={`fixed px-3 py-2 rounded-lg shadow-lg border text-xs whitespace-nowrap pointer-events-none ${
            isDark ? 'bg-[#0d1525] border-[#ffffff10] text-gray-300' : 'bg-white border-gray-200 text-gray-700'
          }`}
          style={{ left: hovered!.x + 8, top: hovered!.y - 28, zIndex: 99999 }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: hoveredMem.color }} />
            <span className="font-medium">{hoveredMem.label}</span>
          </div>
          <div className={`mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {hoveredMem.dimensions.emotional.primary} · {hoveredMem.id}
          </div>
        </div>
      )}
    </div>
  );
}