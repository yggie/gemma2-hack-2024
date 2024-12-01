import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

  // serverExternalPackages: ["sharp", "onnxruntime-node", "semantic-chunking"],
  experimental: {
    asyncWebAssembly: true,
  },
};

export default nextConfig;
