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
  showLogo = false,
  topRight,
}: TwoColumnSlideProps) {
  return (
    <section className={`h-[100dvh] w-screen flex-shrink-0 ${backgroundClassName} flex relative overflow-hidden`}>
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className={`w-1.5 sm:w-2 ${sidebarClassName} flex-shrink-0 relative z-10`} />

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent z-10" />

      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-28 py-6 sm:py-10 relative z-10">
        <div className="mx-auto w-full max-w-[1400px]">

          <div className="mb-6 sm:mb-8 flex items-start gap-6">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold leading-[1.05]">
                <span className="text-accent-dark">{title.split(' ')[0]}</span>
                {title.split(' ').length > 1 && (
                  <span className="text-black"> {title.split(' ').slice(1).join(' ')}</span>
                )}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className={`w-16 sm:w-20 md:w-28 h-[3px] ${accentClassName} rounded-full`} />
                <div className="w-2 h-2 rounded-full bg-accent/40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            <div className="flex flex-col gap-5">{left}</div>
            <div className="flex flex-col gap-5 lg:border-l lg:border-hearst-100 lg:pl-12">{right}</div>
          </div>
        </div>
      </div>

      {topRight && (
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          {topRight}
        </div>
      )}

      <div className="absolute bottom-3 right-4 flex items-center gap-3 z-10">
        <img 
          src="/images/hearst-logo-green.svg" 
          alt="H" 
          className="w-5 sm:w-6 h-auto opacity-40"
        />
        {pageNumber && (
          <p className="text-[10px] font-mono tracking-wider text-hearst-300">
            {String(pageNumber).padStart(2, '0')}
          </p>
        )}
      </div>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono tracking-[0.25em] uppercase text-hearst-200 z-10">
        Confidential
      </p>
    </section>
  )
}
