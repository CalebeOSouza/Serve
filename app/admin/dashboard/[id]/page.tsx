"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardMenu } from "../../../../components/dashboard/dashboard_sidebar";
import Image from "next/image";
import Link from "next/link";
import {
  Settings,
  Search,
  CircleCheck,
  MapPin,
  Building2,
  Store,
  AlertCircle,
  PauseCircle,
  AlignJustify,
  List,
} from "lucide-react";

export default function RestaurantDashboard() {
  const params = useParams();
  const id = params?.id;

  if (!id || Array.isArray(id)) {
    return null;
  }

  return (
    <div className="py-10 w-full max-w-7xl mx-auto px-5">
      <div className="flex flex-col text-start gap-2 ml-5">
        <div className="flex flex-col text-start gap-2">
          <h1 className="font-semibold text-[30px] text-[#19274b]">
            Bem-vindo ao seu painel!
          </h1>
          <p className=" text-[18px] text-[#19274b]">
            Comece configurando seu restaurante.
          </p>
        </div>
      </div>
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[360px] w-full max-w-7xl px-5 ">
        {/* CARD 1 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center">
          <div className="relative w-120 h-48">
            <Image
              src="/chef6.png"
              alt="Banner do restaurante"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Nenhum produto cadastrado
              </h1>
              <p className="text-[15px] text-[#19274b]">
                Comece criando seu cardápio digital e adicione seus pratos.
              </p>
            </div>

            <Link
              href="/"
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Criar cardápio
            </Link>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center">
          <div className="relative w-60 h-48">
            
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Nenhum funcionário cadastrado
              </h1>
              <p className="text-[15px] text-[#19274b]">
                Comece cadastrando seus funcionários e gerenciando suas equipes.
              </p>
            </div>

            <Link
              href="/"
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Criar funcionários
            </Link>
          </div>
        </div>

        {/* CARD 3 */}
        {/* <div className="bg-white shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all"></div> */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center">

<div className="relative w-60 h-48">
            
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Nenhum layout cadastrado
              </h1>
              <p className="text-[15px] text-[#19274b]">
                Comece criando seu layout e configrando seus ambientes.
              </p>
            </div>

            <Link
              href="/"
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Criar layout
            </Link>
          </div>


        </div>
        {/* CARD 4*/}
        <div className="bg-white shadow-sm rounded-2xl p-5 col-span-1 sm:col-span-2 xl:col-span-3 hover:shadow-md transition-all"></div>
      </section>
    </div>
  );
}
