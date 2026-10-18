import { useMemo } from 'react'
import { useContent, useGallery, useSection } from '../content/context'
import { mediaUrl } from '../lib/supabase'

function flattenPackages(categories) {
  const list = []
  for (const category of categories ?? []) {
    for (const pkg of category.packages ?? []) {
      list.push({
        id: pkg.id ?? `${category.id}-${pkg.name}`,
        name: pkg.name,
        price: pkg.price,
        subtitle: pkg.items?.join(' · ') || pkg.description || '',
        category: category.tabLabel || category.title || '',
      })
    }
  }
  return list
}

function flattenPriceRows(groups) {
  const list = []
  for (const group of groups ?? []) {
    for (const row of group.rows ?? []) {
      list.push({
        id: row.id ?? row.name,
        name: row.name,
        price: row.price,
        group: group.label || '',
      })
    }
  }
  return list
}

function reviewAverage(rows) {
  const rated = rows.filter((row) => row.is_published !== false && Number(row.rating) > 0)
  if (!rated.length) return null
  return rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length
}

function socialHandle(url) {
  if (!url) return null
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    const handle = parts[parts.length - 1]
    return handle ? `@${handle.replace(/^@/, '')}` : null
  } catch {
    const trimmed = String(url).trim()
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
  }
}

function shortUrl(url) {
  const clean = String(url ?? '').trim()
  if (!clean) return ''
  return clean
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\?do=invite$/i, '')
    .replace(/\/$/, '')
}

function excerpt(text, max = 120) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trim()}…`
}

export function useAdminDashboard() {
  const { contact, notices, reviews, gallery: galleryRows } = useContent()
  const offer = useSection('offer')
  const pricing = useSection('pricing')
  const publishedGallery = useGallery()

  return useMemo(() => {
    const packages = flattenPackages(offer.categories)
    const priceRows = flattenPriceRows(pricing.groups)
    const publishedReviews = (reviews ?? []).filter((row) => row.is_published !== false)
    const ratingAvg = reviewAverage(reviews ?? [])
    const reviewSnippets = publishedReviews.slice(0, 4).map((row) => ({
      id: row.id,
      author: row.author || 'Klientka',
      body: excerpt(row.body, 140),
    }))

    const galleryPreview = publishedGallery.slice(0, 4).map((image) => ({
      key: image.id ?? image.storage_path,
      src: image.src || mediaUrl(image.storage_path),
      label: image.category || image.alt || '',
    }))

    const activeNotices = notices ?? []

    return {
      packages,
      priceRows,
      contact: {
        phone: contact?.phone?.trim() || '',
        address: contact?.address?.trim() || '',
        hours: Array.isArray(contact?.hours) ? contact.hours.filter(Boolean) : [],
        instagram: socialHandle(contact?.instagram),
        facebook: shortUrl(contact?.facebook),
        booksy: shortUrl(contact?.booksy),
      },
      ratingAvg,
      reviewCount: publishedReviews.length,
      reviewSnippets,
      galleryPreview,
      galleryTotal: (galleryRows ?? []).length,
      activeNotices,
    }
  }, [contact, notices, reviews, galleryRows, offer, pricing, publishedGallery])
}

export function useAdminHomeMeta() {
  const dash = useAdminDashboard()
  const { reviews } = useContent()

  return useMemo(
    () => ({
      packageCount: dash.packages.length,
      priceCount: dash.priceRows.length,
      contactComplete: Boolean(dash.contact.phone && dash.contact.address),
      activeNotices: dash.activeNotices.length,
      publishedReviewCount: dash.reviewCount,
      pendingReviewCount: (reviews ?? []).filter((row) => row.is_published === false).length,
      ratingAvg: dash.ratingAvg,
      galleryCount: dash.galleryTotal,
      peekImages: dash.galleryPreview.slice(0, 3),
    }),
    [dash, reviews],
  )
}
