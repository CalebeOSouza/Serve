
"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");
  const isAccountAccess = pathname.includes("/account_access");

  if (isDashboard || isAccountAccess) return null;

  return <Footer />;
}
