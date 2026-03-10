"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 cursor-pointer"
      title="Sair"
    >
      <LogOut size={20} />
    </button>
  );
}
