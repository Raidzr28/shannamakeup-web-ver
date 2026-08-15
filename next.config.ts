import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Google profile photos, adopted as the avatar on first Google
        // sign-in. Without this the <Image> in ui/Media.tsx refuses the URL
        // and every such account renders a broken avatar. The subdomain is
        // wildcarded because Google serves the same photo from lh3, lh4, lh5…
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
