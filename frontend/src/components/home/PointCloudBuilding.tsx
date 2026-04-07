"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Generate points on a sphere surface (globe)
function generateGlobePoints(count: number, radius: number) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }
  return new Float32Array(positions);
}

// Generate points along latitude/longitude grid lines
function generateGridLines(radius: number) {
  const positions = [];
  const segments = 120;
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = ((90 - lat) * Math.PI) / 180;
    for (let i = 0; i < segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
  }
  for (let lon = 0; lon < 360; lon += 20) {
    const theta = (lon * Math.PI) / 180;
    for (let i = 0; i < segments; i++) {
      const phi = (i / segments) * Math.PI;
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
  }
  return new Float32Array(positions);
}

// Convert lat/lon to 3D position on sphere
function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Generate connection arc as array of Vector3 (for traveling pulses)
function generateArcPath(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  radius: number, arcHeight: number, pointCount: number
): THREE.Vector3[] {
  const start = latLonToVec3(lat1, lon1, radius);
  const end = latLonToVec3(lat2, lon2, radius);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius + arcHeight);

  const path: THREE.Vector3[] = [];
  for (let i = 0; i <= pointCount; i++) {
    const t = i / pointCount;
    const mt = 1 - t;
    path.push(
      new THREE.Vector3(
        mt * mt * start.x + 2 * mt * t * mid.x + t * t * end.x,
        mt * mt * start.y + 2 * mt * t * mid.y + t * t * end.y,
        mt * mt * start.z + 2 * mt * t * mid.z + t * t * end.z
      )
    );
  }
  return path;
}

// Generate arc points as flat array for static rendering
function generateArcFlat(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
  radius: number, arcHeight: number, pointCount: number
) {
  const path = generateArcPath(lat1, lon1, lat2, lon2, radius, arcHeight, pointCount);
  const positions: number[] = [];
  path.forEach((v) => positions.push(v.x, v.y, v.z));
  return positions;
}

// Generate orbital ring points
function generateRing(radius: number, tilt: number, count: number) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * Math.sin(tilt) * radius * 0.1;
    const z = Math.sin(angle) * radius;
    positions.push(x, y, z);
  }
  return positions;
}

// Connection definitions
const CONNECTIONS = [
  { from: [40, -74], to: [51, 0], h: 1.2 },
  { from: [51, 0], to: [28, 77], h: 1.5 },
  { from: [28, 77], to: [35, 139], h: 1.0 },
  { from: [35, 139], to: [-33, 151], h: 1.8 },
  { from: [40, -74], to: [-23, -46], h: 1.3 },
  { from: [55, 37], to: [1, 103], h: 1.6 },
  { from: [37, -122], to: [22, 114], h: 2.0 },
  { from: [48, 2], to: [-1, 36], h: 1.1 },
];

const CITIES = [
  [40, -74], [51, 0], [28, 77], [35, 139], [-33, 151],
  [-23, -46], [55, 37], [1, 103], [37, -122], [22, 114],
  [48, 2], [-1, 36],
];

// ---- Traveling pulse that jumps along an arc path ----
function TravelingPulse({
  path,
  speed,
  delay,
  color,
}: {
  path: THREE.Vector3[];
  speed: number;
  delay: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Points>(null);
  const trailPositions = useRef(new Float32Array(10 * 3));

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const progress = ((t * speed + delay) % 1);
    const idx = Math.floor(progress * (path.length - 1));
    const frac = progress * (path.length - 1) - idx;
    const nextIdx = Math.min(idx + 1, path.length - 1);

    const x = path[idx].x + (path[nextIdx].x - path[idx].x) * frac;
    const y = path[idx].y + (path[nextIdx].y - path[idx].y) * frac;
    const z = path[idx].z + (path[nextIdx].z - path[idx].z) * frac;
    meshRef.current.position.set(x, y, z);

    const pulse = 0.8 + Math.sin(t * 8) * 0.3;
    meshRef.current.scale.setScalar(pulse);

    if (trailRef.current) {
      const tp = trailPositions.current;
      for (let i = tp.length - 3; i >= 3; i -= 3) {
        tp[i] = tp[i - 3];
        tp[i + 1] = tp[i - 2];
        tp[i + 2] = tp[i - 1];
      }
      tp[0] = x;
      tp[1] = y;
      tp[2] = z;
      trailRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.95} />
      </mesh>
      <Points ref={trailRef} positions={trailPositions.current} stride={3} frustumCulled={false}>
        <PointMaterial transparent color={color} size={0.03} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.6} />
      </Points>
    </>
  );
}

