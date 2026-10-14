import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: `${siteConfig.name} | Đặc sản bánh tai Huế`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  verification: {
    google: "google2fd630f94c7c4726",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Đặc sản bánh tai Huế`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/banh-tai-que-nha-sharing.jpg",
        width: 768,
        height: 768,
        alt: "Gia đình làm bánh tai tại nhà",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Đặc sản bánh tai Huế`,
    description: siteConfig.description,
    images: ["/images/banh-tai-que-nha-sharing.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${beVietnamPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
