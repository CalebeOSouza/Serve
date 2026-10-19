"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  async function handleLogout() {
    try {
      await fetch("/api/restaurant/employees/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Erro ao encerrar sessão do funcionário:", error);
    } finally {
      await signOut({
        callbackUrl: "/",
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-2 cursor-pointer"
      title="Sair"
    >
      <LogOut size={19} />
      <p className="text-[15px]">Sair</p>
    </button>
  );
}