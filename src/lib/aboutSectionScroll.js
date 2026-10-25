/** Punkt zatrzymania / hash — środek `.about__inner` na środku okna (z uwzględnieniem navbara). */
export function getAboutSectionScrollY(section, scrollY = window.scrollY) {
  const header = document.querySelector('header')
  const headerBottom = header ? Math.max(0, header.getBoundingClientRect().bottom) : 0
  const vh = window.innerHeight
  const inner = section.querySelector('.about__inner') ?? section
  const innerRect = inner.getBoundingClientRect()
  const innerTop = innerRect.top + scrollY
  const innerHeight = innerRect.height
  return innerTop + innerHeight / 2 - (vh + headerBottom) / 2
}

/** scroll-margin-top sekcji `#o-nas`, żeby natywny hash trafił w ten sam punkt co kółko. */
export function getAboutScrollMarginTop(section, scrollY = window.scrollY) {
  const sectionTop = section.getBoundingClientRect().top + scrollY
  const targetY = getAboutSectionScrollY(section, scrollY)
  return sectionTop - targetY
}
