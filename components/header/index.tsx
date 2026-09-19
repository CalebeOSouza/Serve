"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import AdminMenu from "../menus/adminMenu";
import GerenteMenu from "../menus/gerenteMenu";
import ClienteMenu from "../menus/clienteMenu";
import CozinhaMenu from "../menus/cozinhaMenu";
import GarcomMenu from "../menus/garcomMenu";
import CaixaMenu from "../menus/caixaMenu";
import LogoutButton from "../logout_btn";

import { Bell, BellOff } from "lucide-react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setshowHeader] = useState(true);

  const [onboardingNotification, setOnboardingNotification] =
    useState<any>(null);

  const [showOnboardingNotification, setShowOnboardingNotification] =
    useState(false);

  const [openNotifications, setOpenNotifications] = useState(false);

  const [orderNotifications, setOrderNotifications] = useState<
    {
      id: number;
      status: string;
      created_at: string;
      table_number: number;
    }[]
  >([]);

  const [hasNewOrderNotification, setHasNewOrderNotification] = useState(false);
  const seenOrderIdsRef = useRef<number[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log(session);
  const role = session?.user?.role?.toLowerCase() ?? null;
  const restaurantId = session?.user?.restaurantId;
  const isLogged = !!session;
  const hasRole = role !== null;

  function renderMenu() {
    console.log("Role atual:", role);

    switch (role) {
      case "admin":
        return <AdminMenu />;
      case "gerente":
        return <GerenteMenu />;
      case "cliente":
        return <ClienteMenu />;
      case "cozinha":
        return <CozinhaMenu />;
      case "garcom":
        return <GarcomMenu />;
      case "caixa":
        return <CaixaMenu />;
      default:
        return <LogoutButton />;
    }
  }

  type ScrollDirection = "up" | "down" | null;

  const lastscrollY = useRef<number>(0);
  const accumulated = useRef<number>(0);
  const lastDirection = useRef<ScrollDirection>(null);

  useEffect(() => {
    lastscrollY.current = window.scrollY;

    const handleScroll = () => {
      if (pathname.startsWith("/admin/dashboard")) {
        setshowHeader(true);
        return;
      } else if (pathname.startsWith("/roles")) {
        setshowHeader(true);
        return;
      }

      const current = window.scrollY;
      const diff = current - lastscrollY.current;

      if (Math.abs(diff) < 5) return;

      const direction: ScrollDirection = diff > 0 ? "down" : "up";

      if (direction !== lastDirection.current) {
        accumulated.current = 0;
        lastDirection.current = direction;
      }

      accumulated.current += Math.abs(diff);

      if (direction === "down" && accumulated.current > 200 && !menuOpen) {
        setshowHeader(false);
        accumulated.current = 0;
      }

      if (direction === "up" && accumulated.current > 100) {
        setshowHeader(true);
        accumulated.current = 0;
      }

      lastscrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen, pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleResize = () => {
      if (mediaQuery.matches) {
        setMenuOpen(false);
      }
    };

    handleResize();

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const notifications = useRef<number>(0);
  // Recebendo a notificação de abandono do onboarding
  // useEffect(() => {
  //   async function checkOnboarding() {
  //     try {
  //       const res = await fetch("/api/restaurant/onboarding-status");
  //       const data = await res.json();

  //       if (!data?.restaurant) {
  //         setOnboardingNotification(null);
  //         setShowOnboardingNotification(false);
  //         return;
  //       }

  //       const restaurant = data.restaurant;

  //       if (restaurant.onboarding_step === 0) {
  //         setOnboardingNotification(null);
  //         setShowOnboardingNotification(false);
  //         return;
  //       }

  //       setOnboardingNotification(restaurant);

  //       const updatedAt = new Date(restaurant.updated_at);
  //       //60 * 60
  //       const notificationTime = new Date(updatedAt.getTime() + 5 * 1000);

  //       const now = new Date();
  //       const timeLeft = notificationTime.getTime() - now.getTime();

  //       if (timeLeft <= 0) {
  //         setShowOnboardingNotification(true);
  //       } else {
  //         setTimeout(() => {
  //           setShowOnboardingNotification(true);
  //         }, timeLeft);
  //       }
  //     } catch (error) {
  //       console.error("Erro ao verificar onboarding:", error);

  //       setOnboardingNotification(null);
  //       setShowOnboardingNotification(false);
  //     }
  //   }

  //   if (session) {
  //     checkOnboarding();
  //   }
  // }, [session]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function checkOnboarding() {
      try {
        const res = await fetch("/api/restaurant/onboarding-status");
        const data = await res.json();

        if (!data?.restaurant) {
          setOnboardingNotification(null);
          setShowOnboardingNotification(false);
          return;
        }

        const restaurant = data.restaurant;

        if (restaurant.onboarding_step === 0) {
          setOnboardingNotification(null);
          setShowOnboardingNotification(false);
          return;
        }

        setOnboardingNotification(restaurant);
      } catch (error) {
        console.error("Erro ao verificar onboarding:", error);
        setOnboardingNotification(null);
        setShowOnboardingNotification(false);
      }
    }

    checkOnboarding();

    const interval = setInterval(checkOnboarding, 30000);

    return () => clearInterval(interval);
  }, [status, pathname]);

  //Timer

  useEffect(() => {
    if (!onboardingNotification) return;

    const updatedAt = new Date(onboardingNotification.updated_at);

    const notificationTime = new Date(updatedAt.getTime() + 60 * 1000);

    const now = new Date();
    const timeLeft = notificationTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
      setShowOnboardingNotification(true);
      return;
    }

    let secondsLeft = Math.floor(timeLeft / 1000);

    const interval = setInterval(() => {
      secondsLeft--;

      if (secondsLeft <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      setShowOnboardingNotification(true);
      clearInterval(interval);
    }, timeLeft);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onboardingNotification]);

  //Mostrar os pedidos prontos pro garçom que fez eles

  useEffect(() => {
    if (status !== "authenticated" || role !== "garcom" || !restaurantId) {
      setOrderNotifications([]);
      setHasNewOrderNotification(false);
      seenOrderIdsRef.current = [];
      return;
    }

    let isMounted = true;
    let firstLoad = true;

    const loadOrderNotifications = async () => {
      try {
        const response = await fetch(
          `/api/restaurant/${restaurantId}/garcom/notifications`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const orders = data.orders || [];

        if (!isMounted) {
          return;
        }

        const currentOrderIds = orders.map((order: { id: number }) => order.id);

        setOrderNotifications(orders);

        if (firstLoad) {
          seenOrderIdsRef.current = currentOrderIds;
          firstLoad = false;
          setHasNewOrderNotification(orders.length > 0);
          return;
        }

        const newOrders = orders.filter(
          (order: { id: number }) =>
            !seenOrderIdsRef.current.includes(order.id),
        );

        if (newOrders.length > 0) {
          setHasNewOrderNotification(true);
        }

        if (orders.length === 0) {
          setHasNewOrderNotification(false);
        }

        seenOrderIdsRef.current = currentOrderIds;
      } catch (error) {
        console.error("Erro ao verificar pedidos prontos:", error);
      }
    };

    loadOrderNotifications();

    const interval = setInterval(loadOrderNotifications, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [status, role, restaurantId]);

  const renderContent = () => {
    if (isLogged && hasRole) {
      return (
        <div className="flex flex-col items-start w-full text-start mb-5 text-(--color-text)">
          {renderMenu()}
        </div>
      );
    }

    if (isLogged) {
      return (
        <div className="flex flex-col items-start w-full text-start mb-5 text-(--color-text)">
          <Link
            href="/"
            className="flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
          >
            <li className={`flex items-center`}>
              Logado sem role definido
              <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
            </li>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start w-full text-start mb-5 text-(--color-text)">
        <p className="text-(--color-primary) text-sm font-semibold border-b border-b-gray-300 w-full py-3">
          Funções
        </p>

        <Link
          href="/"
          className="flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            Início
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>

        <Link
          href="/funcionalidades"
          className="border-y border-y-gray-300 flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            Funcionalidades
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>

        <Link
          href="/suporte"
          className="border-b border-b-gray-300 flex items-center py-5 gap-2 w-full relative transition-all hover:text-(--color-secondary)"
        >
          <li className={`flex items-center`}>
            Suporte
            <i className="absolute bi bi-chevron-right right-0 text-sm"></i>
          </li>
        </Link>

        <div className="flex flex-col items-start w-full text-start text-(--color-text)">
          <p className="text-(--color-primary) text-sm font-semibold border-b border-b-gray-300 w-full py-3">
            Conta
          </p>
          <div className="flex items-center gap-8">
            <li className="flex gap-5 items-center justify-start py-5 relative w-full">
              <Link href="/account_access?mode=cadastro">
                <button className="cursor-pointer rounded-lg bg-(--color-primary) px-7 py-2 text-center text-white text-[12px] transition-all ease-in-out duration-200 hover:bg-[#253e6f]">
                  Começar
                </button>
              </Link>
            </li>
            <li className="hover:text-(--color-secondary)">
              <Link href="/account_access?mode=login">Entrar</Link>
            </li>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className="relative z-9999">
      <div
        className={`fixed top-0 left-0 z-40 bg-white border-b border-gray-200 px-10 py-4 w-full flex items-center font-bold text-sm transition-all duration-300 ease-in-out ${
          showHeader || menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-6 pointer-events-none"
        }`}
      >
        <div
          className={`absolute right-8 top-1/2 -translate-y-1/2 z-40 flex items-center gap-6
  ${isLogged && hasRole ? "flex" : "flex lg:hidden"}`}
        >
          <div className="relative hover:animate-[ring_0.9s_ease-in-out]">
            <Bell
              className="w-5 h-5 text-(--color-primary) cursor-pointer origin-top "
              onClick={() => setOpenNotifications(!openNotifications)}
            />

            {(showOnboardingNotification || orderNotifications.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-(--color-primary) h-2 w-2 rounded-full"></span>
            )}
          </div>

          {openNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white shadow-lg border border-gray-200 rounded-lg p-4 z-50">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">
                    Notificações
                  </p>

                  {(orderNotifications.length > 0 ||
                    showOnboardingNotification) && (
                    <span className="text-xs font-medium text-(--color-primary)">
                      Nova
                    </span>
                  )}
                </div>

                {orderNotifications.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                    {orderNotifications.map((order) => (
                      <button
                        key={order.id}
                        onClick={() => {
                          router.push(
                            `/roles/garcom/dashboard/${restaurantId}/salao`,
                          );
                        }}
                        className="w-full text-left transition cursor-pointer"
                      >
                        <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3 hover:bg-gray-100 transition">
                          <div className="mt-1.5 w-2 h-2 rounded-full bg-(--color-primary) shrink-0" />

                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-gray-800">
                              Pedido pronto
                            </p>

                            <p className="text-xs text-gray-600">
                              O pedido #{order.id} da mesa{" "}
                              {String(order.table_number).padStart(2, "0")} está
                              pronto para ser entregue.
                            </p>

                            <p className="text-[11px] text-gray-400">
                              {new Date(order.created_at).toLocaleTimeString(
                                "pt-BR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showOnboardingNotification && onboardingNotification && (
                  <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm font-semibold text-gray-800">
                      Onboarding incompleto
                    </p>

                    <p className="text-sm text-gray-600">
                      Você não terminou de configurar o restaurante{" "}
                      {onboardingNotification.profile.name}.
                    </p>

                    <button
                      onClick={() =>
                        router.push(
                          `/admin/onboarding/${onboardingNotification.id}`,
                        )
                      }
                      className="mt-2 bg-(--color-primary) text-white text-sm px-3 py-2 rounded-md hover:bg-(--color-secondary) cursor-pointer"
                    >
                      Continuar configuração
                    </button>
                  </div>
                )}

                {orderNotifications.length === 0 && !showOnboardingNotification && (
                  <div className="py-3 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F3F5F8] flex items-center justify-center">
                      <BellOff className="w-6 h-6 text-[#89909F]" />
                    </div>

                    <p className="text-[14px] font-semibold text-[#555B6B] mt-3">
                      Nenhuma notificação!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <i
            className="bi bi-list cursor-pointer text-2xl text-(--color-primary)"
            onClick={() => setMenuOpen(true)}
          ></i>
        </div>

        <nav className="flex items-center justify-between w-full h-full lg:mx-8 md:mx-0">
          <Link href="/" className="flex items-center select-none">
            <img
              src="/Serve6.png"
              alt="Serve"
              className="h-[35px] w-auto object-contain shrink-0"
            />
          </Link>

          {!isLogged && (
            <>
              {/* ================= PÚBLICO ================= */}
              {/* ===== Links ===== */}

              <div className="lg:block md:hidden hidden ">
                <ul className="flex items-center gap-8 text-(--color-primary)">
                  <li
                    className={`relative group hover:text-(--color-secondary) px-2 `}
                  >
                    <Link
                      href="/"
                      className="flex items-center gap-2 font-bold"
                    >
                      Início
                    </Link>
                    <span
                      className={`
      absolute left-0 -bottom-2 h-0.5 bg-(--color-primary)
      ${
        pathname === "/"
          ? "w-full"
          : "w-0 group-hover:w-full transition-all duration-300"
      }
    `}
                    />
                  </li>
                  <li className="relative group hover:text-(--color-secondary)">
                    <Link href="" className="flex items-center gap-2">
                      {/* <i className="bi bi-grid-1x2-fill text-sm"></i>*/}
                      Funcionalidades
                    </Link>

                    <span
                      className={`
      absolute left-0 -bottom-2 h-0.5 bg-(--color-primary)
      ${
        pathname === "/funcionalidades"
          ? "w-full"
          : "w-0 group-hover:w-full transition-all duration-300"
      }
    `}
                    />
                  </li>
                  <li className="relative group hover:text-(--color-secondary)">
                    <Link href="" className="flex items-center gap-2">
                      {/*<i className="bi bi-headset text-sm"></i>*/}Suporte
                    </Link>

                    <span
                      className={`
      absolute left-0 -bottom-2 h-0.5 bg-(--color-primary)
      ${
        pathname === "/suporte"
          ? "w-full"
          : "w-0 group-hover:w-full transition-all duration-300"
      }
    `}
                    />
                  </li>
                </ul>
              </div>

              {/* ===== Cadastro e login ===== */}
              <div className="lg:block md:hidden hidden">
                <ul className="flex items-center gap-8 text-(--color-primary)">
                  <li>
                    <Link href="/account_access?mode=cadastro">
                      <button className="cursor-pointer rounded-lg bg-(--color-primary) px-7 py-2 text-center text-white text-[12px] transition-all ease-in-out duration-200 hover:bg-[#253e6f]">
                        Começar
                      </button>
                    </Link>
                  </li>
                  <li className="hover:text-(--color-secondary)">
                    <Link href="/account_access?mode=login">Entrar</Link>
                  </li>
                </ul>
              </div>
            </>
          )}

          {/* ================= LOGADO SEM ROLE ================= */}
          {isLogged && !hasRole && (
            <div className="flex items-center gap-6 text-(--color-primary)">
              <Link href="/profile">Perfil</Link>
              <LogoutButton />
            </div>
          )}
        </nav>
      </div>

      {/* ===== MENU MOBILE ===== */}

      <div
        className={`fixed top-0 right-0 z-50 bg-(--color-bg) h-full w-[70%] md:w-[20%] flex flex-col gap-8 items-start p-5 transform transition-transform duration-300 shadow-lg text-[14px] font-bold overflow-y-auto overscroll-contain lg:   ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } `}
      >
        <i
          className="bi bi-x-lg text-[22px] text-(--color-primary)
               absolute mt-0.5 top-4 right-10 cursor-pointer z-50"
          onClick={() => setMenuOpen(false)}
        ></i>

        <ul className="flex flex-col items-start justify-between text-center w-full mt-10">
          {renderContent()}
        </ul>
      </div>
    </header>
  );
}
