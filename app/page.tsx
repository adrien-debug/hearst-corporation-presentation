'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/book')
  }, [router])

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-display font-bold text-white tracking-[0.15em]">HEARST CORPORATION</div>
        <div className="w-32 h-[2px] bg-accent" />
        <p className="text-sm text-white/60 font-mono">Loading...</p>
      </div>
    </div>
  )
}
