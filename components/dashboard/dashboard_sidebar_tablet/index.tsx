"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Users,
  Layout,
  CalendarCheck,
  ArrowLeftRight,
} from "lucide-react";
import { usePathname } from "next/navigation";

type Props = {
  restaurantId: string;
};

export function DashboardMenuTablet({ restaurantId }: Props) {
  const pathname = usePathname();

  const basePath = `/admin/dashboard/${restaurantId}`;

  return (
    <nav className="lg:hidden w-full bg-(--color-primary) text-white shadow-sm">
      <ul
        className="
    flex flex-col
    sm:flex-col
    md:flex-col
    w-full
    gap-2
    md:gap-2
    p-8
    md:justify-center
    md:overflow-x-auto
  "
      >
        <li className="w-full md:w-auto">
          <Link href={basePath}>
            <div
              className={`flex items-center gap-3 px-3 py-2 text-[15px] rounded-md w-full md:w-auto whitespace-nowrap transition-all
              ${
                pathname === basePath
                  ? "bg-(--color-secondary)"
                  : "hover:bg-(--color-secondary)/50"
              }`}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </div>
          </Link>
        </li>

        <li className="w-full md:w-auto">
          <Link href={`${basePath}/funcionarios`}>
            <div
              className={`flex items-center gap-3 px-3 py-2 text-[15px] rounded-md w-full md:w-auto whitespace-nowrap transition-all
              ${
                pathname.startsWith(`${basePath}/funcionarios`)
                  ? "bg-(--color-secondary)"
                  : "hover:bg-(--color-secondary)/50"
              }`}
            >
              <Users size={19} />
              <span>Funcionários</span>
            </div>
          </Link>
        </li>

        <li className="w-full md:w-auto">
          <Link href={`${basePath}/cardapio`}>
            <div
              className={`flex items-center gap-3 px-3 py-2 text-[15px] rounded-md w-full md:w-auto whitespace-nowrap transition-all
              ${
                pathname.startsWith(`${basePath}/cardapio`)
                  ? "bg-(--color-secondary)"
                  : "hover:bg-(--color-secondary)/50"
              }`}
            >
              <Utensils size={19} />
              <span>Cardápio</span>
            </div>
          </Link>
        </li>

        <li className="w-full md:w-auto">
          <Link href={`${basePath}/layout`}>
            <div
              className={`flex items-center gap-3 px-3 py-2 text-[15px] rounded-md w-full md:w-auto whitespace-nowrap transition-all
              ${
                pathname.startsWith(`${basePath}/layout`)
                  ? "bg-(--color-secondary)"
                  : "hover:bg-(--color-secondary)/50"
              }`}
            >
              <Layout size={19} />
              <span>Layout</span>
            </div>
          </Link>
        </li>

        <li className="w-full md:w-auto">
          <Link href={`${basePath}/reservas`}>
            <div
              className={`flex items-center gap-3 px-3 py-2 text-[15px] rounded-md w-full md:w-auto whitespace-nowrap transition-all
              ${
                pathname.startsWith(`${basePath}/reservas`)
                  ? "bg-(--color-secondary)"
                  : "hover:bg-(--color-secondary)/50"
              }`}
            >
              <ArrowLeftRight size={18} />
              <span>Alternar perfil</span>
            </div>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
