import type { ReactNode } from "react";

export default function StorefrontTemplate({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col animate-route-in">{children}</div>;
}
