import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Override the default webpack configuration
  // webpack: (config) => {
  //   // See https://webpack.js.org/configuration/resolve/#resolvealias
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     sharp$: false,
  //     "onnxruntime-node$": false,
  //     "semantic-chunking": false,
  //   };
  //   return config;
  // },

  serverExternalPackages: ["sharp", "onnxruntime-node", "semantic-chunking"],
};

export default nextConfig;
