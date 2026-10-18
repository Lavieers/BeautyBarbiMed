import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'
import { useNotices } from '../content/context'
import './NoticeBanner.scss'

const DISMISSED_KEY = 'bbm.dismissedNotices'

function readDismissed() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(DISMISSED_KEY))
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

const icons = { info: 'info', warning: 'clock', closure: 'clock' }

function NoticeBanner() {
  const notices = useNotices()
  const reduced = useReducedMotion()
  const barRef = useRef(null)
  const [dismissed, setDismissed] = useState(() => readDismissed())

  // Pokazujemy jeden komunikat naraz — najnowszy nieodrzucony.
  const notice = notices.find((item) => !dismissed.includes(item.id))

  // Pasek jest fixed nad navbarem, więc jego wysokość musi trafić do zmiennej
  // CSS — inaczej menu wchodziłoby pod komunikat.
  useLayoutEffect(() => {
    const root = document.documentElement

    if (!notice) {
      root.style.setProperty('--notice-height', '0px')
      return undefined
    }

    const measure = () => {
      const height = barRef.current?.offsetHeight ?? 0
      root.style.setProperty('--notice-height', `${height}px`)
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (barRef.current) observer.observe(barRef.current)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [notice])

  useEffect(() => {
    return () => document.documentElement.style.setProperty('--notice-height', '0px')
  }, [])

  const dismiss = () => {
    if (!notice) return

    const next = [...dismissed, notice.id]
    setDismissed(next)
    try {
      window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next))
    } catch {
      // Tryb prywatny bez localStorage — komunikat wróci po odświeżeniu.
    }
  }

  return (
    <AnimatePresence>
      {notice && (
        <motion.div
          ref={barRef}
          className={`notice notice--${notice.kind}`}
          role="status"
          initial={reduced ? false : { y: '-100%' }}
          animate={{ y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '-100%' }}
          transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="notice__icon">
            <Icon name={icons[notice.kind] ?? 'info'} />
          </span>
          <p className="notice__message">{notice.message}</p>
          <button type="button" className="notice__close" onClick={dismiss} aria-label="Ukryj komunikat">
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NoticeBanner
