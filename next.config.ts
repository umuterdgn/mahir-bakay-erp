import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mlightcad/cad-simple-viewer',
    '@mlightcad/three-renderer',
    '@mlightcad/data-model',
    '@mlightcad/mtext-renderer',
    'three'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/admin/projects/:id/markup/assets/:path*',
        destination: '/admin/blueprints/assets/:path*',
      },
      {
        source: '/admin/projects/:id/assets/:path*',
        destination: '/admin/blueprints/assets/:path*',
      }
    ];
  },
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
    
    // Three.js Çoklu Instance Çakışmasını Önle
    config.resolve.alias = {
      ...config.resolve.alias,
      three: path.resolve(__dirname, 'node_modules/three')
    };
    
    // GELİŞTİRME AŞAMASINDA MİNİFİCATION'I TAMAMEN KAPAT (CAD kütüphanesi mangling hatasını önlemek için)
    config.optimization = {
      ...config.optimization,
      minimize: false,
    };
    
    return config;
  },
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true, layers: true };
    
    // Three.js Çoklu Instance Çakışmasını Önle
    config.resolve.alias = {
      ...config.resolve.alias,
      three: path.resolve(__dirname, 'node_modules/three')
    };
    
    // GELİŞTİRME AŞAMASINDA MİNİFİCATION'I TAMAMEN KAPAT (CAD kütüphanesi mangling hatasını önlemek için)
    config.optimization = {
      ...config.optimization,
      minimize: false,
    };
    
    return config;
  },
};

export default nextConfig;
