import { pageDescriptionParts } from './formatPageDescription'

function renderDescriptionLine(line, descriptionFull, lineIndex) {
  const parts = pageDescriptionParts(line)

  return (
    <p
      key={lineIndex}
      className={`adm-page-head__desc${descriptionFull ? ' adm-page-head__desc--full' : ''}${lineIndex > 0 ? ' adm-page-head__desc--follow' : ''}`}
    >
      {parts.map((part, index) =>
        part.type === 'strong' ? (
          <strong key={index}>{part.text}</strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </p>
  )
}

function AdminPageHeader({ kicker, title, description, descriptionFull, actions }) {
  const descriptionLines = description
    ? String(description)
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : []

  return (
    <header className="adm-page-head">
      <div className="adm-page-head__text">
        {kicker && <p className="adm-page-head__kicker">{kicker}</p>}
        <h1 className="adm-page-head__title">{title}</h1>
        {descriptionLines.length > 0 &&
          descriptionLines.map((line, index) => renderDescriptionLine(line, descriptionFull, index))}
      </div>
      {actions && <div className="adm-page-head__actions">{actions}</div>}
    </header>
  )
}

export default AdminPageHeader
