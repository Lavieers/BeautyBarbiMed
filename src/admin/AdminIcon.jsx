// Ikony menu panelu — wypełnione, czytelne w małym rozmiarze (jak na dashboardzie referencyjnym).

const icons = {
  overview: (
    <path
      fill="currentColor"
      d="M4 4h6.5v6.5H4V4zm9.5 0H20v6.5h-6.5V4zM4 13.5h6.5V20H4v-6.5zm9.5 0H20V20h-6.5v-6.5z"
    />
  ),
  packages: (
    <path
      fill="currentColor"
      d="M12 3 20 7v10l-8 4-8-4V7l8-4zm0 2.2L6.8 8.2 12 10.8l5.2-2.6L12 5.2zM6 9.8v6.9l5 2.5v-6.9L6 9.8zm12 0-5 2.5v6.9l5-2.5V9.8z"
    />
  ),
  pricing: (
    <path
      fill="currentColor"
      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 4v2h10V7H7zm0 4v2h6v-2H7zm0 4v2h8v-2H7z"
    />
  ),
  company: (
    <path
      fill="currentColor"
      d="M12 2a5.5 5.5 0 0 0-5.5 5.5c0 3.8 5.5 10.5 5.5 10.5S17.5 11.3 17.5 7.5A5.5 5.5 0 0 0 12 2zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM5 20.5V19h14v1.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5z"
    />
  ),
  portfolio: (
    <path
      fill="currentColor"
      d="M4 5a2 2 0 0 1 2-2h4.2L13 4.8V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm11.5-.3 2.8 2.8V19a2 2 0 0 1-2 2h-3.5v-14h2.7zM8 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
    />
  ),
  reviews: (
    <path
      fill="currentColor"
      d="M5 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3.5V15H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm6.2 2.8 1.3 2.6 2.9.4-2.1 2.1.5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2.1 2.9-.4 1.3-2.6z"
    />
  ),
  notices: (
    <path
      fill="currentColor"
      d="M14 3a1 1 0 0 1 .8.4l3.2 4.3H20a1 1 0 0 1 .8 1.5l-2.2 3.3L20 16a1 1 0 0 1-.8 1.5h-5.5L11 21.6a1 1 0 0 1-1.8-.6V16H4a1 1 0 0 1-.8-1.5l2.2-3.3L3 8.2a1 1 0 0 1 .8-1.5h2.1l3.2-4.3A1 1 0 0 1 10 2h4zm-2 5H8v2h4V8zm0 3H8v2h4v-2z"
    />
  ),
  external: (
    <path
      fill="currentColor"
      d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h7v2H7v10h10v-5h2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
    />
  ),
  logout: (
    <path
      fill="currentColor"
      d="M10 3h2v8h-2V3zm-1 0H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4v-2H5V5h4V3zm4 6 4 4-4 4v-3H9v-2h5V9z"
    />
  ),
  search: (
    <path
      fill="currentColor"
      d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm8.1 13.4 3.4 3.4-1.4 1.4-3.4-3.4 1.4-1.4z"
    />
  ),
  preview: (
    <path
      fill="currentColor"
      d="M12 5c5.5 0 9.5 5 9.5 7s-4 7-9.5 7S2.5 14 2.5 12 6.5 5 12 5zm0 2.2c-3.2 0-5.8 2.8-6.7 4.8.9 2 3.5 4.8 6.7 4.8s5.8-2.8 6.7-4.8c-.9-2-3.5-4.8-6.7-4.8zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"
    />
  ),
  star: (
    <path
      fill="currentColor"
      d="M12 4.2 13.6 9h4.9l-4 2.9 1.5 4.7L12 14.8 8 16.6l1.5-4.7-4-2.9h4.9L12 4.2z"
      opacity="0.28"
    />
  ),
  starFilled: (
    <path
      fill="currentColor"
      d="M12 4.2 13.6 9h4.9l-4 2.9 1.5 4.7L12 14.8 8 16.6l1.5-4.7-4-2.9h4.9L12 4.2z"
    />
  ),
  phone: (
    <path
      fill="currentColor"
      d="M8.5 3h7A1.5 1.5 0 0 1 17 4.5v15A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5v-15A1.5 1.5 0 0 1 8.5 3zm0 2v13h7V5h-7zm3.5 11.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
    />
  ),
  clock: (
    <path
      fill="currentColor"
      d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm-.75 3.5a.75.75 0 0 1 1.5 0v3.69l2.22 1.3a.75.75 0 1 1-.74 1.3l-2.5-1.47A.75.75 0 0 1 11.25 12V8.5z"
    />
  ),
  facebook: (
    <path
      fill="currentColor"
      d="M13.4 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.5-1.4h1.5V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2H7.8v2.9h2.5V21h3.1Z"
    />
  ),
  instagram: (
    <path
      fill="currentColor"
      d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8zm8 1.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5z"
    />
  ),
  booksy: (
    <path
      fill="currentColor"
      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 4v2h10V7H7zm0 4v2h4v-2H7zm0 4v6h10v-6H7z"
    />
  ),
  pin: (
    <path
      fill="currentColor"
      d="M12 2a5.5 5.5 0 0 0-5.5 5.5c0 3.8 5.5 10.5 5.5 10.5S17.5 11.3 17.5 7.5A5.5 5.5 0 0 0 12 2zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM5 20.5V19h14v1.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5z"
    />
  ),
  plus: (
    <path
      fill="currentColor"
      d="M11 4.5a1 1 0 0 1 1 1V11h5.5a1 1 0 1 1 0 2H12v5.5a1 1 0 1 1-2 0V13H4.5a1 1 0 1 1 0-2H10V5.5a1 1 0 0 1 1-1z"
    />
  ),
}

function AdminIcon({ name, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name] ?? icons.overview}
    </svg>
  )
}

export default AdminIcon

