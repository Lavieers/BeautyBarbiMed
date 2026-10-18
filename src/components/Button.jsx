import './Button.scss'

function LinkArrow() {
  return (
    <svg
      className="btn__arrow"
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function Button({
  variant = 'primary',
  size = 'default',
  block = false,
  href,
  external = false,
  type = 'button',
  className = '',
  children,
  onClick,
  arrow,
  ...rest
}) {
  const showArrow = arrow ?? variant === 'link'
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'compact' ? 'btn--compact' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {children}
      {showArrow ? <LinkArrow /> : null}
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        onClick={onClick}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  )
}

export default Button
