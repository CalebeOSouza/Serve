"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname.includes("admin/dashboard");

  if (isDashboard) return null;

  return <Footer />;
}