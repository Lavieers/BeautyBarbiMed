import { useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import salonImage from '../assets/salon.webp'
import { useContactInfo, useSection } from '../content/context'
import { sectionDefaults } from '../data/defaults'
import Icon from './Icon'
import { getAboutScrollMarginTop } from '../lib/aboutSectionScroll'
import './About.scss'

const aboutCopy = {
  lead:
    'Beauty Barbi Med tworzą dwie specjalistki: Barbara - pielęgniarka i ekspertka mezoterapii igłowej, oraz Klaudia - stylistka brwi i rzęs. Łączymy świadomą pielęgnację z indywidualną opieką, więc zawsze wiesz, kto się Tobą zajmuje.',
  paragraph:
    'Bezpieczeństwo i precyzja są dla nas najważniejsze. Pracujemy na certyfikowanych preparatach, w kameralnej atmosferze i z pełną troską o Twój komfort.',
}

function resolveAboutCopy(about, hero) {
  const fallback = sectionDefaults.about
  const sameAsHero = about.titleLead?.trim() === hero.titleLead?.trim() && about.titleAccent?.trim() === hero.titleAccent?.trim()
  return sameAsHero ? { ...about, titleLead: fallback.titleLead, titleAccent: fallback.titleAccent } : about
}

function About() {
  const reduced = useReducedMotion()
  const about = useSection('about')
  const hero = useSection('hero')
  const content = useMemo(() => resolveAboutCopy(about, hero), [about, hero])
  const contact = useContactInfo()
  const [locationStreet, ...locationCityParts] = (contact.address || 'ul. Eugeniusza Romera 30, 20-487 Lublin').split(', ')
  const locationCity = locationCityParts.join(', ')
  const reveal = (delay = 0) => reduced ? {} : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: .85, delay, ease: [.22, 1, .36, 1] } }
  const imageReveal = reduced ? {} : { initial: { opacity: 0, scale: 1.06 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 1.1, ease: [.22, 1, .36, 1] } }

  useEffect(() => {
    const section = document.getElementById('o-nas')
    if (!section) return undefined

    const syncScrollMargin = () => {
      section.style.scrollMarginTop = `${getAboutScrollMarginTop(section)}px`
    }

    syncScrollMargin()
    const ro = new ResizeObserver(syncScrollMargin)
    ro.observe(section)
    const header = document.querySelector('header')
    if (header) ro.observe(header)
    window.addEventListener('resize', syncScrollMargin)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncScrollMargin)
    }
  }, [])

  return <section className="about" id="o-nas" aria-labelledby="about-title"><div className="about__inner">
    <motion.div className="about__visual" {...reveal()}>
      <div className="about__frame"><motion.img src={salonImage} loading="lazy" decoding="async" alt={content.imageAlt || 'Gabinet Beauty Barbi Med w Lublinie'} {...imageReveal} /></div>
      <motion.a className="about__location-card" href="#kontakt" aria-label="Przejdź do sekcji kontakt z mapą lokalizacji Beauty Barbi Med" {...reveal(.25)}>
        <Icon name="pin" className="about__location-pin" /><strong>Odwiedź nas</strong><span>{locationStreet}<br />{locationCity}</span><i aria-hidden="true" /><b>Zobacz mapę&nbsp; →</b>
      </motion.a>
    </motion.div>
    <div className="about__body">
      <div className="about__copy">
        <motion.h2 id="about-title" className="about__title" {...reveal(.05)}>{content.titleLead} <span>{content.titleAccent}</span></motion.h2>
        <motion.blockquote className="about__quote" {...reveal(.1)}>„Przenieśliśmy naszą pasję do nowego wnętrza przy ul. Romera 30, by stworzyć standard, na który zasługujesz.”</motion.blockquote>
        <motion.p className="about__lead" {...reveal(.12)}>{aboutCopy.lead}</motion.p>
        <motion.p className="about__text" {...reveal(.18)}>{aboutCopy.paragraph}</motion.p>
      </div>
      <div className="about__team-grid"><p className="about__team-label">{content.teamLabel || 'Nasz zespół'}</p>{(content.team ?? []).map(({ id, name, role }) => <div key={id} className="about__expert-card"><h3 className="about__expert-name">{name}</h3><p className="about__expert-role">{role}</p></div>)}</div>
    </div>
  </div></section>
}

export default About
