import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function RobotsMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = document.getElementById('robots')
    if (!meta) return
    const admin = pathname === '/admin' || pathname.startsWith('/admin/')
    meta.setAttribute('content', admin ? 'noindex, nofollow' : 'index, follow')
  }, [pathname])

  return null
}

export default RobotsMeta
