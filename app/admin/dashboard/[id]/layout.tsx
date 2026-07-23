"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardMenu } from "@/components/dashboard/dashboard_sidebar";
import { DashboardMenuTablet } from "@/components/dashboard/dashboard_sidebar_tablet";
import Image from "next/image";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/restaurant/me?restaurantId=${id}`);
        const data = await res.json();
        setRestaurant(data);
      } catch (error) {
        console.error("Erro ao buscar restaurante:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id && !Array.isArray(id)) {
      fetchRestaurant();
    }
  }, [id]);

  if (!id || Array.isArray(id)) return null;

 return (
  <section className="min-h-screen bg-(--color-background)">
    <DashboardMenu restaurantId={id} />

    <div className="flex flex-col w-full lg:pl-60 pt-16">
      <div className="w-full">
        <div className="relative h-40 w-full overflow-hidden shadow-sm">
          {!loading && (
            <Image
              src={restaurant?.media?.banner_url || "/no_banner2.png"}
              alt="Banner do restaurante"
              fill
              className="object-cover"
              priority
            />
          )}

          <div className="absolute inset-0 bg-black/20" />
        </div>

        <DashboardMenuTablet restaurantId={id} />

        {children}
      </div>
    </div>
  </section>
);
}
