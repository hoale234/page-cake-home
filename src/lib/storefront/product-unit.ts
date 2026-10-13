export function getProductUnit(slug: string, storedUnit?: string | null) {
  if (slug === "banh-tai-khong-duong") return "400g";
  if (slug === "banh-tai-duong-gung") return "500g";
  return storedUnit || "500g";
}
