'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TwoColumnSlide } from '@/components/book/TwoColumnSlide'

function OrientationOverlay() {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 1024
      const isPortrait = window.innerHeight > window.innerWidth
      setShowOverlay(isMobile && isPortrait)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!showOverlay) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-6">📱</div>
      <h2 className="text-2xl font-display font-bold text-white mb-4">Rotate Your Device</h2>
      <p className="text-lg text-hearst-400 max-w-xs">This presentation is optimized for landscape viewing.</p>
    </div>
  )
}

function PageNumber({ page, variant = 'dark' }: { page: number; variant?: 'light' | 'dark' }) {
  return (
    <>
      <div className="absolute bottom-3 right-4 flex items-center gap-3">
        <img
          src="/images/hearst-logo-green.svg"
          alt="H"
          className="w-5 sm:w-6 h-auto opacity-40"
        />
        <p className={`text-[10px] font-mono tracking-wider ${variant === 'light' ? 'text-white/40' : 'text-hearst-300'}`}>
          {String(page).padStart(2, '0')}
        </p>
      </div>
      <p className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-[0.25em] uppercase ${variant === 'light' ? 'text-white/15' : 'text-hearst-200'}`}>
        Confidential
      </p>
    </>
  )
}

function SectionCard({ icon, title, children, accent = false }: { icon?: string; title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${accent ? 'border-accent/30 bg-accent/[0.04]' : 'border-hearst-100 bg-hearst-50/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-sm sm:text-base font-bold text-accent-dark">{title}</p>
      </div>
      <div className="text-sm sm:text-base text-hearst-600 leading-[1.6]">{children}</div>
    </div>
  )
}

function SlideNav({ current, total, onGo }: { current: number; total: number; onGo: (i: number) => void }) {
  const progress = ((current + 1) / total) * 100
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none print:hidden">
      <div className="h-[2px] bg-hearst-100">
        <div className="h-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-center justify-center gap-1.5 py-2 pointer-events-auto">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-1.5 bg-accent'
                : 'w-1.5 h-1.5 bg-hearst-300 hover:bg-accent/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function BookContent() {
  const searchParams = useSearchParams()
  const isPrint = searchParams.get('print') !== null
  const totalPages = 20
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const goToSlide = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    const clamped = Math.max(0, Math.min(index, totalPages - 1))
    container.scrollTo({ left: clamped * container.clientWidth, behavior: 'smooth' })
  }, [totalPages])

  useEffect(() => {
    if (isPrint) return
    const container = containerRef.current
    if (!container) return

    const updateCurrent = () => {
      const slide = Math.round(container.scrollLeft / container.clientWidth)
      setCurrentSlide(slide)
    }

    let isScrolling = false
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isScrolling) return

      const delta = e.deltaX || e.deltaY
      if (Math.abs(delta) < 10) return

      isScrolling = true
      const slideWidth = container.clientWidth
      const cur = Math.round(container.scrollLeft / slideWidth)
      const next = delta > 0 ? cur + 1 : cur - 1
      const target = Math.max(0, Math.min(next * slideWidth, container.scrollWidth - slideWidth))

      container.scrollTo({ left: target, behavior: 'smooth' })
      setTimeout(() => { isScrolling = false }, 600)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const cur = Math.round(container.scrollLeft / container.clientWidth)
        goToSlide(cur + 1)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const cur = Math.round(container.scrollLeft / container.clientWidth)
        goToSlide(cur - 1)
      }
    }

    let touchStartX = 0
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.touches[0].clientX }
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartX - e.changedTouches[0].clientX
      if (Math.abs(diff) < 50) return
      const cur = Math.round(container.scrollLeft / container.clientWidth)
      goToSlide(diff > 0 ? cur + 1 : cur - 1)
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('scroll', updateCurrent, { passive: true })
    document.addEventListener('keydown', handleKeyDown)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('scroll', updateCurrent)
      document.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPrint, goToSlide])

  return (
    <>
      {!isPrint && <OrientationOverlay />}
      {isPrint && (
        <style>{`
          @page { margin: 0; size: 1920px 1080px; }
          #book-container { display: flex !important; flex-direction: column !important; height: auto !important; width: 1920px !important; overflow: visible !important; }
          #book-container > section { width: 1920px !important; height: 1080px !important; min-height: 1080px !important; max-height: 1080px !important; flex-shrink: 0 !important; overflow: hidden !important; }
          #book-container > section:not(:last-child) { break-after: page; page-break-after: always; }
          nextjs-portal { display: none !important; }
        `}</style>
      )}
      {!isPrint && <SlideNav current={currentSlide} total={totalPages} onGo={goToSlide} />}
      <div ref={containerRef} id="book-container" className={isPrint ? "flex flex-col" : "h-[100dvh] w-screen flex flex-row overflow-x-hidden overflow-y-hidden"} style={isPrint ? undefined : { WebkitOverflowScrolling: 'touch' }}>

        {/* ═══ PAGE 1 — COVER ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-accent/[0.02] to-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-[250px] sm:w-[350px] lg:w-[450px] h-auto opacity-[0.05]" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="absolute bottom-12 left-10 sm:bottom-20 sm:left-20 flex items-end gap-6">
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-[70px] sm:w-[100px] lg:w-[130px] h-auto" />
            <div className="flex flex-col gap-2 pb-1">
              <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-hearst-400 uppercase">Hearst Corporation</p>
              <div className="w-12 h-[2px] bg-accent rounded-full" />
            </div>
          </div>
          <div className="absolute bottom-12 right-10 sm:bottom-20 sm:right-20">
            <div className="w-16 h-[3px] bg-accent rounded-full" />
          </div>
        </section>

        {/* ═══ PAGE 2 — TITLE PAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 60%, rgba(167,251,144,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 20%, rgba(167,251,144,0.04) 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, rgba(167,251,144,0.03) 0%, transparent 50%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          <div className="flex flex-col items-center text-center px-8 relative z-10">
            <p className="text-[10px] sm:text-xs text-hearst-500 font-mono tracking-[0.5em] uppercase mb-8">Hearst Corporation</p>
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-[90px] sm:w-[120px] lg:w-[160px] h-auto" />
            <div className="flex items-center gap-4 my-8">
              <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-r from-transparent to-accent/60" />
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <div className="w-16 sm:w-24 h-[1px] bg-gradient-to-l from-transparent to-accent/60" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-[1.1]">
              <span className="text-accent">We Make</span> <span className="text-white">Crypto Mining</span><br />
              <span className="text-white">More </span><span className="text-accent">Sustainable</span>
            </h1>
            <p className="text-sm sm:text-lg text-hearst-400 font-light mt-8 tracking-wide">Mining Designed for Institutions</p>
            <p className="text-[9px] sm:text-[10px] text-hearst-600 font-mono tracking-[0.3em] mt-12 uppercase">Confidential</p>
          </div>
        </section>

        {/* ═══ PAGE 3 — ABOUT & MISSION ═══ */}
        <TwoColumnSlide
          kicker="01 — About Hearst Corporation"
          title="Mission & Vision"
          pageNumber={1}
          totalPages={totalPages}
          showLogo
          left={
            <>
              <p className="text-sm sm:text-base md:text-lg text-hearst-500 leading-[1.7]">
                Our mission is to create a <strong className="text-black">cleaner, smarter world</strong> by integrating renewable energy, responsible innovation, and game-changing technologies.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-hearst-500 leading-[1.7]">
                We aim to build a <strong className="text-black">strategic Bitcoin reserve</strong> that supports the growth of financial institutions, while advancing blockchain, AI, and sustainable finance solutions.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-hearst-500 leading-[1.7]">
                We are committed to transparency, sustainability, and technological excellence to empower the global transition to a <strong className="text-accent-dark">net-zero economy</strong>.
              </p>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-bold text-accent-dark mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Leadership
                </p>
                <div className="space-y-2.5 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Adrien Nejkovic</strong> — CEO</p>
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Loic Ricci</strong> — COO</p>
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Olivier Nejkovic</strong> — CIO</p>
                </div>
              </div>
              <div className="pt-3">
                <p className="text-sm sm:text-base font-bold text-accent-dark mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Global Presence
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Dubai, UAE</strong> — HQ</p>
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Nice, France</strong> — Europe</p>
                  <p className="text-sm sm:text-base text-hearst-500"><strong className="text-black">Hong Kong</strong> — APAC</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ PAGE 4 — KEY METRICS ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/book/key-metrics-hero-18k.png" 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-accent/[0.015]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-hearst-100 to-transparent" />

          <div className="relative z-10 w-full max-w-6xl px-8">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-accent-dark uppercase mb-3">At a Glance</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold">
                <span className="text-accent-dark">Key</span> <span className="text-black">Metrics</span>
              </h2>
              <div className="flex items-center justify-center gap-3 mt-5">
                <div className="w-16 h-[2px] bg-accent rounded-full" />
                <div className="w-2 h-2 rounded-full bg-accent/40" />
                <div className="w-16 h-[2px] bg-accent rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
              {[
                { value: '2022', label: 'Founded', icon: '🏢' },
                { value: '10,000', label: 'Miners', icon: '⛏️' },
                { value: '2 EH', label: 'Hashrate', icon: '⚡' },
                { value: '10', label: 'Countries', icon: '🌍' },
                { value: '10', label: 'Chains', icon: '🔗' },
                { value: '500+', label: 'BTC Mined', icon: '₿' },
              ].map(({ value, label, icon }) => (
                <div key={label} className="stat-card card-hover group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                    <span className="text-xl sm:text-2xl">{icon}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-accent-dark mb-1">{value}</p>
                  <p className="text-[9px] sm:text-[10px] text-hearst-400 font-mono tracking-[0.2em] uppercase">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <PageNumber page={2} />
        </section>

        {/* ═══ PAGE 5 — MINING-AS-A-SERVICE ═══ */}
        <TwoColumnSlide
          kicker="02 — Mining-as-a-Service"
          title="Mining Solutions"
          pageNumber={3}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                Designed for <strong className="text-black">banks, hedge funds, and financial institutions</strong>, our MaaS solution offers secure, scalable, and fully managed crypto mining operations.
              </p>
              <SectionCard icon="🔧" title="Hardware Supply">
                Through partnerships with Ice River and Bitmain, we select the best mining equipment guided by location, costs, climate, and regulations.
              </SectionCard>
              <SectionCard icon="🚚" title="Logistics & Deployment">
                From smooth delivery to on-site setup, we manage the entire process — from border regulations to deployment and long-term operation.
              </SectionCard>
            </>
          }
          right={
            <>
              <SectionCard icon="🏗️" title="Premium Hosting">
                Top hosting facilities worldwide with diverse, secure, reliable, and cost-effective solutions for electricity, hosting, and maintenance.
              </SectionCard>
              <SectionCard icon="📊" title="Operation Management">
                We take care of everything, from logistics to installation, ensuring miners are set up and optimized for performance.
              </SectionCard>
              <SectionCard icon="📱" title="Monitoring Dashboard" accent>
                Real-time data about cryptocurrency rewards and mining operations through our intuitive dashboard.
              </SectionCard>
            </>
          }
        />

        {/* ═══ PAGE 6 — HARDWARE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.02] via-transparent to-accent/[0.01]" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-hearst-100 to-transparent" />

          <div className="relative z-10 text-center px-8 w-full max-w-6xl">
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-accent-dark uppercase mb-3">Infrastructure</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2">
              <span className="text-accent-dark">Hardware</span> <span className="text-black">Partners</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3 mb-10 sm:mb-14">
              <div className="w-16 h-[2px] bg-accent rounded-full" />
              <div className="w-2 h-2 rounded-full bg-accent/40" />
              <div className="w-16 h-[2px] bg-accent rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-14 max-w-4xl mx-auto">
              {[
                { name: 'Bitmain', desc: 'S21+ · 216 Th/s', spec: 'SHA-256', perf: '16.5 J/TH' },
                { name: 'Bitmain', desc: 'S21 XP+ Hyd · 500 Th/s', spec: 'Hydro Cooling', perf: '12.0 J/TH' },
                { name: 'Ice River', desc: 'Multi-chain ASIC', spec: 'KAS / ALPH', perf: 'Next-Gen' },
              ].map(({ name, desc, spec, perf }, i) => (
                <div key={i} className="glass-card card-hover rounded-2xl px-6 py-6 text-center group">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                    <span className="text-lg">⚡</span>
                  </div>
                  <p className="text-[9px] text-accent-dark font-mono tracking-[0.25em] uppercase mb-2">{spec}</p>
                  <p className="text-xl sm:text-2xl font-display font-bold text-black mb-1 group-hover:text-accent-dark transition-colors">{name}</p>
                  <p className="text-xs text-hearst-400 font-mono mb-2">{desc}</p>
                  <div className="h-[1px] bg-hearst-100 my-3" />
                  <p className="text-[10px] text-accent-dark font-mono tracking-wider">{perf}</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-mono tracking-[0.4em] text-accent-dark uppercase mb-4">Supported Chains</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {['BTC', 'BCH', 'LTC', 'ALPH', 'KAS', 'DOGE', 'CKB'].map(coin => (
                <div key={coin} className="glass-card card-hover rounded-lg px-5 py-2.5">
                  <p className="text-xs sm:text-sm font-mono text-accent-dark font-bold tracking-wider">{coin}</p>
                </div>
              ))}
            </div>
          </div>
          <PageNumber page={4} />
        </section>

        {/* ═══ PAGE 7 — HEARST CONNECT ═══ */}
        <TwoColumnSlide
          kicker="03 — Hearst Connect"
          title="Institutional MaaS"
          pageNumber={5}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                Our mission is to give institutions <strong className="text-black">secure access to real Proof-of-Work yield</strong>. Tailor-made mining infrastructure enables partners to serve clients with transparent, scalable, and profitable DeFi-powered solutions.
              </p>
              <div>
                <p className="text-sm sm:text-base font-bold text-accent-dark mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  How It Works
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-500"><strong className="text-black">1. Design</strong> — Custom mining setups with full technical & financial modeling</p>
                  <p className="text-sm text-hearst-500"><strong className="text-black">2. Vault</strong> — Tiered vaults aligned to yield, duration, and performance</p>
                  <p className="text-sm text-hearst-500"><strong className="text-black">3. Deploy</strong> — Hearst sources, configures & hosts in energy-efficient DCs</p>
                </div>
              </div>
            </>
          }
          right={
            <>
              <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                <p className="text-sm text-hearst-500"><strong className="text-black">4. Yield</strong> — Daily rewards in native tokens or stablecoin equivalents</p>
                <p className="text-sm text-hearst-500"><strong className="text-black">5. Distribute</strong> — Computing power sold B2B, end users via Connect Wallet</p>
                <p className="text-sm text-hearst-500"><strong className="text-black">6. Dashboard</strong> — Real-time monitoring for partners & end users</p>
              </div>
              <SectionCard icon="🏦" title="Vancelian — PoW Yield Vaults" accent>
                4-year lock-up, 12% APR. 1,682 participants across 2 vaults. Vault 1 raised €2.0M in 7 hours, Vault 2 raised €5.0M.
              </SectionCard>
            </>
          }
        />

        {/* ═══ PAGE 8 — CONNECT FLOW ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(167,251,144,0.05) 0%, transparent 60%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="relative z-10 text-center px-8 w-full max-w-6xl">
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-accent uppercase mb-3">Pipeline</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              <span className="text-accent">Hearst</span> <span className="text-white">Connect Flow</span>
            </h2>
            <p className="text-sm text-white/40 font-mono mb-12 sm:mb-16">From design to distribution — 5 steps</p>

            <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-0">
              {[
                { step: 'Design', desc: 'Custom mining setup & financial modeling' },
                { step: 'Vault', desc: 'Tiered vaults aligned to yield & duration' },
                { step: 'Deploy', desc: 'Source, configure & host in green DCs' },
                { step: 'Yield', desc: 'Daily rewards in native tokens or stable' },
                { step: 'Distribute', desc: 'B2B power sales via Connect Wallet' },
              ].map(({ step, desc }, i) => (
                <div key={step} className="flex items-stretch">
                  <div className="glass-dark card-hover rounded-2xl px-5 py-5 sm:px-7 sm:py-6 text-center min-w-[130px] sm:min-w-[160px] flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full border border-accent/40 flex items-center justify-center mb-3">
                      <span className="text-accent font-mono font-bold text-sm">0{i + 1}</span>
                    </div>
                    <p className="text-white text-sm sm:text-base font-display font-bold mb-2">{step}</p>
                    <p className="text-white/40 text-[10px] sm:text-xs leading-snug max-w-[140px]">{desc}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden sm:flex items-center px-2">
                      <div className="w-6 h-[1px] bg-accent/30" />
                      <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-accent/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <PageNumber page={6} variant="light" />
        </section>

        {/* ═══ PAGE 9 — TECHNOLOGIES ═══ */}
        <TwoColumnSlide
          kicker="04 — Technologies"
          title="Monitoring & Analytics"
          pageNumber={7}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                <strong className="text-black">Cutting-edge tools</strong> to streamline, optimize, and enhance mining operations with seamless performance monitoring and actionable insights.
              </p>
              <SectionCard icon="📈" title="Real-Time Hashrate Tracking">
                Monitor mining efficiency and detect performance fluctuations instantly.
              </SectionCard>
              <SectionCard icon="💰" title="Revenue & Profitability Analytics">
                See earnings at a glance — daily, weekly, monthly — across crypto and fiat. Built-in profitability forecasts.
              </SectionCard>
            </>
          }
          right={
            <>
              <SectionCard icon="🏊" title="Mining Pool & Payouts">
                Full visibility into pool performance, submitted shares, and payout history.
              </SectionCard>
              <SectionCard icon="📦" title="Multi-Crypto Portfolio" accent>
                Bitcoin-first, soon multi-crypto. Dashboard supports BTC, LTC, Nervos, DOGE, ALPH, and KAS.
              </SectionCard>
              <SectionCard icon="🔍" title="Network & Difficulty Insights">
                Live updates on blockchain difficulty and network status. Predictive insights.
              </SectionCard>
            </>
          }
        />

        {/* ═══ PAGE 10 — BREAK ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(167,251,144,0.04) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="H" className="w-[200px] sm:w-[300px] h-auto opacity-[0.06]" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <PageNumber page={8} variant="light" />
        </section>

        {/* ═══ PAGE 11 — AI & ANALYTICS ═══ */}
        <TwoColumnSlide
          kicker="05 — AI & Predictive Analytics"
          title="AI-Powered Intelligence"
          pageNumber={9}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                <strong className="text-black">Advanced AI and predictive analytics</strong> to drive smarter decisions in crypto mining. Optimize operations, forecast market trends, and maintain peak performance.
              </p>
              <SectionCard icon="🎯" title="Market Price Forecast">
                Advanced AI models predicting market prices, mining difficulty, hash rates. Traditional analysis with cutting-edge ML.
              </SectionCard>
              <SectionCard icon="📡" title="Market Sentiment Analysis">
                Tracking social media, news, RSI and MACD signals. Real-time insights for proactive strategy.
              </SectionCard>
            </>
          }
          right={
            <>
              <SectionCard icon="⚙️" title="Operation Optimization">
                Data analytics to streamline logistics and hardware management. Reduced downtime, lower costs.
              </SectionCard>
              <SectionCard icon="🔮" title="Predictive Maintenance" accent>
                AI-powered equipment analysis to forecast failures. ML models trained on historical data.
              </SectionCard>
              <SectionCard icon="🖥️" title="Datacenter & AI Computing">
                Secure, scalable, energy-efficient datacenter solutions — powered by 100% Green Energy.
              </SectionCard>
            </>
          }
        />

        {/* ═══ PAGE 12 — BREAK ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-accent/[0.01]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="H" className="w-[200px] sm:w-[300px] h-auto opacity-[0.04]" />
          </div>
          <PageNumber page={10} />
        </section>

        {/* ═══ PAGE 13 — FACILITIES ═══ */}
        <TwoColumnSlide
          kicker="06 — Global Facilities"
          title="Infrastructure Worldwide"
          pageNumber={11}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                Mining facilities <strong className="text-black">strategically positioned</strong> across multiple regions to maximize cost-efficiency, energy sustainability, and regulatory compliance.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { flag: '🇰🇿', name: 'Kazakhstan', desc: 'Competitive energy' },
                  { flag: '🇧🇷', name: 'Brazil', desc: 'Renewable energy' },
                  { flag: '🇺🇸', name: 'United States', desc: 'Regulatory clarity' },
                  { flag: '🇳🇴', name: 'Norway', desc: '100% hydro' },
                ].map(({ flag, name, desc }) => (
                  <div key={name} className="border border-hearst-100 rounded-lg px-3 py-2.5 bg-hearst-50/50">
                    <p className="text-base mb-0.5">{flag} <span className="text-xs font-bold text-black">{name}</span></p>
                    <p className="text-[10px] text-hearst-400">{desc}</p>
                  </div>
                ))}
              </div>
            </>
          }
          right={
            <>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { flag: '🇴🇲', name: 'Oman', desc: 'Low-cost energy' },
                  { flag: '🇦🇪', name: 'UAE', desc: 'Strong backing' },
                  { flag: '🇪🇹', name: 'Ethiopia', desc: 'Abundant hydro' },
                  { flag: '🌍', name: '7 Locations', desc: 'Global reach' },
                ].map(({ flag, name, desc }) => (
                  <div key={name} className="border border-hearst-100 rounded-lg px-3 py-2.5 bg-hearst-50/50">
                    <p className="text-base mb-0.5">{flag} <span className="text-xs font-bold text-black">{name}</span></p>
                    <p className="text-[10px] text-hearst-400">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold text-accent-dark mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Due Diligence
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-accent/20">
                  <p className="text-xs sm:text-sm text-hearst-500"><strong className="text-black">300-Point</strong> Site Control</p>
                  <p className="text-xs sm:text-sm text-hearst-500"><strong className="text-black">On-Site</strong> Physical Audits</p>
                  <p className="text-xs sm:text-sm text-hearst-500"><strong className="text-black">AI Monitoring</strong> 24/7 Telemetry</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ PAGE 14 — GLOBAL MAP ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(167,251,144,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(167,251,144,0.03) 0%, transparent 50%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

          <div className="relative z-10 text-center px-8 w-full max-w-6xl">
            <p className="text-[10px] sm:text-xs font-mono tracking-[0.4em] text-accent uppercase mb-3">Network</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
              <span className="text-accent">Global</span> <span className="text-white">Mining Network</span>
            </h2>
            <p className="text-sm text-white/40 font-mono mb-10 sm:mb-14">7 countries · 4 continents · 100% operational</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-4xl mx-auto">
              {[
                { flag: '🇰🇿', name: 'Kazakhstan', energy: 'Competitive' },
                { flag: '🇧🇷', name: 'Brazil', energy: 'Renewable' },
                { flag: '🇺🇸', name: 'United States', energy: 'Regulated' },
                { flag: '🇳🇴', name: 'Norway', energy: '100% Hydro' },
                { flag: '🇴🇲', name: 'Oman', energy: 'Low-cost' },
                { flag: '🇦🇪', name: 'UAE', energy: 'Solar Hub' },
                { flag: '🇪🇹', name: 'Ethiopia', energy: 'Hydro Power' },
                { flag: '🌍', name: '7 Locations', energy: 'Worldwide' },
              ].map(({ flag, name, energy }) => (
                <div key={name} className="glass-dark card-hover rounded-2xl px-5 py-5 text-center group">
                  <p className="text-2xl sm:text-3xl mb-2">{flag}</p>
                  <p className="text-sm sm:text-base text-white font-display font-bold mb-1 group-hover:text-accent transition-colors">{name}</p>
                  <p className="text-[10px] text-accent/60 font-mono tracking-wider uppercase">{energy}</p>
                </div>
              ))}
            </div>
          </div>
          <PageNumber page={12} variant="light" />
        </section>

        {/* ═══ PAGE 15 — SUSTAINABILITY ═══ */}
        <TwoColumnSlide
          kicker="07 — Sustainability"
          title="Future of Mining"
          pageNumber={13}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                Transforming crypto mining with <strong className="text-black">clean energy</strong>, smart carbon solutions, and bold innovations. Backed by strategic partnerships with <strong className="text-accent-dark">Gigatons</strong> and <strong className="text-accent-dark">Gigatech</strong>.
              </p>
              <SectionCard icon="☀️" title="Solar Power — UAE's Largest Hub" accent>
                In partnership with Gigatons, building the largest solar farm in the UAE to power green crypto mining and AI computing.
              </SectionCard>
              <SectionCard icon="🔥" title="Flare Gas Recovery">
                Transforming flare gas — a byproduct of oil production — into energy for mining. Reducing harmful emissions.
              </SectionCard>
            </>
          }
          right={
            <>
              <SectionCard icon="🌱" title="Tokenized Carbon Credits">
                With Gigatech, leveraging blockchain for verified carbon reductions. Complete transparency — investors track impact in real-time.
              </SectionCard>
              <SectionCard icon="🚀" title="Space Mining">
                Pioneering space mining for valuable resources beyond Earth. Sustainable and innovative solutions for the future.
              </SectionCard>
              <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-4 text-center">
                <p className="text-sm sm:text-base font-display font-bold text-black leading-[1.8]">
                  Clean Energy × Innovation × Blockchain
                </p>
                <p className="text-xl sm:text-2xl font-display font-bold text-accent-dark mt-1">
                  = Net-Zero Mining
                </p>
              </div>
            </>
          }
        />

        {/* ═══ PAGE 16 — BREAK ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(167,251,144,0.04) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="H" className="w-[200px] sm:w-[300px] h-auto opacity-[0.06]" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
          <PageNumber page={14} variant="light" />
        </section>

        {/* ═══ PAGE 17 — PARTNERS ═══ */}
        <TwoColumnSlide
          kicker="08 — Ecosystem & Partners"
          title="Strategic Partners"
          pageNumber={15}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-500 leading-[1.7]">
                Our partners are at the forefront of innovation, driving <strong className="text-black">sustainable solutions</strong> in the cryptocurrency mining industry.
              </p>
              <SectionCard icon="🏦" title="Vancelian" accent>
                PoW Yield Vaults — institutional-grade DeFi mining. €7M raised, 1,682 participants.
              </SectionCard>
              <SectionCard icon="⛓️" title="Alephium">
                Next-gen Layer 1 — energy-efficient Proof-of-Less-Work mining.
              </SectionCard>
              <SectionCard icon="💎" title="SwissBorg">
                Crypto wealth management — strategic partnership for institutional mining.
              </SectionCard>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-bold text-accent-dark mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Hardware Partners
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-500"><strong className="text-black">Bitmain</strong> — S21+, S21 XP+ Hydro</p>
                  <p className="text-sm text-hearst-500"><strong className="text-black">Ice River</strong> — Multi-chain ASIC innovation</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm sm:text-base font-bold text-accent-dark mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Sustainability Partners
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-500"><strong className="text-black">Gigatons</strong> — UAE&apos;s largest solar-powered mining hub</p>
                  <p className="text-sm text-hearst-500"><strong className="text-black">Gigatech</strong> — Blockchain-verified carbon offset</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ PAGE 18 — BREAK ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-transparent to-accent/[0.01]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="H" className="w-[200px] sm:w-[300px] h-auto opacity-[0.04]" />
          </div>
          <PageNumber page={16} />
        </section>

        {/* ═══ PAGE 19 — PRE-CLOSING ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(167,251,144,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(167,251,144,0.03) 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, rgba(167,251,144,0.03) 0%, transparent 40%)' }} />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

          <div className="flex flex-col items-center text-center px-8 relative z-10">
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-[80px] sm:w-[110px] lg:w-[150px] h-auto mb-6" />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-accent/60" />
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-accent/60" />
            </div>
            <p className="text-[10px] sm:text-xs text-hearst-500 font-mono tracking-[0.5em] uppercase mb-4">Hearst Corporation</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1]">
              <span className="text-accent">We Make</span> <span className="text-white">Crypto Mining</span><br />
              <span className="text-white">More </span><span className="text-accent">Sustainable</span>
            </h2>
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-accent/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-accent/40" />
            </div>
            <p className="text-xs sm:text-sm text-hearst-500 font-mono tracking-wider mt-8">hearstcorporation.io</p>
          </div>
        </section>

        {/* ═══ PAGE 20 — CLOSING ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-accent/[0.02] to-white" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-[250px] sm:w-[350px] lg:w-[450px] h-auto opacity-[0.05]" />
          </div>
          <div className="absolute bottom-12 right-10 sm:bottom-20 sm:right-20 flex items-center gap-4">
            <img src="/images/hearst-logo-green.svg" alt="Hearst" className="w-12 sm:w-16 md:w-20 h-auto opacity-50" />
          </div>
          <div className="absolute bottom-12 left-10 sm:bottom-20 sm:left-20">
            <div className="w-16 h-[3px] bg-accent rounded-full" />
          </div>
        </section>

      </div>
    </>
  )
}

export default function BookPage() {
  return (
    <Suspense>
      <BookContent />
    </Suspense>
  )
}
