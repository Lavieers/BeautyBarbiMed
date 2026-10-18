import Button from './Button'
import { useContactInfo } from '../content/context'
import './MobileBar.scss'

function MobileBar({ onBook }) {
  const contact = useContactInfo()

  return (
    <aside className="mobile-bar" aria-label="Szybka rezerwacja i kontakt">
      <div className="mobile-bar__inner">
        <Button
          variant="secondary"
          block
          arrow={false}
          href={contact.phoneHref || 'tel:+48501280578'}
          aria-label="Zadzwoń do gabinetu"
        >
          Zadzwoń
        </Button>

        <Button variant="booking" block onClick={onBook} aria-label="Umów wizytę">
          Umów wizytę
        </Button>
      </div>
    </aside>
  )
}

export default MobileBar
