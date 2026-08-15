import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      // ローカル(MinIO)
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      // 検証環境(Cloudflare R2)
      { protocol: 'https', hostname: 'img.mamakatu-boy.com' },
      // 本番(CloudFront)
      { protocol: 'https', hostname: 'img.mamakatu-boy.com' },
    ],
  },
}

export default nextConfig
