"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import LogoutButton from "../logout_btn";

import {
  Bell,
  BellOff,
  ChefHat,
  ChevronRight,
  CircleHelp,
  CookingPot,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Plus,
  Store,
  UserRound,
  UtensilsCrossed,
  WalletCards,
  X,
} from "lucide-react";

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

const isAuthenticated = status === "authenticated";
const isUnauthenticated = status === "unauthenticated";
const hasRole = role !== null;

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

// useEffect(() => {
//   if (status !== "authenticated") return;

//   async function checkOnboarding() {
//     try {
//       const res = await fetch("/api/restaurant/onboarding-status", {
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (!data?.restaurant) {
//         setOnboardingNotification(null); if (status !== "authenticated") return;
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

//       const updatedAt = new Date(restaurant.updated_at).getTime();
//       const now = Date.now();

//       const elapsed = now - updatedAt;

//       if (elapsed >= 5000) {
//         setShowOnboardingNotification(true);
//       } else {
//         setShowOnboardingNotification(false);
//       }
//     } catch (error) {
//       console.error("Erro ao verificar onboarding:", error);
//       setOnboardingNotification(null);
//       setShowOnboardingNotification(false);
//     }
//   }

//   checkOnboarding();

//   const interval = setInterval(checkOnboarding, 2000);

//   return () => clearInterval(interval);
// }, [status, pathname]);
 

useEffect(() => {
  if (status !== "authenticated") return;

  let active = true;

  async function checkOnboarding() {
    try {
      const res = await fetch("/api/restaurant/onboarding-status", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (!active) return;

      if (!data?.exists || !data?.restaurant) {
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

      const updatedAt = new Date(restaurant.updated_at).getTime();

      if (!Number.isFinite(updatedAt)) {
        setShowOnboardingNotification(false);
        return;
      }

      setShowOnboardingNotification(
        Date.now() - updatedAt >= 5000,
      );
    } catch {
      
    }
  }

  checkOnboarding();

  const interval = setInterval(checkOnboarding, 2000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}, [status, pathname]);


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
  ${isAuthenticated && hasRole ? "flex" : "flex lg:hidden"}`}


  
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

                {orderNotifications.length === 0 &&
                  !showOnboardingNotification && (
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
            className="bi bi-list cursor-pointer text-2xl text-(--color-primary) shrink-0"
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

          {isUnauthenticated && (
            <>
              {/* Público */}

              {/* <div className="lg:block md:hidden hidden ">
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
                  
                </ul>
              </div> */}

              <div className="lg:block md:hidden hidden">
                <ul className="flex items-center gap-8 text-(--color-primary)">
                  <li>
                    <Link href="/account_access?mode=cadastro">
                      <button className="cursor-pointer rounded-lg bg-(--color-primary) px-7 py-2 text-center text-white text-[12px] transition-all ease-in-out duration-200 hover:bg-[#1d3d7d]">
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
        </nav>
      </div>

      {/* Menu mobile */}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-[78%] max-w-[320px] bg-[#fafafa] px-5 py-5 shadow-2xl transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center text-(--color-primary) transition-opacity cursor-pointer"
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>

          <div className="mt-5 flex flex-1 flex-col">
            {isAuthenticated && hasRole ? (
              <>
                <p className="mb-2 px-3 text-[14px] font-semibold text-(--color-primary)">
                  Menu
                </p>

                <div className="flex flex-col gap-1">
                  {role === "admin" && (
                    <>
                      <Link
                        href="/"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname === "/"
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Início</span>
                      </Link>

                      <Link
                        href="/admin/my-restaurants"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname.startsWith("/admin/my-restaurants")
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <Store className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Meus restaurantes</span>
                      </Link>

                      <Link
                        href="/admin/onboarding/create-restaurant"
                        onClick={() => setMenuOpen(false)}
                        className="mt-2 flex items-center justify-center gap-4 rounded-lg bg-(--color-primary) px-3 py-2.25 text-[14.5px] font-medium text-white transition hover:bg-(--color-secondary)"
                      >
                        
                        <span>Criar restaurante</span>
                      </Link>
                    </>
                  )}

                  {role === "garcom" && (
                    <>
                      <Link
                        href={`/`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                      >
                        <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Início</span>
                      </Link>

                      <Link
                        href={`/roles/garcom/dashboard/${restaurantId}/salao`}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname.startsWith(
                            `/roles/garcom/dashboard/${restaurantId}/salao`,
                          )
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <CookingPot className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Salão</span>
                      </Link>
                    </>
                  )}

                  {role === "cozinha" && (
                    <>
                      <Link
                        href={`/`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                      >
                        <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Início</span>
                      </Link>

                      <Link
                        href={`/roles/cozinha/dashboard/${restaurantId}/pedidos_cozinha`}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname.startsWith(
                            `/roles/cozinha/dashboard/${restaurantId}/pedidos_cozinha`,
                          )
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <ChefHat className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Cozinha</span>
                      </Link>
                    </>
                  )}

                  {role === "caixa" && (
                    <>
                      <Link
                        href={`/`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                      >
                        <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Início</span>
                      </Link>

                      <Link
                        href={`/roles/caixa/dashboard/${restaurantId}/painel_caixa`}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname.startsWith(
                            `/roles/caixa/dashboard/${restaurantId}/painel_caixa`,
                          )
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <WalletCards className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Caixa</span>
                      </Link>
                    </>
                  )}

                  {role === "gerente" && (
                    <>
                      <Link
                        href={`/`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                      >
                        <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Início</span>
                      </Link>

                      <Link
                        href={`/roles/gerente/dashboard/${restaurantId}/funcionarios`}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
                          pathname.startsWith(
                            `/roles/gerente/dashboard/${restaurantId}/funcionarios`,
                          )
                            ? "bg-[#eaf1fb] text-(--color-primary)"
                            : "text-(--color-primary)/80 hover:bg-[#f1f4f8]"
                        }`}
                      >
                        <UserRound className="h-[21px] w-[21px] stroke-[1.7]" />
                        <span>Painel gerente</span>
                      </Link>
                    </>
                  )}

                </div>

                <div className="mt-auto">
                  <div className="mb-4 border-t border-[#e7e9ed]" />

                  <p className="mb-4 px-3 text-[14px] font-semibold text-(--color-primary)">
                    Conta
                  </p>

                  <div className="flex items-center gap-2 px-3 text-[14px] font-medium text-(--color-primary)/80">
                    <LogoutButton />
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="mb-2 px-3 text-[14px] font-semibold text-(--color-primary)">
                  Menu
                </p>

                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                  >
                    <Home className="h-[21px] w-[21px] stroke-[1.7]" />
                    <span>Início</span>
                  </Link>

                  <Link
                    href="/funcionalidades"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                  >
                    <LayoutGrid className="h-[21px] w-[21px] stroke-[1.7]" />
                    <span>Funcionalidades</span>
                  </Link>

                  <Link
                    href="/suporte"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 rounded-lg px-3 py-2.5 text-[15px] font-medium text-(--color-primary)/80 transition hover:bg-[#f1f4f8]"
                  >
                    <CircleHelp className="h-[21px] w-[21px] stroke-[1.7]" />
                    <span>Suporte</span>
                  </Link>
                </div>

                <div className="mt-auto">
                  <div className="mb-4 border-t border-[#e7e9ed]" />

                  <p className="mb-4 text-[14px] font-semibold text-(--color-primary)">
                    Conta
                  </p>

                  <div className="flex flex-col w-full gap-2">
                    <Link
                      href="/account_access?mode=cadastro"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-lg bg-(--color-primary) px-3 py-2 text-[14px] font-semibold text-white transition hover:bg-(--color-secondary)"
                    >
                      <span>Começar</span>
                    </Link>

                    <Link
                      href="/account_access?mode=login"
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-1 items-center justify-center rounded-lg border border-[#dfe4eb] bg-white px-3 py-2 text-[14px] font-semibold text-(--color-primary) transition hover:bg-[#f1f4f8]"
                    >
                      <span>Entrar</span>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
