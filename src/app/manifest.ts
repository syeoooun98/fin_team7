import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "자리지킴이",
    short_name: "자리지킴이",
    description: "도서관 좌석 예약·반납 웹 서비스",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6fd",
    theme_color: "#7c3aed",
    lang: "ko",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
