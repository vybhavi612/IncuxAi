import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack may infer the wrong workspace root when multiple lockfiles exist.
  // Setting `turbopack.root` silences the warning and ensures Turbopack uses
  // this project directory as the root for builds.
  // Note: `turbopack.root` expects an absolute path.
  // If your environment requires a different root, update this value.
  // @ts-expect-error - `turbopack` is an experimental option not in the stable types yet
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
