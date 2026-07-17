import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 상위 C:\Programming 에 무관한 package-lock.json이 있어 워크스페이스 루트를 명시적으로 고정
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
