"use client";

import Link from "next/link";
import { ChefHat, Receipt } from "lucide-react";
import { useSession } from "next-auth/react";

export default function UserType() {
  const { update } = useSession();

  const chooseType = async (type: "admin" | "cliente") => {
    const res = await fetch("/api/user/type", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });

    if (res.ok) {
      await update({ role: type });

      window.location.href = type === "admin" ? "/" : "client/restaurants";
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#F6F8FB] px-4">
      <div className="w-full max-w-3xl text-center">
        {/* Cabeçalho */}
        <h1 className="text-3xl font-bold text-[#1F2933]">
          Como você quer usar o Serve?
        </h1>
        <p className="text-[#6B7280] mt-2 mb-10">
          Escolha o perfil que melhor representa você dentro do sistema.
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin / Restaurante */}
          <div className="group bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">
              <div className="mb-4 flex justify-center gap-4">
                <ChefHat size={32} className="text-(--color-primary)" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-(--color-primary)">
              Criar meu restaurante
            </h2>
            <p className="text-[#6B7280] mt-2 mb-6 text-sm leading-relaxed">
              Gerencie pedidos, mesas e atendimento em um só lugar.
            </p>

            <button
              type="button"
              onClick={() => chooseType("admin")}
              className="w-full py-2 rounded-lg bg-(--color-primary) text-white font-medium hover:bg-(--color-secondary) cursor-pointer transition-colors"
            >
              Começar como administrador
            </button>
          </div>

          {/* Cliente */}
          <div className="group bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm hover:shadow-lg transition">
            <div className="text-4xl mb-4">
              <div className="mb-4 flex justify-center gap-4">
                <Receipt size={32} className="text-(--color-dark)" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-(--color-dark)">
              Sou cliente
            </h2>
            <p className="text-[#6B7280] mt-2 mb-6 text-sm leading-relaxed">
              Encontre restaurantes, faça pedidos e acompanhe tudo em tempo
              real.
            </p>

            <button
              type="button"
              onClick={() => chooseType("cliente")}
              className="w-full py-2 rounded-lg bg-gray-800 text-white font-medium hover:opacity-97 cursor-pointer transition-opacity"
            >
              Continuar como cliente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
