import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-12">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2rem] border-8 border-white bg-[#ead5b8] shadow-xl shadow-brown/10">
        <Image
          src="/images/banh-tai-duong-gung1.png"
          alt="Bánh tai có đường"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="mx-auto max-w-xl text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta sm:text-sm">
          Đặc sản bánh tai Huế
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-brown sm:text-4xl">
          Bánh tai thủ công
        </h1>
        <p className="mt-3 text-sm leading-6 text-brown/65 sm:text-base">
          Giòn rụm, thơm vị gừng
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
          {[
            { icon: Truck, text: "Ship đồng giá 15k" },
            { icon: Check, text: "60k / 500g" },
          ].map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full border border-brown/10 bg-white px-3 py-2 text-xs font-semibold text-brown/75"
            >
              <Icon className="size-3.5 text-terracotta" />
              {text}
            </li>
          ))}
        </ul>
        <Link
          href="/san-pham"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-terracotta px-6 text-sm font-bold text-white shadow-lg shadow-terracotta/15 transition hover:-translate-y-0.5 hover:bg-terracotta-dark"
        >
          Đặt mua ngay <ArrowRight className="size-4" />
        </Link>
        <p className="mt-4 text-xs text-brown/50">
          {siteConfig.name} · Giao hàng toàn quốc
        </p>
      </div>
    </section>
  );
}
