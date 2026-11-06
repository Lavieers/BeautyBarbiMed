import { useEffect } from 'react'
import { useContactInfo } from '../content/context'
import { localBusinessJsonLd } from './site'

const imagePath = import.meta.env.DEV ? '/src/assets/hero-bg.webp' : '/og.webp'

function LocalBusiness() {
  const contact = useContactInfo()

  useEffect(() => {
    let node = document.getElementById('local-business')
    if (!node) {
      node = document.createElement('script')
      node.id = 'local-business'
      node.type = 'application/ld+json'
      document.head.appendChild(node)
    }
    node.textContent = JSON.stringify(
      localBusinessJsonLd({
        siteUrl: import.meta.env.VITE_SITE_URL,
        contact,
        imagePath,
      }),
    )
  }, [contact])

  return null
}

export default LocalBusiness
