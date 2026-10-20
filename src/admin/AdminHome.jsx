import AdminIcon from './AdminIcon'
import { useAdminDashboard } from './useAdminDashboard'

function DashTile({ id, icon, title, action, onOpen, compact, children }) {
  return (
    <article
      className={`adm-dash__tile adm-dash__tile--${id}${compact ? ' adm-dash__tile--compact' : ''}`}
    >
      <button type="button" className="adm-dash__hit" onClick={onOpen}>
        <header className="adm-dash__head">
          <span className="adm-dash__icon-wrap" aria-hidden="true">
            <AdminIcon name={icon} className="adm-dash__icon" />
          </span>
          <h2 className="adm-dash__title">{title}</h2>
          <span className="adm-dash__action">{action}</span>
        </header>
        <div className="adm-dash__body">{children}</div>
      </button>
    </article>
  )
}

function AdminHome({ onSelect }) {
  const data = useAdminDashboard()

  const contactRows = [
    data.contact.phone && { label: 'Telefon', value: data.contact.phone },
    data.contact.instagram && { label: 'Instagram', value: data.contact.instagram },
    data.contact.facebook && { label: 'Facebook', value: data.contact.facebook, link: true },
    data.contact.booksy && { label: 'Booksy', value: data.contact.booksy, link: true },
    data.contact.address && { label: 'Adres', value: data.contact.address },
    data.contact.hours.length > 0 && {
      label: 'Godziny',
      value: data.contact.hours,
    },
  ].filter(Boolean)

  return (
    <div className="adm-dash">
      <div className="adm-dash__band">
        <div className="adm-dash__band-left">
          <DashTile
            id="portfolio"
            icon="portfolio"
            title="Portfolio"
            action="Zarządzaj ›"
            onOpen={() => onSelect('portfolio')}
          >
            {data.galleryPreview.length === 0 ? (
              <p className="adm-dash__empty">Galeria czeka na pierwsze zdjęcia efektów.</p>
            ) : (
              <ul className="adm-dash__gallery adm-dash__gallery--hero">
                {data.galleryPreview.map((image) => (
                  <li key={image.key}>
                    <img src={image.src} alt="" loading="lazy" decoding="async" />
                    {image.label && <span className="adm-dash__gallery-cap">{image.label}</span>}
                  </li>
                ))}
              </ul>
            )}
          </DashTile>

          <DashTile
            id="opinie"
            icon="reviews"
            title="Opinie"
            action="Zarządzaj ›"
            onOpen={() => onSelect('opinie')}
          >
            {data.reviewSnippets.length === 0 ? (
              <p className="adm-dash__empty">Brak opublikowanych opinii.</p>
            ) : (
              <ul className="adm-dash__quotes adm-dash__quotes--grid">
                {data.reviewSnippets.map((review) => (
                  <li key={review.id} className="adm-dash__quote">
                    <p className="adm-dash__quote-body">{review.body}</p>
                    <span className="adm-dash__quote-author">{review.author}</span>
                  </li>
                ))}
              </ul>
            )}
          </DashTile>
        </div>

        <div className="adm-dash__band-right">
          <DashTile
            id="firma"
            icon="company"
            title="Dane firmy"
            action="Zarządzaj ›"
            onOpen={() => onSelect('firma')}
          >
            {contactRows.length === 0 ? (
              <p className="adm-dash__empty">Uzupełnij dane kontaktowe w zakładce Dane firmy.</p>
            ) : (
              <ul className="adm-dash__contact adm-dash__contact--plain">
                {contactRows.map((row) => (
                  <li key={row.label} className="adm-dash__contact-row">
                    <span className="adm-dash__contact-label">{row.label}</span>
                    {Array.isArray(row.value) ? (
                      <span className="adm-dash__contact-value">
                        {row.value.map((line) => (
                          <span key={line} className="adm-dash__contact-line">
                            {line}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span
                        className={`adm-dash__contact-value${row.link ? ' adm-dash__contact-value--link' : ''}`}
                        title={row.link ? row.value : undefined}
                      >
                        {row.value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </DashTile>

          <div className="adm-dash__notice-slot">
            <DashTile
              id="komunikaty"
              icon="notices"
              title="Alerty strony"
              action="Zarządzaj ›"
              compact
              onOpen={() => onSelect('komunikaty')}
            >
              {data.activeNotices.length === 0 ? (
                <p className="adm-dash__notice-empty">Brak aktywnych komunikatów na stronie.</p>
              ) : (
                <ul className="adm-dash__notice-list">
                  {data.activeNotices.map((notice) => (
                    <li key={notice.id} className="adm-dash__notice-item">
                      {notice.message}
                    </li>
                  ))}
                </ul>
              )}
            </DashTile>
          </div>
        </div>
      </div>

      <DashTile
        id="cennik"
        icon="pricing"
        title="Cennik zabiegów"
        action="Zarządzaj ›"
        onOpen={() => onSelect('cennik')}
      >
        {data.priceRows.length === 0 ? (
          <p className="adm-dash__empty">Cennik jest pusty.</p>
        ) : (
          <table className="adm-dash__table adm-dash__table--dense">
            <tbody>
              {data.priceRows.map((row) => (
                <tr key={row.id}>
                  <th scope="row">{row.name}</th>
                  <td>{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DashTile>

      <DashTile
        id="pakiety"
        icon="packages"
        title="Pakiety"
        action="Zarządzaj ›"
        onOpen={() => onSelect('pakiety')}
      >
        {data.packages.length === 0 ? (
          <p className="adm-dash__empty">Brak pakietów — dodaj zestawy w zakładce Pakiety.</p>
        ) : (
          <ul className="adm-dash__packages">
            {data.packages.map((pkg) => (
              <li key={pkg.id} className="adm-dash__package">
                <div className="adm-dash__package-copy">
                  <span className="adm-dash__package-name">{pkg.name}</span>
                  {pkg.subtitle && <span className="adm-dash__package-desc">{pkg.subtitle}</span>}
                </div>
                <span className="adm-dash__package-price">
                  {typeof pkg.price === 'number' ? `${pkg.price} zł` : pkg.price}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashTile>
    </div>
  )
}

export default AdminHome
