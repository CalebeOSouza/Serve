"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "../../../components/restaurant_card";
import { Plus, Store } from "lucide-react";

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

  const maxVisiblePages = 5;

  const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  return (
    <section className="flex pt-15 bg-(--color-background)">
      <div className="flex flex-col w-full text-center mx-auto">
        <div className="flex flex-start w-full bg-[#f4f4f5] py-10 px-20 border-b border-gray-200">
          <div className="flex flex-col text-start">
            <h1 className="mb-5 text-4xl font-bold text-[#1F2933]">
              Meus restaurantes
            </h1>

            <p className="text-md text-[#1F2933]">
              Gerencie os seus restaurantes e configure suas opções!
            </p>
          </div>
        </div>

        <div className="w-full mx-auto px-6 py-15 mb-10">
          <div className="w-full flex justify-center">
            <div className={`w-full ${restaurants.length === 0 ? "" : "max-w-275"}`}>
              {restaurants.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-40 w-full h-full border border-gray-200 rounded-md">
                  <div className="bg-[#F5F5F6] p-6 rounded-full flex items-center justify-center">
                    <Store className="w-14 h-14 text-[#a9b2c6]" />
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <p className="text-gray-800 font-bold text-[20px]">
                      Nenhum restaurante cadastrado
                    </p>

                    <p className="text-gray-500 text-[15px] w-92 text-center">
                      Cadastre seu primeiro restaurante para começar.
                    </p>
                  </div>

                  <div className="flex items-center mt-3">
                    <a
                      href="/admin/onboarding/create-restaurant"
                      className="inline-flex items-center gap-2 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5 text-white" />
                      Novo restaurante
                    </a>
                  </div>
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

              {restaurants.length > 0 && (
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
                      className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer bg-white"
                    >
                      Anterior
                    </button>

                    <div className="flex items-center">
                      {[...Array(endPage - adjustedStartPage + 1)].map(
                        (_, i: number) => {
                          const pageNumber = adjustedStartPage + i;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setPage(pageNumber)}
                              className={`px-3 py-1.5 border border-gray-300 cursor-pointer ${
                                page === pageNumber
                                  ? "bg-(--color-primary) text-white"
                                  : "hover:bg-gray-100 bg-white"
                              } ${
                                i === 0
                                  ? "rounded-l-[3px]"
                                  : i === endPage - adjustedStartPage
                                    ? "rounded-r-[3px] border-l-0"
                                    : "rounded-none border-l-0"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p: number) => Math.min(p + 1, totalPages))
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer bg-white"
                    >
                      Próximo
                    </button>
                  </div>

                  <div className="flex-1"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
