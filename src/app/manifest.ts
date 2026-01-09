// src/app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anchor',
    short_name: 'Anchor',
    description: 'A gentle mood companion for everyday mental wellness.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF7F2',
    theme_color: '#FFF7F2',
    icons: [
      {
        src: '、screenshots/icon/anchor_icon_192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/screenshots/icon/anchor_icon_512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}