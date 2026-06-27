"use client"

import React, { useRef, useState, useEffect, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

function CameraLens() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
      groupRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main lens body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 4, 32]} />
        <meshStandardMaterial color="#111118" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Gold front ring */}
      <mesh position={[0, 0, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.9, 1.9, 0.2, 32]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glass front */}
      <mesh position={[0, 0, 2.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.1, 32]} />
        <meshStandardMaterial color="#0a0a0f" metalness={1} roughness={0} transparent opacity={0.8} />
      </mesh>
      {/* Inner reflection */}
      <mesh position={[0, 0, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 0.1, 32]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Floating gold particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            ((i * 1.618) % 8) - 4,
            ((i * 2.718) % 8) - 4,
            ((i * 3.14) % 8) - 4,
          ]}
        >
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function HeroFallback() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#0a0a0f] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.08) 0%, rgba(10,10,15,0) 70%)',
        }}
      />
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: i % 5 === 0 ? 2 : 1,
            height: i % 5 === 0 ? 2 : 1,
            top: `${(i * 37.3) % 100}%`,
            left: `${(i * 61.8) % 100}%`,
            opacity: 0.3 + (i % 4) * 0.15,
          }}
        />
      ))}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 320,
          height: 320,
          borderRadius: '50%',
          border: '2px solid rgba(245,158,11,0.15)',
          boxShadow: '0 0 60px rgba(245,158,11,0.06)',
          animation: 'spin 20s linear infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid rgba(245,158,11,0.1)',
          animation: 'spin 14s linear infinite reverse',
        }}
      />
    </div>
  )
}

interface EBState { hasError: boolean }
class WebGLErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    return this.state.hasError ? <HeroFallback /> : this.props.children
  }
}

export default function Hero3DScene() {
  const [webgl, setWebgl] = useState<boolean | null>(null)

  useEffect(() => {
    setWebgl(checkWebGL())
  }, [])

  if (webgl === null) {
    return <div className="absolute inset-0 bg-[#0a0a0f]" />
  }

  if (!webgl) {
    return <HeroFallback />
  }

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <WebGLErrorBoundary>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={['#0a0a0f']} />
          <fog attach="fog" args={['#0a0a0f', 5, 20]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#f59e0b" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={2} color="#f59e0b" />
          <CameraLens />
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}
