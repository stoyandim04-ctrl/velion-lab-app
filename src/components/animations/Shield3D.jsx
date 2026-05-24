import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from '../../lib/animations.js'

// Lightweight 3D shield. Uses a simple octahedron with a subtle bevel —
// no external GLB loading, ~no bundle penalty beyond three.js itself.
// The shape suggests "shield" without needing a custom mesh asset.

function ShieldMesh({ reduced }) {
  const meshRef = useRef(null)
  useFrame((_, delta) => {
    if (!meshRef.current || reduced) return
    meshRef.current.rotation.y += delta * 0.35
  })
  return (
    <mesh ref={meshRef} rotation={[0.1, 0, 0]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#FF6A00"
        emissive="#FF6A00"
        emissiveIntensity={0.35}
        metalness={0.45}
        roughness={0.35}
      />
    </mesh>
  )
}

export default function Shield3D({ size = 96 }) {
  const reduced = useReducedMotion()
  return (
    <div
      style={{ width: size, height: size }}
      className="relative mx-auto"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 3, 4]} intensity={1.4} color="#FFB070" />
        <directionalLight position={[-3, -1, 2]} intensity={0.55} color="#FF6A00" />
        <Suspense fallback={null}>
          <ShieldMesh reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  )
}
