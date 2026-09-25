const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.png',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/terms-conditions',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/terms-conditions',
        permanent: true,
      },
      // These used to be served by the old src/app/[platform] catch-all route,
      // which rendered byte-for-byte identical content (same H1, same "seo-content"
      // copy) for every platform, only swapping the <title>/<meta description>.
      // Google/AdSense treats that as thin, duplicate/doorway content. The
      // dedicated /text-repeater page now covers every platform via its own
      // in-page selector, so these old URLs just redirect there.
      {
        source: '/instagram-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
      {
        source: '/whatsapp-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
      {
        source: '/facebook-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
      {
        source: '/telegram-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
      {
        source: '/youtube-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
      {
        source: '/x-text-repeater',
        destination: '/text-repeater',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*).(webp|mp3|svg|png|jpg|jpeg)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/ads.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg'),
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push(
      // Vite parity: *.svg WITHOUT ?react returns a static URL string
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/react/] },
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash][ext]'
        }
      },
      // Vite parity: *.svg?react returns a React Component
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: /react/,
        use: ['@svgr/webpack'],
      }
    );

    return config;
  },
};

export default nextConfig;
