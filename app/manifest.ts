import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bhiksha Hall Tracker',
        short_name: 'Bhiksha',
        description: 'Offline-first application for tracking food waste.',
        start_url: '/',
        display: 'standalone',
        background_color: '#FDFBF7',
        theme_color: '#FDFBF7',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
