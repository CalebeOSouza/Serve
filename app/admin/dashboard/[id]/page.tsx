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
        <div className="flex flex-col text-start">
          <h1 className="font-semibold text-[30px] text-[#19274b]">
            Bem-vindo ao seu painel!
          </h1>
          <p className="text-[18px] text-[#19274b] mt-1">
            Comece configurando seu restaurante.
          </p>
        </div>
      </div>
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[360px] w-full max-w-7xl px-5 ">
        {/* CARD 4*/}
        <div className="bg-white shadow-sm rounded-lg p-5 col-span-1 sm:col-span-2 xl:col-span-3 transition-all flex flex-col md:flex-row gap-5">
          <div className="md:w-1/2">
            <div className="relative w-130 h-full">
              <Image
                src="/configure_restaurante_3.png"
                alt="Banner do restaurante"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col justify-center gap-2">
            <div className="flex flex-col justify-center gap-1">
              <h2 className="text-xl font-semibold text-[#19274b] ">
                Seu restaurante precisa de configurações iniciais
              </h2>

              <p className="text-gray-700">
                Para aproveitar todas as funcionalidades, é importante
                configurar seu restaurante!
              </p>
            </div>

            <ul className="flex flex-col items-start gap-2 text-[15px] text-[#19274b] font-semibold my-3 list-disc pl-5 marker:text-(--color-primary)">
              <li>Cadastre seus produtos e monte seu cardápio.</li>
              <li>Adicione seus funcionários e organize sua equipe.</li>
              <li>Crie o layout do seu restaurante e defina sua identidade.</li>
            </ul>

            <p className="text-gray-700 mt-1">
              Essas etapas são essenciais para um gestão completa e eficiente!
            </p>
          </div>
        
        </div>
        
        {/* CARD 1 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden flex flex-col transition-all items-center">
          <div className="relative w-76 h-full ">
            <Image
              src="/chef9.png"
              alt="Banner do restaurante"
              fill
              className="object-cover mt-3"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Crie seu cardápio
              </h1>
              <p className="text-[15px] text-gray-700">
                Comece criando seu cardápio digital e adicione seus pratos.
              </p>
            </div>

            <Link
              href={`/admin/dashboard/${id}/cardapio`}
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Cardápio
            </Link>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden flex flex-col transition-all items-center">
          <div className="relative w-80 h-full">
            <Image
              src="/funcionarios10.png"
              alt="Banner do restaurante"
              fill
              className="object-cover mt-2"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Cadastre seus funcionários
              </h1>
              <p className="text-[15px] text-gray-700">
                Comece cadastrando seus funcionários e gerenciando suas equipes.
              </p>
            </div>

            <Link
              href={`/admin/dashboard/${id}/funcionarios`}
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Funcionários
            </Link>
          </div>
        </div>

        {/* CARD 3 */}
        {/* <div className="bg-white shadow-sm rounded-lg p-5 flex flex-col justify-between transition-all"></div> */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden flex flex-col transition-all items-center">
          <div className="relative w-82 h-full">
            <Image
              src="/sem_layout_3.png"
              alt="Banner do restaurante"
              fill
              className="object-cover mt-3"
              priority
            />
          </div>

          <div className="flex-1 flex flex-col justify-between p-5 text-center">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[#19274b]">
                Crie seu layout
              </h1>
              <p className="text-[15px] text-gray-700">
                Comece criando seu layout e deixando ele do seu jeito!
              </p>
            </div>

            <Link
              href={`/admin/dashboard/${id}/layout`}
              className="mt-4 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-lg hover:bg-(--color-secondary) transition-all"
            >
              Layout
            </Link>
          </div>
        </div>
        
      </section>
    </div>
  );
}
