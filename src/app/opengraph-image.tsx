import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "Bánh tai truyền thống - thơm vị quê nhà";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "64px 76px",
          background: "linear-gradient(120deg, #fbf6ec 0%, #f1d6b4 100%)",
          color: "#50352a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "65%" }}>
          <div style={{ display: "flex", color: "#b94f2d", fontSize: 24, fontWeight: 700 }}>
            ĐẶC SẢN BÁNH TAI HUẾ
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 62, fontWeight: 800, lineHeight: 1.15 }}>
            Một chút vị quê,
            <br />
            thương nhớ cả nhà.
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 28, color: "#80695d" }}>
            {siteConfig.name} · 50.000đ / 500g
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 22, color: "#80695d" }}>
            Hai vị bánh thơm ngon · Giao hàng toàn quốc
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 270,
            height: 270,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 150,
            background: "#b94f2d",
            color: "#fbf6ec",
            fontSize: 116,
            fontWeight: 800,
            boxShadow: "0 20px 40px rgba(80,53,42,.2)",
          }}
        >
          T
        </div>
      </div>
    ),
    size,
  );
}
