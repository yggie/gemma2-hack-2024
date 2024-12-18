import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  /* config options here */
  // output: "export",

  // Override the default webpack configuration
  // webpack: (config) => {
  //   // see https://github.com/huggingface/transformers.js/issues/911
  //   config.resolve.alias["@huggingface/transformers"] = path.resolve(
  //     __dirname,
  //     "node_modules/@huggingface/transformers"
  //   );
  //   // See https://webpack.js.org/configuration/resolve/#resolvealias
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     sharp$: false,
  //     "onnxruntime-node$": false,
  //   };
  //   return config;
  // },

  webpack: function (config) {
    config.experiments = {
      asyncWebAssembly: true,
      syncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
    };
    return config;
  },

  // serverExternalPackages: ["sharp", "onnxruntime-node", "semantic-chunking"],
};

export default nextConfig;
