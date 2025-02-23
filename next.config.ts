import type { Config } from "next";

const config: Config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '*.x.ai',
      },
    ],
  },
};

export default config;
