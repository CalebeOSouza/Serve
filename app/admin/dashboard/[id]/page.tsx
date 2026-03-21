"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardMenu } from "../../../../components/dashboard_menu";
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

type Restaurant = {
  id: number;
  name: string;
  city: string;
  state: string;
  status: "operacional" | "configurando" | "pausado";
  type: "matriz" | "filial";
  media?: {
    logo_url?: string | null;
    banner_url?: string | null;
  };
  updated_at: string;
};

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const params = useParams();
  const id = params.id;

  useEffect(() => {
    async function fetchRestaurant() {
      const response = await fetch(`/api/restaurant/me?restaurantId=${id}`);
      const data = await response.json();
      setRestaurant(data);
    }

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  return (
    <section className="min-h-screen flex bg-[#ededf5]">
      <DashboardMenu />

      <div className="flex flex-col w-full mx-auto pt-16 items-center">
        <div className="w-full">
          <div className="relative h-48 overflow-hidden shadow-sm">
            {restaurant?.media?.banner_url && (
              <Image
                src={restaurant.media.banner_url || "public/no_banner2.png"}
                alt="Banner do restaurante"
                fill
                className="object-cover"
                priority
              />
            )}

            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <div className="py-5 flex flex-col items-center justify-center">
            <div className="flex flex-start mt-5">
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
              <div className="bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center">
                <div className="relative w-120 h-full">
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
                      Comece criando seu cardápio digital e adicione seus
                      pratos.
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
              <div className="bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center">
                <div className="relative w-60 h-full">
                  <Image
                    src="/funcionarios2.png"
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
                      Comece criando seu cardápio digital e adicione seus
                      pratos.
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

              {/* CARD 3 */}
              {/* <div className="bg-white shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all"></div> */}
              <div className="bg-white shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all items-center"></div>
              {/* CARD 4*/}
              <div className="bg-white shadow-sm rounded-2xl p-5 col-span-1 sm:col-span-2 xl:col-span-3 hover:shadow-md transition-all"></div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
