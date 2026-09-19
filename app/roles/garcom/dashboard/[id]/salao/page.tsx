"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  CookingPot,
  PackageCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  UserRound,
  MessageSquareText,
  LoaderCircle,
  ScrollText,
} from "lucide-react";

import Salao from "@/components/restaurant/salao";

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
  status: string;
  created_at: string;
  items: OrderItem[];
};

type TableOrders = {
  table_id: number;
  table_number: number;
  orders: Order[];
};

export default function LayoutPage() {
  const params = useParams();

  const restaurantId = params.id as string;

  const [tables, setTables] = useState<TableOrders[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [expandedTables, setExpandedTables] = useState<Record<number, boolean>>(
    {},
  );

  const loadOrders = async () => {
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

      const data = await response.json();

      setTables(data.tables || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setTables([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  async function handleDeliverOrder(orderId: number) {
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/garcom/orders`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
          }),
        },
      );

      if (!response.ok) return;

      setTables((prev) =>
        prev
          .map((table) => ({
            ...table,
            orders: table.orders.filter((order) => order.id !== orderId),
          }))
          .filter((table) => table.orders.length > 0),
      );
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (!restaurantId) return;

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [restaurantId]);

  const toggleTable = (tableId: number) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }));
  };

  const getOrderStatus = (status: string) => {
    const normalized = status.toLowerCase().replace(/\s/g, "_");

    if (normalized === "pronto" || normalized === "ready") {
      return "pronto";
    }

    return "preparo";
  };

  const preparingTables = tables.filter((table) =>
    table.orders.some((order) => getOrderStatus(order.status) === "preparo"),
  );

  const readyTables = tables.filter((table) =>
    table.orders.some((order) => getOrderStatus(order.status) === "pronto"),
  );

  const preparingOrders = tables.reduce(
    (total, table) =>
      total +
      table.orders.filter((order) => getOrderStatus(order.status) === "preparo")
        .length,
    0,
  );

  const readyOrders = tables.reduce(
    (total, table) =>
      total +
      table.orders.filter((order) => getOrderStatus(order.status) === "pronto")
        .length,
    0,
  );

  const formatTime = (date: string) => {
    const parsedDate = new Date(date);

    return parsedDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrder = (order: Order, isReady: boolean) => {
    return (
      <div
        key={order.id}
        className="rounded-lg border border-[#E8EAF0] bg-white overflow-hidden"
      >
        {/* CABEÇALHO DO PEDIDO */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#EEF0F4]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isReady ? "bg-[#244995]" : "bg-[#FC811D]"
              }`}
            />

            <p className="text-[14px] font-semibold text-[#19274b]">
              Pedido #{order.id}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[#73788A]">
            <Clock className="w-4.5 h-4.5" />

            <span className="text-[14px]">{formatTime(order.created_at)}</span>
          </div>
        </div>

        {/* ITENS */}
        <div className="p-3 flex flex-col gap-2">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-lg bg-[#F8F9FB] px-3 py-2.5">
              <div className="flex items-start gap-2">
                <span
                  className={`text-[14px] font-bold ${
                    isReady ? "text-[#244995]" : "text-[#FC811D]"
                  }`}
                >
                  {item.quantity}x
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#19274b]">
                    {item.name}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <UserRound className="w-3.5 h-3.5 text-[#7B8090]" />

                    <p className="text-[13px] text-[#676b7b]">
                      {item.customer_name}
                    </p>
                  </div>

                  {item.observation && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <MessageSquareText className="w-3.5 h-3.5 text-[#8A8F9F] mt-0.5 shrink-0" />

                      <p className="text-[13px] text-[#7B8090]">
                        {item.observation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AÇÃO */}
        {isReady && (
          <div className="px-3 pb-3">
            <button
              type="button"
              className="w-full rounded-lg bg-(--color-primary) hover:bg-[#1d3d7d] text-white text-[13.5px] font-semibold py-2.5 cursor-pointer"
              onClick={() => handleDeliverOrder(order.id)}
            >
              Marcar como entregue
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderTable = (table: TableOrders, showReady: boolean) => {
    const filteredOrders = table.orders.filter(
      (order) =>
        getOrderStatus(order.status) === (showReady ? "pronto" : "preparo"),
    );

    if (filteredOrders.length === 0) {
      return null;
    }

    const expanded = expandedTables[table.table_id] ?? true;

    return (
      <div key={table.table_id} className="bg-white overflow-hidden">
        {/* MESA */}
        <button
          type="button"
          onClick={() => toggleTable(table.table_id)}
          className="w-full px-3 py-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                showReady ? "bg-[#E8EEF9]" : "bg-[#FFF0E1]"
              }`}
            >
              {showReady ? (
                <PackageCheck className="w-[18px] h-[18px] text-[#244995]" />
              ) : (
                <CookingPot className="w-[18px] h-[18px] text-[#FC811D]" />
              )}
            </div>

            <div className="text-left">
              <p className="text-[14px] font-bold text-[#19274b]">
                Mesa {table.table_number}
              </p>

              <p className="text-[11px] text-[#7B8090]">
                {filteredOrders.length}{" "}
                {filteredOrders.length === 1 ? "pedido" : "pedidos"}
              </p>
            </div>
          </div>

          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#7C8292] cursor-pointer" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7C8292] cursor-pointer" />
          )}
        </button>

        {expanded && (
          <div className="px-3 pb-3 flex flex-col gap-2.5">
            {filteredOrders.map((order) => renderOrder(order, showReady))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto flex flex-col px-5 py-10 md:px-10 max-lg:landscape:px-3 gap-8">
      <header className="flex justify-between text-start flex-col gap-6 lg:flex-row lg:gap-0">
        <div className="flex flex-col">
          <h1 className="font-semibold text-[27px] text-[#19274b]">
            Salao do restaurante
          </h1>

          <p className="text-[16px] text-[#19274b]">
            Visualize as mesas, faça reservas e gerencie pedidos!
          </p>
        </div>
      </header>

      <div className="flex flex-col min-[1100px]:flex-row gap-5 items-start">
        <Salao role="garcom" />

        {/* PAINEL DE PEDIDOS */}
        <div className="flex flex-col w-full min-[1100px]:w-[40%] h-full">
          <div className="bg-white border border-[#E4E6EB] rounded-xl overflow-hidden">
            {/* HEADER */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-[19px] text-[#19274b]">
                    Pedidos
                  </h2>

                  <p className="text-[13px] text-[#818598] mt-0.5">
                    Acompanhe os pedidos das mesas
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#EEF0F4]" />

            {/* CONTEÚDO */}
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {loadingOrders ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <LoaderCircle className="w-8 h-8 text-(--color-primary) animate-spin" />
                  <p className="text-[13px] text-[#858A99] mt-3">
                    Carregando pedidos...
                  </p>
                </div>
              ) : tables.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[#F3F5F8] flex items-center justify-center">
                    <ScrollText className="w-6 h-6 text-[#89909F]" />
                  </div>

                  <p className="text-[14px] font-semibold text-[#555B6B] mt-3">
                    Nenhum pedido ativo
                  </p>

                  <p className="text-[13px] text-[#8A8F9F] mt-1 max-w-[250px]">
                    Os pedidos das mesas aparecerão aqui automaticamente.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* PRONTOS */}
                  {readyTables.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#244995]" />

                          <h3 className="text-[12px] font-bold text-[#244995]">
                            PRONTOS
                          </h3>
                        </div>

                        <span className="text-[11px] font-semibold text-[#52688F] bg-[#E8EEF9] px-2.5 py-1 rounded-md">
                          {readyOrders}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {readyTables.map((table) => renderTable(table, true))}
                      </div>
                    </section>
                  )}

                  {/* EM PREPARO */}
                  {preparingTables.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-[#FC811D]">
                            EM PREPARO
                          </h3>
                        </div>

                        <span className="text-[14px] font-semibold text-[#FC811D] bg-[#FFF0E1] px-3 py-1 rounded-md">
                          {preparingOrders}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {preparingTables.map((table) =>
                          renderTable(table, false),
                        )}
                      </div>
                    </section>
                  )}

                  {preparingTables.length === 0 && readyTables.length === 0 && (
                    <div className="py-10 text-center">
                      <p className="text-[12px] text-[#858A99]">
                        Nenhum pedido em preparo ou pronto.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
