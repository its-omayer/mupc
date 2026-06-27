import dynamic from 'next/dynamic'

const Hero3DScene = dynamic(() => import('./Hero3DScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 w-full h-full bg-[#0a0a0f]" />
})

export default function Hero3D() {
  return <Hero3DScene />
}
