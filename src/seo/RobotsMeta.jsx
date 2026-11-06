import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function RobotsMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = document.getElementById('robots')
    if (!meta) return
    const home = pathname === '/'
    meta.setAttribute('content', home ? 'index, follow' : 'noindex, nofollow')
  }, [pathname])

  return null
}

export default RobotsMeta
