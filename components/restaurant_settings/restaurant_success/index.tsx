"use client";

import Image from "next/image";
import SuccessIcon from "@/components/success_icon";
import { useRouter } from "next/navigation";

export default function RestaurantSuccess() {
  const router = useRouter();

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-10">
        <div className="flex justify-center">
          <SuccessIcon />
        </div>

        <div className="text-center flex flex-col items-center gap-1">
          <h1 className="text-[26px] text-gray-800 font-semibold">
            Restaurante criado com sucesso!
          </h1>
          <p className="text-sm text-gray-500 mt-2 ">
            Continue a configuração do seu restuarante no painel de
            configurações.
          </p>
        </div>

        <button
          onClick={() => {
            router.push("/admin/my-restaurants");
            router.refresh();
          }}
          className="w-full h-14 bg-(--color-primary) text-white font-semibold text-[16px] hover:bg-(--color-secondary) transition-all duration-200 cursor-pointer rounded-sm"
        >
          Painel de restaurantes
        </button>
      </div>
    </section>
  );
}
