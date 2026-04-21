"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Users,
  Layout,
  Star,
  CalendarCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";
type Props = {
  restaurantId: string | string[];
};

export function DashboardMenu({ restaurantId }: Props) {
  const pathname = usePathname();
  const basePath = `/admin/dashboard/${restaurantId}`;
  return (
    <section className="hidden sm:hidden md:flex min-h-screen w-60 pt-16 bg-(--color-primary) text-white">
      <div className="flex flex-col w-full text-center mx-auto">
        <ul className="flex flex-col px-5 py-10 w-full items-center text-center">
          <div className="flex flex-col items-start gap-3 p-3 text-[15px] w-full">
            {/* DASHBOARD */}
            <li className="w-full">
              <Link href={basePath} className="block w-full">
                <div
                  className={`flex items-center gap-4 px-5 py-3 rounded-md transition-all
        ${pathname === basePath ? "bg-(--color-secondary)" : "hover:bg-(--color-secondary)/50"}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </div>
              </Link>
            </li>

            {/* FUNCIONÁRIOS */}
            <li className="w-full">
              <Link href={`${basePath}/funcionarios`} className="block w-full">
                <div
                  className={`flex items-center gap-4 px-5 py-3 rounded-md transition-all
        ${
          pathname.startsWith(`${basePath}/funcionarios`)
            ? "bg-(--color-secondary)"
            : "hover:bg-(--color-secondary)/50"
        }`}
                >
                  <Users size={18} />
                  <span>Funcionários</span>
                </div>
              </Link>
            </li>
            
            {/* CARDÁPIO */}
            <li className="w-full">
              <Link href={`${basePath}/cardapio`} className="block w-full">
                <div
                  className={`flex items-center gap-4 px-5 py-3 rounded-md transition-all
        ${
          pathname.startsWith(`${basePath}/cardapio`)
            ? "bg-(--color-secondary)"
            : "hover:bg-(--color-secondary)/50"
        }`}
                >
                  <Utensils size={18} />
                  <span>Cardápio</span>
                </div>
              </Link>
            </li>

            {/* LAYOUT */}
            <li className="w-full">
              <Link href={`${basePath}/layout`} className="block w-full">
                <div
                  className={`flex items-center gap-4 px-5 py-3 rounded-md transition-all
        ${
          pathname.startsWith(`${basePath}/layout`)
            ? "bg-(--color-secondary)"
            : "hover:bg-(--color-secondary)/50"
        }`}
                >
                  <Layout size={18} />
                  <span>Layout</span>
                </div>
              </Link>
            </li>

            {/* RESERVAS */}
            <li className="w-full">
              <Link href={`${basePath}/reservas`} className="block w-full">
                <div
                  className={`flex items-center gap-4 px-5 py-3 rounded-md transition-all
        ${
          pathname.startsWith(`${basePath}/reservas`)
            ? "bg-(--color-secondary)"
            : "hover:bg-(--color-secondary)/50"
        }`}
                >
                  <CalendarCheck size={18} />
                  <span>Reservas</span>
                </div>
              </Link>
            </li>
          </div>
        </ul>
      </div>
    </section>
  );
}
