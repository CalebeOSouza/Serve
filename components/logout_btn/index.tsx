
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  async function handleLogout() {
    try {
      const response = await fetch(
        "/api/restaurant/employees/logout",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível encerrar a sessão do funcionário."
        );
      }

      await signOut({ redirect: false });

      window.location.replace(
        "/account_access?mode=login"
      );
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      alert(
        "Não foi possível encerrar sua sessão. Tente novamente."
      );
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
