"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Settings,
  Settings2,
  CircleCheck,
  MapPin,
  PauseCircle,
} from "lucide-react";

type Restaurant = {
  id: number;
  name: string;
  city: string;
  state: string;
  status: "operacional" | "configurando" | "pausado";
  logo_url?: string | null;
  banner_url?: string | null;
  updated_at: string;
};

interface Props {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: Props) {
  const {
    name,
    city,
    state,
    status,
    logo_url,
    banner_url,
    updated_at,
  } = restaurant;

  const formattedDate = new Date(updated_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="flex flex-col border border-[#e1e1e7] rounded-lg w-full bg-white relative shadow-md">
        <div className="relative w-full h-32 overflow-hidden">
          <Image
            src={banner_url || "/no_banner2.png"}
            alt="Banner do restaurante"
            fill
            className="object-cover rounded-t-lg"
            priority
          />
        </div>

        <div className="absolute top-32 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
            <Image
              src={logo_url || "/no_logo6.png"}
              alt="Logo do restaurante"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center px-5 gap-5 py-5 mt-8">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-2xl font-bold text-[#35393a]">{name}</h1>

            <div className="flex gap-3">
              {status === "operacional" && (
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[14px] font-bold bg-(--color-badge-1) text-(--color-secondary)">
                  <CircleCheck className="w-4 h-4 text-(--color-primary)" />
                  Operacional
                </span>
              )}

              {status === "configurando" && (
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[14px] font-bold bg-(--color-badge-3) text-[#292929]">
                  <Settings className="w-4 h-4 text-[#292929]" />
                  Configurando
                </span>
              )}

              {status === "pausado" && (
                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[14px] font-bold bg-(--color-badge-3) text-[#292929]">
                  <PauseCircle className="w-4 h-4 text-[#292929]" />
                  Pausado
                </span>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <MapPin className="w-4 h-4" />
              <p>
                {city}, {state}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 flex flex-col gap-4 pt-4 items-start text-start">
            <p>Ultíma edição: {formattedDate}</p>
          </div>

          <Link
            href={`/admin/dashboard/${restaurant.id}`}
            className="bg-(--color-primary) text-white font-semibold py-2 px-8 rounded hover:bg-(--color-secondary) transition-all duration-200 cursor-pointer flex items-center justify-center gap-4"
          >
            <Settings2 className="w-5.5 h-5.5 text-white" />
            <span className="text-[16.5px]">Painel de Controle</span>
          </Link>
        </div>
      </div>
    </>
  );
}