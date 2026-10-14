import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.banhtaiquenha.site";
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/san-pham`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/dat-hang`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/lien-he`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
