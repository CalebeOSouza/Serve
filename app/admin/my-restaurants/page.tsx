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
  AlignJustify,
  List,
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
  const [page, setPage] = useState<number>(1);

  const restaurantsPerPage: number = 3;

  useEffect(() => {
    async function fetchRestaurants() {
      const response = await fetch("/api/restaurant/me/all-restaurants");
      const data = await response.json();
      setRestaurants(data.restaurants || []);
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

  const lastRestaurant: number = page * restaurantsPerPage;

  const firstRestaurant: number = lastRestaurant - restaurantsPerPage;

  const visibleRestaurants: Restaurant[] = restaurants.slice(
    firstRestaurant,
    lastRestaurant,
  );

  const totalPages: number = Math.ceil(restaurants.length / restaurantsPerPage);

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

        <div className="w-full mx-auto px-6 py-16">
          {/* <div className="w-full flex justify-center mb-3">
            <div className="flex flex-row gap-6 max-w-275 w-full">
            
              <div className="flex items-center gap-4">
              
                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm">
                    <List className="w-4 h-4" />
                    Todos
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-white">
                    <CircleCheck className="w-4 h-4" />
                    Operacional
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-white">
                    <Settings className="w-4 h-4" />
                    Configurando
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-white">
                    <PauseCircle className="w-4 h-4" />
                    Pausado
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                

                <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-white shadow-sm">
                    <Building2 className="w-4 h-4" />
                    Matriz
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-white">
                    <Store className="w-4 h-4" />
                    Filial
                  </button>
                </div>
              </div>
            </div>
          </div> */}

          <div className="pb-10 pt-5 w-full flex justify-center">
            <div className="w-full max-w-275">
              {restaurants.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-lg">
                    Você ainda não possui restaurantes cadastrados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleRestaurants.map((restaurant: Restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center mt-15 text-sm text-gray-600">
                <div className="flex-1">
                  <p className="text-start">
                    Mostrando {firstRestaurant + 1}–
                    {Math.min(lastRestaurant, restaurants.length)} de{" "}
                    {restaurants.length}
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 flex-1 font-semibold text-[14.5px]">
                  <button
                    onClick={() => setPage((p: number) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center">
                    {[...Array(totalPages)].map((_, i: number) => {
                      const pageNumber: number = i + 1;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-3 py-1.5 border border-gray-300 cursor-pointer ${
                            page === pageNumber
                              ? "bg-(--color-primary) text-white"
                              : "hover:bg-gray-100"
                          } ${
                            i === 0
                              ? "rounded-l-[3px]"
                              : i === totalPages - 1
                                ? "rounded-r-[3px] border-l-0"
                                : "rounded-none border-l-0"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p: number) => Math.min(p + 1, totalPages))
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer"
                  >
                    Próximo
                  </button>
                </div>

                <div className="flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
