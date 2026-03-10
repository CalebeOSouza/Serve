"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Settings,
  Search,
  CircleCheck,
  MapPin,
  Building2,
  Store,
  AlertCircle,
  PauseCircle,
} from "lucide-react";

import RestaurantCard from "../../../components/restaurant_card";

type Restaurant = {
  id: number;
  name: string;
  city: string;
  state: string;
  status: "operacional" | "configurando" | "pausado";
  type: "matriz" | "filial";
  logo_url?: string | null;
  banner_url?: string | null;
  updated_at: string;
};

export default function MyRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
  async function fetchRestaurants() {
    const response = await fetch("/api/restaurant/me/all-restaurants");
    const data = await response.json();
    setRestaurants(data);
  }

  fetchRestaurants();

  const channel = new BroadcastChannel("restaurants");

  channel.onmessage = (event) => {
    if (event.data === "restaurant-created") {
      fetchRestaurants();
    }
  };

  return () => {
    channel.close();
  };
}, []);

  return (
    <section className="min-h-screen flex py-15 bg-gray-50">
      <div className="flex flex-col w-full text-center mx-auto">
        <div className="flex flex-start w-full bg-[#f4f5f7] py-10 px-20 border-b border-gray-200">
          <div className="flex flex-col text-start ">
            <h1 className="mb-5 text-4xl font-bold text-[#1F2933]">
              Meus restaurantes
            </h1>
            <p className="text-md text-[#1F2933]">
              Gerencie os seus restaurantes e configure suas opções!
            </p>
          </div>
        </div>

        {/* <div className="relative flex w-full bg-[#f4f5f7] py-10 px-20 border-b border-gray-200 overflow-hidden">
          <Image
            src="/.png"
            alt=""
            fill
            className="object-cover"
            priority
          />

          <div className="relative z-10 flex flex-col text-start">
            <h1 className="mb-5 text-4xl font-bold text-[#1F2933]">
              Meus restaurantes
            </h1>

            <p className="text-md text-[#1F2933]">
              Gerencie os seus restaurantes e configure suas opções!
            </p>
          </div>
        </div> */}

        <div className="w-full mx-auto px-6 py-10">
          <div className="w-full flex justify-center py-8">
            <form className="flex flex-col md:flex-row items-center gap-4 justify-start">
              <div className="w-60">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar restaurante..."
                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary)"
                  />
                </div>
              </div>

              <div className="w-48">
                <select
                  name="status"
                  className="w-full rounded-lg border border-gray-300 bg-[#ffffff] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-(--color-primary) focus:border-(--color-primary)"
                >
                  <option value="">Todos</option>
                  <option value="open">Aberto</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-(--color-primary) text-white font-medium py-2 px-6 rounded-lg hover:bg-(--color-secondary) transition-all duration-200 flex items-center gap-2"
              >
                Filtrar
              </button>
            </form>
          </div>
          <div className="py-10 w-full flex justify-center">
            <div className="w-full max-w-275">
              {/* Div grid */}

              {/* Card */}

              {restaurants.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    Você ainda não possui restaurantes cadastrados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
