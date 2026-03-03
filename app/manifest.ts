import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bhiksha Hall Food Tracker',
        short_name: 'Food Tracker',
        description: 'Offline-first application for tracking food waste.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: '#111827',
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
