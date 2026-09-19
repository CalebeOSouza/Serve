"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Utensils,
  Users,
  Layout,
  CalendarDays,
  ListTodo,
  ScrollText
} from "lucide-react";
import { usePathname } from "next/navigation";
import EmployeeProfileMenu from "@/components/dashboard/employee_profile_menu";

type Props = {
  restaurantId: string;
};

type MenuItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  exact?: boolean;
};

export function DashboardMenuTablet({ restaurantId }: Props) {
  const pathname = usePathname();

  const isGerente = pathname.includes("/roles/gerente");
  const isGarcom = pathname.includes("/roles/garcom");
  const isCozinha = pathname.includes("/roles/cozinha");
  const isCaixa = pathname.includes("/roles/caixa");

  const isAdmin =
    !isGerente &&
    !isGarcom &&
    !isCozinha &&
    !isCaixa;

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

  const gerenteMenu: MenuItem[] = [
    {
      label: "Funcionários",
      path: `${basePath}/funcionarios`,
      icon: Users,
    },
    {
      label: "Reservas",
      path: `${basePath}/reservas`,
      icon: CalendarDays,
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
      icon: ListTodo,
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
    <nav className="lg:hidden w-full bg-[#F9F9FC] text-[#253E6F] border-b border-[#ECEDF4]">
      <div className="flex flex-col w-full">

        <ul className="flex flex-col w-full gap-2 p-5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive = item.exact
              ? pathname === item.path
              : pathname.startsWith(item.path);

            return (
              <li key={item.path} className="w-full">
                <Link
                  href={item.path}
                  className="block w-full"
                >
                  <div
                    className={`
                      flex
                      items-center
                      gap-4
                      px-4
                      py-3
                      text-[15px]
                      rounded-md
                      w-full
                      whitespace-nowrap
                      transition-all
                      ${
                        isActive
                          ? "bg-[#E2EAFA]"
                          : "hover:bg-[#E2EAFA]"
                      }
                    `}
                  >
                    <Icon
                      size={18}
                      className="shrink-0"
                    />

                    <span>
                      {item.label}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {employeeRole && (
          <div className="mt-2">
            <EmployeeProfileMenu
              role={employeeRole}
            />
          </div>
        )}

      </div>
    </nav>
  );
}