// ---- Pulsing ring at city hotspot ----
function CityPulseRing({ position, color }: { position: THREE.Vector3; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 3 + position.x * 10) * 0.4;
    ringRef.current.scale.setScalar(scale);
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.6 - Math.sin(t * 3 + position.x * 10) * 0.3;
  });

  return (
    <mesh ref={ringRef} position={position}>
      <ringGeometry args={[0.08, 0.12, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

// ---- Interactive surface points with mouse ripple ----
function InteractiveSurface({ radius }: { radius: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer, camera } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const sphereRef = useRef(new THREE.Sphere(new THREE.Vector3(), radius));
  const mouseWorld = useRef(new THREE.Vector3());

  const count = 3000;
  const basePositions = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      p.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
    }
    return new Float32Array(p);
  }, [radius]);

  const positions = useMemo(() => new Float32Array(basePositions), [basePositions]);

  useFrame(() => {
    if (!pointsRef.current) return;
    raycaster.current.setFromCamera(pointer, camera);
    const hit = raycaster.current.ray.intersectSphere(sphereRef.current, mouseWorld.current);
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const rippleRadius = 0.8;
    const rippleStrength = 0.3;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];
      if (hit) {
        const dx = bx - mouseWorld.current.x;
        const dy = by - mouseWorld.current.y;
        const dz = bz - mouseWorld.current.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < rippleRadius) {
          const factor = 1 - dist / rippleRadius;
          const push = factor * factor * rippleStrength;
          posArray[i * 3] = bx + (bx / radius) * push;
          posArray[i * 3 + 1] = by + (by / radius) * push;
          posArray[i * 3 + 2] = bz + (bz / radius) * push;
        } else {
          posArray[i * 3] = bx; posArray[i * 3 + 1] = by; posArray[i * 3 + 2] = bz;
        }
      } else {
        posArray[i * 3] = bx; posArray[i * 3 + 1] = by; posArray[i * 3 + 2] = bz;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#B99B7B" size={0.02} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.7} />
    </Points>
  );
}

// Floating ambient particles
function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = [];
    for (let i = 0; i < 600; i++) {
      p.push((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12);
    }
    return new Float32Array(p);
  }, []);
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.02; });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#D9BB9B" size={0.02} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
    </Points>
  );
}

