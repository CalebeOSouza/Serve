"use client";

import { ChevronDown, CookingPot, HandPlatter, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type OrderItem = {
  id: number;
  menu_item_id: number;
  name: string;
  customer_name: string;
  quantity: number;
  unit_price: number;
  observation: string | null;
};

type Order = {
  id: number;
  status: "recebido" | "em_preparo" | "pronto" | "cancelado";
  created_at: string;
  waiter_name: string;
  items: OrderItem[];
};

type TableOrders = {
  table_id: number;
  table_number: number;
  orders: Order[];
};

type Category = {
  id: number;
  name: string;
  subcategories: {
    id: number;
    name: string;
    items: {
      id: number;
      category_id: number;
      name: string;
      description: string | null;
      price: number;
      image_url: string | null;
      available: boolean;
    }[];
  }[];
};

type ApiResponse = {
  categories: Category[];
  tables: TableOrders[];
};
export default function Pedidos_Cozinha() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [activeTab, setActiveTab] = useState<
    "recebidos" | "preparo" | "prontos"
  >("recebidos");

  const [tables, setTables] = useState<TableOrders[]>([]);
  const [loading, setLoading] = useState(true);
const [categoryOrder, setCategoryOrder] = useState<Map<number, number>>(
  new Map(),
);
 useEffect(() => {
  if (!restaurantId) return;

  let isMounted = true;

  const loadOrders = async (initialLoad = false) => {
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/garcom/orders?view=panel`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar pedidos.");
      }

     const data: ApiResponse = await response.json();

const orderMap = new Map<number, number>();
let orderIndex = 0;

for (const category of data.categories || []) {
  for (const subcategory of category.subcategories || []) {
    for (const item of subcategory.items || []) {
      orderMap.set(item.id, orderIndex++);
    }
  }
}

if (isMounted) {
  setTables(data.tables || []);
  setCategoryOrder(orderMap);

        if (initialLoad) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos da cozinha:", error);

      if (isMounted && initialLoad) {
        setLoading(false);
      }
    }
  };

  loadOrders(true);

  const interval = setInterval(() => {
    loadOrders(false);
  }, 3000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [restaurantId]);

  const allOrders = tables.flatMap((table) =>
    table.orders.map((order) => ({
      ...order,
      table_number: table.table_number,
    })),
  );

  const recebidos = allOrders.filter((order) => order.status === "recebido");

  const emPreparo = allOrders.filter((order) => order.status === "em_preparo");

  const prontos = allOrders.filter((order) => order.status === "pronto");

  const filteredOrders =
    activeTab === "recebidos"
      ? recebidos
      : activeTab === "preparo"
        ? emPreparo
        : prontos;

  const emptyState = {
    recebidos: {
      title: "Nenhum pedido recebido",
      description: "Novos pedidos enviados para a cozinha aparecerão aqui.",
    },
    preparo: {
      title: "Nenhum pedido em preparo",
      description: "Os pedidos que estiverem sendo preparados aparecerão aqui.",
    },
    prontos: {
      title: "Nenhum pedido pronto",
      description: "Os pedidos finalizados pela cozinha aparecerão aqui.",
    },
  };

  const currentEmptyState = emptyState[activeTab];

const getOrderedItems = (items: OrderItem[]) => {
  return [...items].sort((a, b) => {
    const orderA = categoryOrder.get(a.menu_item_id) ?? Number.MAX_SAFE_INTEGER;
    const orderB = categoryOrder.get(b.menu_item_id) ?? Number.MAX_SAFE_INTEGER;

    return orderA - orderB;
  });
};

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "recebido":
        return "Recebido";

      case "em_preparo":
        return "Em preparo";

      case "pronto":
        return "Pronto";

      default:
        return status;
    }
  };

  const getHeaderClass = (status: Order["status"]) => {
    switch (status) {
      case "recebido":
        return "bg-[#616161]";

      case "em_preparo":
        return "bg-[#EF8E2E]";

      case "pronto":
        return "bg-(--color-primary)";

      default:
        return "bg-gray-500";
    }
  };

  const getBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "recebido":
        return "bg-[#7f7f7f] text-white";

      case "em_preparo":
        return "bg-[#FDBE75] text-white";

      case "pronto":
        return "bg-[#2d4583] text-white";

      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getButtonClass = (status: Order["status"]) => {
    switch (status) {
      case "recebido":
        return "border-[#616161] text-[#616161] hover:bg-[#616161]";

      case "em_preparo":
        return "border-[#EF8E2E] text-[#EF8E2E] hover:bg-[#EF8E2E]";

      default:
        return "";
    }
  };

  const updateOrderStatus = async (
    orderId: number,
    status: "em_preparo" | "pronto",
  ) => {
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/garcom/orders`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar pedido.");
      }

      setTables((currentTables) =>
        currentTables.map((table) => ({
          ...table,
          orders: table.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                }
              : order,
          ),
        })),
      );
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col">
      <div className="px-10 pb-10 pt-10 md:px-10 max-lg:landscape:px-3">
        <header className="flex justify-between text-start flex-col gap-6 lg:flex-row lg:gap-0">
          <div className="flex flex-col">
            <h1 className="font-semibold text-[27px] text-[#19274b] flex gap-2 items-center">
              Cozinha
            </h1>

            <p className="text-[16px] text-[#19274b] text-[#3e5ead]">
              Acompanhe e prepare os pedidos recebidos em tempo real.
            </p>
          </div>

          <div className="w-full lg:w-[280px]">
            <label className="mb-2 block text-[13px] font-medium text-[#536078]">
              Status dos pedidos
            </label>

            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) =>
                  setActiveTab(
                    e.target.value as "recebidos" | "preparo" | "prontos",
                  )
                }
                className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white px-4 pr-10 text-sm font-medium text-[#19274b] outline-none transition cursor-pointer"
              >
                <option value="recebidos">
                  Recebidos ({recebidos.length})
                </option>

                <option value="preparo">Em preparo ({emPreparo.length})</option>

                <option value="prontos">Prontos ({prontos.length})</option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
            </div>
          </div>
        </header>
      </div>

      <span className="relative w-full h-px bg-gray-200" />

      <main className="px-10 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 items-start">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <p className="text-[14px] text-[#7d89a6]">Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-36 w-full h-full border border-gray-200 rounded-md col-span-full mt-5">
            <div className="bg-[#F5F5F6] p-6 rounded-full flex items-center justify-center">
              <ScrollText className="w-14 h-14 text-[#CCCFD4]" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-gray-800 font-bold text-[20px]">
                {currentEmptyState.title}
              </p>

              <p className="text-gray-500 text-[15px] w-92 text-center">
                {currentEmptyState.description}
              </p>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col mt-5 w-full bg-[#FEFEFE] rounded-lg shadow-sm"
            >
              <header
                className={`${getHeaderClass(
                  order.status,
                )} w-full rounded-t-lg flex items-center justify-between px-4 py-2 shadow-sm`}
              >
                <div className="flex flex-col items-start">
                  <p className="font-semibold text-white text-[14px]">
                    Pedido #{order.id}
                  </p>

                  <p className="text-white text-[14px]">
                    {formatTime(order.created_at)}
                  </p>
                </div>

                <div className="flex flex-col items-start">
                  <span
                    className={`${getBadgeClass(
                      order.status,
                    )} text-[13.5px] font-medium px-2 py-0.5 rounded-full`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </header>

              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-[14px]">
                    Mesa {String(order.table_number).padStart(2, "0")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <HandPlatter className="w-4.5 h-4.5 text-[#19274b]" />

                  <p className="font-medium text-[14px]">
                    {order.waiter_name || "Garçom"}
                  </p>
                </div>
              </div>

              <span className="relative w-full h-px bg-gray-100" />

              <div className="p-3 py-5">
                <div className="flex flex-col gap-4">
                  {getOrderedItems(order.items).map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <p className="font-medium text-[15px]">
                        {item.quantity}x
                      </p>

                      <div className="flex flex-col items-start gap-0.5">
                        <p className="font-semibold text-[15px] text-[#19274b]">
                          {item.name}
                        </p>

                        {item.observation && (
                          <p className="text-[14px] text-[#7d89a6]">
                            {item.observation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(order.status === "recebido" ||
                order.status === "em_preparo") && (
                <footer className="w-full flex items-center px-3 pb-4">
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order.id,
                        order.status === "recebido" ? "em_preparo" : "pronto",
                      )
                    }
                    className={`py-2 rounded-md text-[13px] font-semibold cursor-pointer w-full border hover:text-white hover:border-transparent ${getButtonClass(
                      order.status,
                    )}`}
                  >
                    {order.status === "recebido" ? "Começar" : "Concluir"}
                  </button>
                </footer>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
