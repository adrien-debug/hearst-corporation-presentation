import type { ReactNode } from 'react'

type TwoColumnSlideProps = {
  kicker: string
  title: string
  left: ReactNode
  right: ReactNode
  backgroundClassName?: string
  backgroundImage?: string
  sidebarClassName?: string
  accentClassName?: string
  pageNumber?: number
  totalPages?: number
  showLogo?: boolean
  topRight?: ReactNode
}

export function TwoColumnSlide({
  kicker,
  title,
  left,
  right,
  backgroundClassName = 'bg-white',
  backgroundImage,
  sidebarClassName = 'bg-black',
  accentClassName = 'bg-accent',
  pageNumber,
  totalPages,
  showLogo = false,
  topRight,
}: TwoColumnSlideProps) {
  return (
    <section className={`h-[100dvh] w-screen flex-shrink-0 ${backgroundClassName} flex relative overflow-hidden`}>
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage || '/images/book/break-black-1.png'}
          alt=""
          className="w-full h-full object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      <div className={`w-1.5 sm:w-2 ${sidebarClassName} flex-shrink-0 relative z-10`}>
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-accent/10" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent z-10" />

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-28 py-6 sm:py-10 relative z-10">
        <div className="mx-auto w-full max-w-[1400px]">

          <div className="mb-8 sm:mb-10 flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {showLogo && (
                  <img
                    src="/images/hearst-logo-green.svg"
                    alt="Hearst"
                    className="w-7 sm:w-9 h-auto"
                  />
                )}
                <p className="text-[10px] sm:text-xs text-accent-dark font-mono tracking-[0.35em] uppercase">
                  {kicker}
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-semibold leading-[1.05]">
                <span className="text-accent-dark">{title.split(' ')[0]}</span>
                {title.split(' ').length > 1 && (
                  <span className="text-hearst-500"> {title.split(' ').slice(1).join(' ')}</span>
                )}
              </h2>
              <div className="flex items-center gap-3 mt-5">
                <div className={`w-16 sm:w-24 md:w-32 h-[3px] ${accentClassName} rounded-full`} />
                <div className="w-2 h-2 rounded-full bg-accent/50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14 items-start">
            <div className="flex flex-col gap-5">{left}</div>
            <div className="flex flex-col gap-5 lg:border-l lg:border-hearst-100/60 lg:pl-14">{right}</div>
          </div>
        </div>
      </div>

      {topRight && (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          {topRight}
        </div>
      )}

      <div className="absolute bottom-4 right-5 sm:bottom-5 sm:right-6 flex items-center gap-2.5 z-10 print:hidden">
        <div className="h-[1px] w-6 bg-hearst-200" />
        {pageNumber && (
          <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.15em] text-hearst-500">
            {String(pageNumber).padStart(2, '0')}
            <span className="text-hearst-300"> / {totalPages ?? 21}</span>
          </p>
        )}
      </div>

      <div className="absolute bottom-4 left-5 sm:bottom-5 sm:left-6 flex items-center gap-2 z-10 print:hidden">
        <img
          src="/images/hearst-logo-green.svg"
          alt="H"
          className="w-4 sm:w-5 h-auto opacity-30"
        />
        <p className="text-[8px] font-mono tracking-[0.25em] uppercase text-hearst-200">
          Confidential
        </p>
      </div>
    </section>
  )
}