function HolographicGlobe() {
  const globeRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const globeRadius = 2.4;
  const gridPoints = useMemo(() => generateGridLines(globeRadius), []);
  const arcPoints = useMemo(() => {
    const arcs: number[] = [];
    CONNECTIONS.forEach((c) => { arcs.push(...generateArcFlat(c.from[0], c.from[1], c.to[0], c.to[1], globeRadius, c.h, 60)); });
    return new Float32Array(arcs);
  }, []);
  const arcPaths = useMemo(() => CONNECTIONS.map((c) => generateArcPath(c.from[0], c.from[1], c.to[0], c.to[1], globeRadius, c.h, 80)), []);
  const cityPositions = useMemo(() => CITIES.map(([lat, lon]) => latLonToVec3(lat, lon, globeRadius * 1.01)), []);
  const hotspotPoints = useMemo(() => { const p: number[] = []; cityPositions.forEach((v) => p.push(v.x, v.y, v.z)); return new Float32Array(p); }, [cityPositions]);
  const ringPoints = useMemo(() => {
    return {
      ring1: new Float32Array(generateRing(globeRadius + 0.6, 0.3, 200)),
      ring2: new Float32Array(generateRing(globeRadius + 1.0, -0.5, 150)),
      ring3: new Float32Array(generateRing(globeRadius + 1.4, 0.8, 120)),
    };
  }, []);

  const { pointer } = useThree();
  const rotationVelocity = useRef({ x: 0, y: 0 });
  const baseRotation = useRef({ x: 0.15, y: 0 });

  useFrame((state) => {
    if (!globeRef.current) return;
    const t = state.clock.getElapsedTime();
    rotationVelocity.current.x = THREE.MathUtils.lerp(rotationVelocity.current.x, -pointer.y * 0.6 + 0.15, 0.04);
    rotationVelocity.current.y = THREE.MathUtils.lerp(rotationVelocity.current.y, pointer.x * 1.2, 0.04);
    baseRotation.current.y += 0.003;
    globeRef.current.rotation.y = baseRotation.current.y + rotationVelocity.current.y;
    globeRef.current.rotation.x = rotationVelocity.current.x;
    if (pulseRef.current) pulseRef.current.scale.setScalar(globeRadius * (1 + Math.sin(t * 2) * 0.03));
  });

  const pulseColors = ["#B99B7B", "#D9BB9B", "#F5E6D3", "#8B7355", "#B99B7B", "#D9BB9B", "#B99B7B", "#D9BB9B"];

  return (
    <group ref={globeRef}>
      <mesh ref={pulseRef} scale={[globeRadius, globeRadius, globeRadius]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#D9BB9B" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      <mesh scale={[globeRadius, globeRadius, globeRadius]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#B99B7B" wireframe transparent opacity={0.15} />
      </mesh>
      <Points positions={gridPoints} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#B99B7B" size={0.012} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
      </Points>
      <InteractiveSurface radius={globeRadius} />
      <Points positions={arcPoints} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#8B7355" size={0.02} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </Points>
      
      {arcPaths.map((path, i) => (
        <React.Fragment key={i}>
          <TravelingPulse path={path} speed={0.25 + i * 0.03} delay={i * 0.12} color={pulseColors[i]} />
          <TravelingPulse path={[...path].reverse()} speed={0.2 + i * 0.02} delay={i * 0.15 + 0.5} color={pulseColors[(i + 3) % pulseColors.length]} />
        </React.Fragment>
      ))}

      <Points positions={hotspotPoints} stride={3} frustumCulled={false}>
        <PointMaterial transparent color="#ffffff" size={0.08} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </Points>
      {cityPositions.map((pos, i) => (
        <CityPulseRing key={i} position={pos} color={i % 2 === 0 ? "#B99B7B" : "#D9BB9B"} />
      ))}

      <group rotation={[0.4, 0, 0.2]}>
        <Points positions={ringPoints.ring1} stride={3} frustumCulled={false}>
          <PointMaterial transparent color="#D9BB9B" size={0.015} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
        </Points>
      </group>
      <group rotation={[-0.3, 0.5, -0.1]}>
        <Points positions={ringPoints.ring2} stride={3} frustumCulled={false}>
          <PointMaterial transparent color="#B99B7B" size={0.012} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.4} />
        </Points>
      </group>
      <group rotation={[0.6, -0.3, 0.4]}>
        <Points positions={ringPoints.ring3} stride={3} frustumCulled={false}>
          <PointMaterial transparent color="#8B7355" size={0.01} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.3} />
        </Points>
      </group>
    </group>
  );
}

export const PointCloudBuilding = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50, near: 0.1, far: 100 }}
        style={{ cursor: "grab" }}
      >
        <ambientLight intensity={0.5} />
        <HolographicGlobe />
        <FloatingParticles />
      </Canvas>
    </div>
  );
};
