import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'أكاديمية الرياضيات',
    short_name: 'الرياضيات',
    description: 'تعلم الضرب والقسمة بطريقة ممتعة وتفاعلية',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ede9fe',
    theme_color: '#6366f1',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
