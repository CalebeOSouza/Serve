"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Users,
  Layout,
  ArrowLeftRight,
  CalendarDays,
  ScrollText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import EmployeeProfileMenu from "@/components/dashboard/employee_profile_menu";
type Props = {
  restaurantId: string | string[];
};

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  exact?: boolean;
};

export function DashboardMenu({ restaurantId }: Props) {
  const pathname = usePathname();

  const isGerente = pathname.includes("/roles/gerente");
  const isGarcom = pathname.includes("/roles/garcom");
  const isCozinha = pathname.includes("/roles/cozinha");
  const isCaixa = pathname.includes("/roles/caixa");

  const isAdmin = !isGerente && !isGarcom && !isCozinha && !isCaixa;

  let basePath = `/admin/dashboard/${restaurantId}`;
  

  if (isGerente) {
    basePath = `/roles/gerente/dashboard/${restaurantId}`;
  }

  if (isGarcom) {
    basePath = `/roles/garcom/dashboard/${restaurantId}`;
  }

  if (isCozinha) {
    basePath = `/roles/cozinha/dashboard/${restaurantId}`;
  }

  if (isCaixa) {
    basePath = `/roles/caixa/dashboard/${restaurantId}`;
  }

  const adminMenu: MenuItem[] = [
    {
      label: "Dashboard",
      path: basePath,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Funcionários",
      path: `${basePath}/funcionarios`,
      icon: Users,
    },
    {
      label: "Cardápio",
      path: `${basePath}/cardapio`,
      icon: Utensils,
    },
    {
      label: "Layout",
      path: `${basePath}/layout`,
      icon: Layout,
    },
  ];

  const gerenteMenu: MenuItem[] = [
    {
      label: "Funcionários",
      path: `${basePath}/funcionarios`,
      icon: Users,
    },
    {
      label: "Layout",
      path: `${basePath}/layout`,
      icon: Layout,
    },
    {
      label: "Reservas",
      path: `${basePath}/reservas`,
      icon: CalendarDays,
    },
    {
      label: "Logs",
      path: `${basePath}/logs`,
      icon: ScrollText,
    },
  ];

  const garcomMenu: MenuItem[] = [
    {
      label: "Salão",
      path: `${basePath}/salao`,
      icon: Layout,
    },
    {
      label: "Reservas",
      path: `${basePath}/reservas`,
      icon: CalendarDays,
    },
  ];

  const cozinhaMenu: MenuItem[] = [
    {
      label: "Pedidos",
      path: `${basePath}/pedidos`,
      icon: Utensils,
    },
  ];

  const caixaMenu: MenuItem[] = [
    {
      label: "Pedidos",
      path: `${basePath}/pedidos`,
      icon: Utensils,
    },
  ];

  let menuItems: MenuItem[] = [];

  if (isAdmin) {
    menuItems = adminMenu;
  } else if (isGerente) {
    menuItems = gerenteMenu;
  } else if (isGarcom) {
    menuItems = garcomMenu;
  } else if (isCozinha) {
    menuItems = cozinhaMenu;
  } else if (isCaixa) {
    menuItems = caixaMenu;
  }
const employeeRole =
  isGerente
    ? "gerente"
    : isGarcom
      ? "garcom"
      : isCozinha
        ? "cozinha"
        : isCaixa
          ? "caixa"
          : null;
  return (
    <section className="hidden lg:flex fixed top-0 left-0 h-screen w-55 bg-[#F9F9FC] text-(--color-secondary) z-10 border-r border-[#ECEDF4]">
      {/* bg-(--color-primary) */}
      <div className="flex flex-col w-full text-center mx-auto mt-3">
        <ul className="flex flex-col px-5 py-10 pt-20 w-full items-start text-left">
          <div className="flex flex-col items-start gap-3 text-[15px] w-full">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = item.exact
                ? pathname === item.path
                : pathname.startsWith(item.path);

              return (
                <li key={item.path} className="w-full">
                  <Link href={item.path} className="block w-full">
                    <div
                      className={`flex items-center gap-4 px-3 py-3 rounded-md transition-all
                      ${isActive ? "bg-[#E2EAFA]" : "hover:bg-[#E2EAFA]"}`}
                    >
                      <Icon size={18} className="shrink-0" />

                      <span
                        className={
                          item.label === "Alternar perfil"
                            ? "whitespace-nowrap"
                            : ""
                        }
                      >
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </div>
        </ul>

{employeeRole && (
        <div className="mt-auto">
          <EmployeeProfileMenu
            role={employeeRole}
          />
        </div>
      )}

      </div>
    </section>
  );
}
