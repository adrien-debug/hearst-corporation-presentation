'use client'

import { TwoColumnSlide } from '@/components/book/TwoColumnSlide'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

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

function PageNumber({ page, total, variant = 'dark' }: { page: number; total: number; variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark'
  return (
    <>
      <div className="absolute bottom-4 right-5 sm:bottom-5 sm:right-6 flex items-center gap-2.5 print:hidden">
        <div className={`h-[1px] w-6 ${isDark ? 'bg-hearst-200' : 'bg-white/20'}`} />
        <p className={`text-[10px] sm:text-[11px] font-mono tracking-[0.15em] ${isDark ? 'text-hearst-400' : 'text-white/50'}`}>
          {String(page).padStart(2, '0')}
          <span className={`${isDark ? 'text-hearst-200' : 'text-white/20'}`}> / {total}</span>
        </p>
      </div>
      <div className="absolute bottom-4 left-5 sm:bottom-5 sm:left-6 flex items-center gap-2 print:hidden">
        <img
          src="/images/hearst-logo-green.svg"
          alt="H"
          className="w-4 sm:w-5 h-auto opacity-30"
        />
        <p className={`text-[8px] font-mono tracking-[0.25em] uppercase ${isDark ? 'text-hearst-200' : 'text-white/20'}`}>
          Confidential
        </p>
      </div>
    </>
  )
}

function SectionCard({ icon, title, children, accent = false }: { icon?: string; title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={accent ? 'section-card-accent' : 'section-card'}>
      <div className="flex items-center gap-2.5 mb-2.5">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-sm sm:text-base font-semibold text-black">{title}</p>
      </div>
      <div className="text-sm sm:text-base text-hearst-700 leading-[1.7]">{children}</div>
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
            className={`rounded-full transition-all duration-300 ${i === current
              ? 'w-6 h-1.5 bg-accent'
              : 'w-1.5 h-1.5 bg-hearst-300 hover:bg-accent/50'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

type StoredSlide = {
  id: string
  type: string
  title: string
  backgroundImage?: string
}

type CustomSlideData = {
  id: string
  type: 'custom-image' | 'custom-text'
  title: string
  kicker: string
  backgroundImage: string
  subtitle: string
  bodyText: string
  insertAfter: string
}

function useEditorConfig() {
  const [bgMap, setBgMap] = useState<Record<string, string>>({})
  const [customSlides, setCustomSlides] = useState<CustomSlideData[]>([])
  const [order, setOrder] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hearst-slides-config')
      if (stored) {
        const slides: StoredSlide[] = JSON.parse(stored)
        const map: Record<string, string> = {}
        slides.forEach(s => { if (s.backgroundImage) map[s.id] = s.backgroundImage })
        setBgMap(map)
        setOrder(slides.map(s => s.id))
      }
    } catch { /* fallback */ }
    try {
      const cs = localStorage.getItem('hearst-custom-slides')
      if (cs) setCustomSlides(JSON.parse(cs))
    } catch { /* fallback */ }
  }, [])

  return { bgMap, customSlides, order }
}

function CustomImageSlide({ slide, page, total }: { slide: CustomSlideData; page: number; total: number }) {
  return (
    <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
      <div className="absolute inset-0">
        <img src={`/images/book/${slide.backgroundImage}`} alt={slide.title} className="w-full h-full object-cover" />
      </div>
      <PageNumber page={page} total={total} variant="light" />
    </section>
  )
}

function CustomTextSlide({ slide, page, total }: { slide: CustomSlideData; page: number; total: number }) {
  return (
    <TwoColumnSlide
      kicker={slide.kicker || slide.title}
      title={slide.title}
      pageNumber={page}
      totalPages={total}
      backgroundImage={slide.backgroundImage ? `/images/book/${slide.backgroundImage}` : undefined}
      left={
        <>
          {slide.subtitle && (
            <p className="text-sm sm:text-base font-semibold text-black mb-3">{slide.subtitle}</p>
          )}
          <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">{slide.bodyText}</p>
        </>
      }
      right={<></>}
    />
  )
}

function BookContent() {
  const searchParams = useSearchParams()
  const isPrint = searchParams.get('print') !== null
  const { bgMap, customSlides } = useEditorConfig()
  const bg = (slideId: string, fallback: string) => bgMap[slideId] ? `/images/book/${bgMap[slideId]}` : fallback

  const allCustomContent = customSlides.map(cs => ({ ...cs }))
  const totalPages = 29 + allCustomContent.length
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
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            @page { margin: 0; size: 1920px 1080px; }
            #book-container { display: flex !important; flex-direction: column !important; height: auto !important; width: 1920px !important; overflow: visible !important; }
            #book-container > section { width: 1920px !important; height: 1080px !important; min-height: 1080px !important; max-height: 1080px !important; flex-shrink: 0 !important; overflow: hidden !important; }
            #book-container > section:not(:last-child) { break-after: page; page-break-after: always; }
            nextjs-portal { display: none !important; }
          ` }}
        />
      )}
      {!isPrint && <SlideNav current={currentSlide} total={totalPages} onGo={goToSlide} />}
      <div ref={containerRef} id="book-container" className={isPrint ? "flex flex-col" : "h-[100dvh] w-screen flex flex-row overflow-x-hidden overflow-y-hidden"} style={isPrint ? undefined : { WebkitOverflowScrolling: 'touch' }}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 1 — COVER (WHITE)                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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
          <PageNumber page={1} total={totalPages} />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 2 — TITLE                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/images/book/break-black-1.png" alt="" className="w-full h-full object-cover opacity-[0.06]" />
          </div>
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
              <span className="text-accent text-glow-accent">We Make</span> <span className="text-white">Crypto Mining</span><br />
              <span className="text-white">More </span><span className="text-accent text-glow-accent">Sustainable</span>
            </h1>
            <p className="text-sm sm:text-lg text-hearst-400 font-light mt-8 tracking-wide">Mining Designed for Institutions</p>
          </div>
          <PageNumber page={2} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 3 — IMAGE: KEY METRICS                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s3', '/images/book/key-metrics-gemini.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={3} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 4 — 01: IDENTITY & MISSION                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="01 — About Hearst Corporation"
          title="Identity & Mission"
          pageNumber={4}
          totalPages={totalPages}
          showLogo
          left={
            <>
              <p className="text-sm sm:text-base md:text-lg text-hearst-700 leading-[1.7]">
                Our mission is to create a <strong className="text-black">cleaner, smarter world</strong> by integrating renewable energy, responsible innovation, and game-changing technologies.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-hearst-700 leading-[1.7]">
                We aim to build a <strong className="text-black">strategic Bitcoin reserve</strong> that supports the growth of financial institutions, while advancing blockchain, AI, and sustainable finance solutions.
              </p>
              <p className="text-sm sm:text-base md:text-lg text-hearst-700 leading-[1.7]">
                We are committed to transparency, sustainability, and technological excellence to empower the global transition to a <strong className="text-accent-dark">net-zero economy</strong>.
              </p>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Core Capabilities
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Computing Infrastructure</strong> — National-scale compute, mining, and data center projects</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Digital Asset Strategy</strong> — Institutional-grade mining and digital reserve acquisition</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Innovation Ecosystem</strong> — Technology districts, incubation, and PPP frameworks</p>
                </div>
              </div>
              <div className="pt-3">
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Leadership
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Adrien Nejkovic</strong> — CEO</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Loic Ricci</strong> — COO</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Olivier Nejkovic</strong> — CIO</p>
                </div>
              </div>
              <div className="pt-3">
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Global Presence
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Dubai, UAE</strong> — HQ</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Nice, France</strong> — Europe</p>
                  <p className="text-sm sm:text-base text-hearst-700"><strong className="text-black">Hong Kong</strong> — APAC</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 5 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s5', '/images/book/key-metrics-hero-4k.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={5} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 6 — 02: MINING SOLUTIONS                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="02 — Mining-as-a-Service"
          title="Mining Solutions"
          pageNumber={6}
          totalPages={totalPages}
          backgroundImage="/images/book/mining-solutions-gemini.png"
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
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

        {/* ═══ SLIDE 7 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s7', '/images/book/mining-solutions-gemini.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={7} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 8 — 03: HEARST CONNECT                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="03 — Hearst Connect"
          title="Institutional MaaS"
          pageNumber={8}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                Our mission is to give institutions <strong className="text-black">secure access to real Proof-of-Work yield</strong>. Tailor-made mining infrastructure enables partners to serve clients with transparent, scalable, and profitable DeFi-powered solutions.
              </p>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  How It Works
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-700"><strong className="text-black">1. Design</strong> — Custom mining setups with full technical & financial modeling</p>
                  <p className="text-sm text-hearst-700"><strong className="text-black">2. Vault</strong> — Tiered vaults aligned to yield, duration, and performance</p>
                  <p className="text-sm text-hearst-700"><strong className="text-black">3. Deploy</strong> — Hearst sources, configures & hosts in energy-efficient DCs</p>
                </div>
              </div>
            </>
          }
          right={
            <>
              <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                <p className="text-sm text-hearst-700"><strong className="text-black">4. Yield</strong> — Daily rewards in native tokens or stablecoin equivalents</p>
                <p className="text-sm text-hearst-700"><strong className="text-black">5. Distribute</strong> — Computing power sold B2B, end users via Connect Wallet</p>
                <p className="text-sm text-hearst-700"><strong className="text-black">6. Dashboard</strong> — Real-time monitoring for partners & end users</p>
              </div>
              <SectionCard icon="🏦" title="Vancelian — PoW Yield Vaults" accent>
                4-year lock-up, 12% APR. 1,682 participants across 2 vaults. Vault 1 raised €2.0M in 7 hours, Vault 2 raised €5.0M.
              </SectionCard>
            </>
          }
        />

        {/* ═══ SLIDE 9 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s9', '/images/book/connect-flow-gemini.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={9} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 10 — 04: DIGITAL ASSET STRATEGY                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="04 — Digital Asset Strategy"
          title="Digital Asset Strategy"
          pageNumber={10}
          totalPages={totalPages}
          left={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Core Thesis</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Nations and institutions with energy abundance acquire digital assets through mining at <strong className="text-black">structural discount to market</strong>. This is manufacturing, not speculation. Multi-generational horizon transforms mining into a compounding acquisition program.
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  <strong className="text-black">Mining as Acquisition:</strong> energy cost to digital asset conversion at below-market rates.
                </p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  <strong className="text-black">Reserve Management:</strong> institutional custody, multi-sig governance, sovereign-grade auditing.
                </p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  <strong className="text-black">Energy Optimization:</strong> mining as flexible load — absorbs surplus, releases during peak.
                </p>
              </div>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Key Pillars</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Foundational strategic elements underpinning the institutional digital asset acquisition program.
                </p>
              </div>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Strategic Arbitrage:</strong> mining vs spot purchase with fixed costs, no market timing risk.
              </p>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Geopolitical Positioning:</strong> optionality in international trade settlement.
              </p>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Regulatory Framework:</strong> full compliance with AML/CTF standards and clear legal classification.
              </p>
            </>
          }
        />

        {/* ═══ SLIDE 11 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s11', '/images/book/connect-flow-4k.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={11} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 12 — 05: MONITORING & ANALYTICS                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="05 — Technologies"
          title="Monitoring & Analytics"
          pageNumber={12}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
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

        {/* ═══ SLIDE 13 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s13', '/images/book/break-black-2.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={13} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 14 — 06: FRONTIER AI INFRASTRUCTURE                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="06 — AI Infrastructure Vertically Integrated"
          title="Frontier AI Infrastructure"
          pageNumber={14}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                A <strong className="text-black">vertically integrated platform</strong> at the intersection of high-performance GPU compute, enterprise model training, and advanced AI research — from raw compute to production-grade AI systems.
              </p>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Agentic Compute Layer</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Next-gen cloud GPU platform. Instant deployment of any AI workload with secure, per-second billing across NVIDIA GPUs — from cost-effective L4s to cutting-edge B300s.
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Data Sovereignty</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Full control over data. Zero vendor lock-in, deploy anywhere: cloud, on-premises, edge, or on-device.
                </p>
              </div>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Key Capabilities</p>
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Instant Deployment:</strong> production-ready LLM servers in under 3 seconds via vLLM, SGLang, Ollama, TGI.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Full AI Lifecycle:</strong> inference, creative generation, fine-tuning, experimentation, distributed training.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Scalable to 512 GPUs:</strong> single-GPU experimentation to 512x B200 clusters with high-speed interconnects.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Decentralized Architecture:</strong> hardware owners participate in the compute ecosystem, expanding capacity beyond traditional data centers.
                  </p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 15 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s15', '/images/book/ai-infrastructure-hero.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={15} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 16 — 07: B2B MODEL TRAINING                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="07 — Enterprise AI Services"
          title="B2B Model Training Platform"
          pageNumber={16}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                Rather than offering a fixed catalogue, the platform works directly with enterprise customers to <strong className="text-black">build, fine-tune, and deploy domain-specific AI systems</strong> tailored to their workflows, data, and compliance requirements.
              </p>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Enterprise Training Pipeline</p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Discovery & Scoping:</strong> forward-deployed AI engineers identify high-value use cases, assess data readiness, define performance targets.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Custom Fine-Tuning:</strong> LoRA, QLoRA, full-parameter, RLHF, DPO — adapts models on customer data within their security perimeter.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Evaluation & Alignment:</strong> domain-specific benchmarks, red-teaming, safety guardrails, human-in-the-loop alignment.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Deployment & Optimization:</strong> quantization, distillation, inference optimization with ongoing monitoring.
                  </p>
                </div>
              </div>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Open-Source Foundation Models</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7] mb-3">
                  Built on the world&apos;s best open-source models. Model-agnostic, always the best architecture for the task.
                </p>
                <div className="space-y-2">
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Llama 4 (Meta):</strong> Scout & Maverick variants, frontier multimodal, up to 10M token context, mixture-of-experts.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">DeepSeek V3 / R1:</strong> reasoning-optimized, exceptional multilingual and code generation at a fraction of proprietary cost.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Qwen 3 (Alibaba):</strong> 0.6B to 235B parameters, best-in-class multilingual, hybrid thinking, agentic tool use.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Kimi K2.5:</strong> 1T total parameters (32B active), 384 experts, Agent Swarm coordinating 100+ parallel sub-agents.
                  </p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 17 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s17', '/images/book/b2b-training-hero.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={17} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 18 — 08: PHYSICAL AI                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="08 — Frontier Research Physical AI"
          title="Beyond Language, Physical Intelligence"
          pageNumber={18}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                An active <strong className="text-black">frontier research program</strong> focused on AI systems that move beyond language into physical intelligence, real-time decision-making, and autonomous action.
              </p>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">World Models</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Systems that learn rich internal representations of how the physical world works: physics, spatial relationships, causality, temporal dynamics. Applications: autonomous driving, robotics, digital twins.
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Vision-Language-Action Models</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  At the convergence of perception, language understanding, and physical action. Unified models following complex multi-step instructions in dynamic environments.
                </p>
              </div>
            </>
          }
          right={
            <>
              <div>
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Action Models</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Translating world model outputs into precise, executable behaviors.
                </p>
                <div className="space-y-2 mt-3">
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Sim-to-Real Transfer:</strong> bridging synthetic training data and real-world variability.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Multi-Task Generalization:</strong> broad task repertoire without retraining for each scenario.
                  </p>
                  <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                    <strong className="text-black">Safety-Critical Control:</strong> bounded, predictable autonomous action — healthcare, logistics, defense.
                  </p>
                </div>
              </div>
              <div className="section-card-accent rounded-xl p-4 text-center glow-accent">
                <p className="text-sm sm:text-base font-display font-bold text-black leading-[1.8]">
                  World Models × VLA × Action Models
                </p>
                <p className="text-xl sm:text-2xl font-display font-bold text-accent-dark mt-1 text-glow-accent">
                  = Physical AI at Enterprise Scale
                </p>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 19 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s19', '/images/book/physical-ai-hero.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={19} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 20 — 09: GLOBAL FACILITIES                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="09 — Global Facilities"
          title="Infrastructure Worldwide"
          pageNumber={20}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                Mining facilities <strong className="text-black">strategically positioned</strong> across multiple regions to maximize cost-efficiency, energy sustainability, and regulatory compliance.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { flag: '🇰🇿', name: 'Kazakhstan', desc: 'Competitive energy' },
                  { flag: '🇧🇷', name: 'Brazil', desc: 'Renewable energy' },
                  { flag: '🇺🇸', name: 'United States', desc: 'Regulatory clarity' },
                  { flag: '🇳🇴', name: 'Norway', desc: '100% hydro' },
                ].map(({ flag, name, desc }) => (
                  <div key={name} className="section-card rounded-lg px-3 py-2.5">
                    <p className="text-base mb-0.5">{flag} <span className="text-xs font-bold text-black">{name}</span></p>
                    <p className="text-[10px] text-hearst-500">{desc}</p>
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
                  <div key={name} className="section-card rounded-lg px-3 py-2.5">
                    <p className="text-base mb-0.5">{flag} <span className="text-xs font-bold text-black">{name}</span></p>
                    <p className="text-[10px] text-hearst-500">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-sm font-semibold text-black mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Due Diligence
                </p>
                <div className="space-y-1.5 pl-4 border-l-2 border-accent/20">
                  <p className="text-xs sm:text-sm text-hearst-700"><strong className="text-black">300-Point</strong> Site Control</p>
                  <p className="text-xs sm:text-sm text-hearst-700"><strong className="text-black">On-Site</strong> Physical Audits</p>
                  <p className="text-xs sm:text-sm text-hearst-700"><strong className="text-black">AI Monitoring</strong> 24/7 Telemetry</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 21 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s21', '/images/book/global-map-final.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={21} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 22 — 10: SUSTAINABILITY                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="10 — Sustainability & Green Commitment"
          title="Sustainable Infrastructure"
          pageNumber={22}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                Transforming crypto mining with <strong className="text-black">clean energy</strong>, smart carbon solutions, and bold innovations. Backed by strategic partnerships with <strong className="text-accent-dark">Gigatons</strong> and <strong className="text-accent-dark">Gigatech</strong>.
              </p>
              <SectionCard icon="☀️" title="Solar Power — Largest Hub" accent>
                Building the largest solar farm to power green crypto mining and AI computing. Carbon-optimized data centers exceeding international ESG benchmarks.
              </SectionCard>
              <SectionCard icon="🔥" title="Flare Gas Recovery">
                Transforming flare gas — a byproduct of oil production — into energy for mining. Reducing harmful emissions while monetizing waste.
              </SectionCard>
            </>
          }
          right={
            <>
              <SectionCard icon="🌱" title="Tokenized Carbon Credits">
                Leveraging blockchain for verified carbon reductions. Complete transparency — investors track impact in real-time.
              </SectionCard>
              <SectionCard icon="❄️" title="Ultra-Efficient Cooling">
                Liquid immersion, direct-to-chip cooling, and seawater-assisted systems delivering 60–80% reductions in cooling energy and water usage.
              </SectionCard>
              <div className="section-card-accent rounded-xl p-4 text-center glow-accent">
                <p className="text-sm sm:text-base font-display font-bold text-black leading-[1.8]">
                  Clean Energy × Innovation × Blockchain
                </p>
                <p className="text-xl sm:text-2xl font-display font-bold text-accent-dark mt-1 text-glow-accent">
                  = Net-Zero Mining
                </p>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 23 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s23', '/images/book/mining-solutions-gemini.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={23} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 24 — 11: STRATEGIC TECH SECTORS                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="11 — Priority Sectors"
          title="Strategic Technology Sectors"
          pageNumber={24}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Green Patents & Sustainable Innovation:</strong> IP portfolios in cooling tech, carbon capture, renewables. Long-term licensing revenue.
              </p>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Robotics & Automation:</strong> industrial and infrastructure applications. Reduce labor dependence for data center operations. Export potential across global markets.
              </p>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Cybersecurity:</strong> defensive capabilities for infrastructure and technology security. Exportable commercial services. High-value employment.
              </p>
            </>
          }
          right={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">Defense Tech & AI Dual-Use:</strong> autonomous systems, predictive intelligence, advanced communications. National security capability.
              </p>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                <strong className="text-black">FinTech & Asset Tokenization:</strong> real-world asset tokenization — real estate, infrastructure, commodities. Regulatory sandbox integration.
              </p>
              <div className="pt-3">
                <p className="text-sm sm:text-base font-semibold text-black mb-3">Market Opportunity</p>
                <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
                  Multi-trillion dollar global market transformation. Positioned as a leader in emerging technology sectors.
                </p>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 25 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s25', '/images/book/strategic-tech-hero.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={25} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 26 — 12: STRATEGIC PARTNERS                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <TwoColumnSlide
          kicker="12 — Ecosystem & Partners"
          title="Strategic Partners"
          pageNumber={26}
          totalPages={totalPages}
          left={
            <>
              <p className="text-sm sm:text-base text-hearst-700 leading-[1.7]">
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
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Hardware Partners
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-700"><strong className="text-black">Bitmain</strong> — S21+, S21 XP+ Hydro</p>
                  <p className="text-sm text-hearst-700"><strong className="text-black">Ice River</strong> — Multi-chain ASIC innovation</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm sm:text-base font-semibold text-black mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                  Sustainability Partners
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-accent/20">
                  <p className="text-sm text-hearst-700"><strong className="text-black">Gigatons</strong> — Largest solar-powered mining hub</p>
                  <p className="text-sm text-hearst-700"><strong className="text-black">Gigatech</strong> — Blockchain-verified carbon offset</p>
                </div>
              </div>
            </>
          }
        />

        {/* ═══ SLIDE 27 — IMAGE ═══ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative bg-black overflow-hidden">
          <div className="absolute inset-0">
            <img src={bg('s27', '/images/book/connect-flow-final.png')} alt="" className="w-full h-full object-cover" />
          </div>
          <PageNumber page={27} total={totalPages} variant="light" />
        </section>

        {/* ═══ CUSTOM SLIDES ═══ */}
        {allCustomContent.map((cs, i) => (
          cs.type === 'custom-image'
            ? <CustomImageSlide key={cs.id} slide={cs} page={28 + i} total={totalPages} />
            : <CustomTextSlide key={cs.id} slide={cs} page={28 + i} total={totalPages} />
        ))}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 28 — PRE-CLOSING                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="h-[100dvh] w-screen flex-shrink-0 scroll-slide relative flex items-center justify-center bg-black overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/images/book/break-black-1.png" alt="" className="w-full h-full object-cover opacity-[0.06]" />
          </div>
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
              <span className="text-accent text-glow-accent">We Make</span> <span className="text-white">Crypto Mining</span><br />
              <span className="text-white">More </span><span className="text-accent text-glow-accent">Sustainable</span>
            </h2>
            <div className="flex items-center gap-4 mt-8">
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-r from-transparent to-accent/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
              <div className="w-12 sm:w-20 h-[1px] bg-gradient-to-l from-transparent to-accent/40" />
            </div>
            <p className="text-xs sm:text-sm text-hearst-500 font-mono tracking-wider mt-8">hearstcorporation.io</p>
          </div>
          <PageNumber page={28} total={totalPages} variant="light" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* SLIDE 29 — COVER CLOSING                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
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
          <PageNumber page={29} total={totalPages} />
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
