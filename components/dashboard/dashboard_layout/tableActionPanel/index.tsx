"use client";

import {
  X,
  AlertCircle,
  CalendarDays,
  Clock3,
  UserRound,
  UsersRound,
} from "lucide-react";

import type { RestaurantTable } from "@/app/admin/dashboard/[id]/layout/types";

type Reservation = {
  id: number;
  table_id: string;
  customer_name: string;
  reservation_date: string;
  reservation_time: string;
  people_count: number;
  dateTime: Date;
};
export function TableActionPanel({
  role,
  table,
  nextReservation,
  onClose,
  onReserve,
  onOccupy,
  onOrders,
}: {
  role: "gerente" | "garcom";
  table: RestaurantTable;
  nextReservation: Reservation | null;
  onClose: () => void;
  onReserve: () => void;
  onOccupy: () => void;
  onOrders: () => void;
}) {
  function formatReservationDate(date: Date) {
    const datePart = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    const weekdayPart = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
    }).format(date);

    const formattedWeekday =
      weekdayPart.charAt(0).toUpperCase() + weekdayPart.slice(1);

    return `${datePart} (${formattedWeekday})`;
  }

  function formatReservationTime(date: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  }

  function getCountdown(date: Date) {
  const now = new Date();

  const diff = date.getTime() - now.getTime();

  if (diff <= 0) {
    return "A reserva é agora.";
  }

  const totalMinutes = Math.floor(diff / (1000 * 60));

  const minutesInDay = 24 * 60;

  if (totalMinutes >= minutesInDay) {
    const days = Math.floor(totalMinutes / minutesInDay);

    if (days === 1) {
      return "Falta 1 dia para esta reserva.";
    }

    return `Faltam ${days} dias para esta reserva.`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `Faltam ${hours}h e ${minutes} min para esta reserva.`;
  }

  if (hours > 0) {
    return `Faltam ${hours}h para esta reserva.`;
  }

  return `Faltam ${minutes} min para esta reserva.`;
}

  return (
    <div className="w-80 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-[#19274b]">
            Mesa {table.tableNumber}
          </span>

          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {role === "garcom" && (
        <>
          <div className="px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              {table.status === "ocupada" && (
                <div className="flex gap-2">
                  <button
                    className="w-full rounded-sm bg-(--color-primary) px-2 py-1.5 text-sm font-medium text-white hover:opacity-90 cursor-pointer"
                    onClick={onOrders}
                  >
                    Pedidos
                  </button>
                  <button
                    className="w-full rounded-sm border border-(--color-primary) px-2 py-1.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/5 cursor-pointer"
                    onClick={() => {}}
                  >
                    Fechar conta
                  </button>
                </div>
              )}

              <div className="flex gap-1.5">
                <button
                  className="w-full rounded-sm border border-(--color-primary) px-2 py-1.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/5 cursor-pointer"
                  onClick={onReserve}
                >
                  Reservar
                </button>

                {table.status === "livre" && (
                  <button
                    className="w-full rounded-sm border border-(--color-primary) px-2 py-1.5 text-sm font-medium text-(--color-primary) hover:bg-(--color-primary)/5 cursor-pointer"
                    onClick={onOccupy}
                  >
                    Ocupar mesa
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200" />
        </>
      )}

      <div className="p-4">
        <div className="flex flex-col gap-4">
          <h5 className="text-[#1b325f] font-semibold text-base">
            Próxima reserva
          </h5>

          {nextReservation ? (
            <>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="w-5 h-5 text-[#1b325f] shrink-0" />

                  <span
                    className="text-sm text-(--color-primary) whitespace-nowrap"
                    title={formatReservationDate(nextReservation.dateTime)}
                  >
                    {formatReservationDate(nextReservation.dateTime)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Clock3 className="w-5 h-5 text-[#1b325f] shrink-0" />

                  <span className="text-sm text-(--color-primary) whitespace-nowrap">
                    {formatReservationTime(nextReservation.dateTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-2">
                  <UsersRound className="w-5 h-5 text-[#1b325f] shrink-0" />

                  <span className="text-sm text-(--color-primary)">
                    {nextReservation.people_count}{" "}
                    {nextReservation.people_count === 1 ? "pessoa" : "pessoas"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <UserRound className="w-5 h-5 text-[#1b325f] shrink-0" />

                  <span
                    className="text-sm text-(--color-primary) truncate"
                    title={nextReservation.customer_name}
                  >
                    {nextReservation.customer_name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="bg-[#F2F6FE] text-[#214B9D] flex items-center gap-2 p-3 rounded-lg w-full">
                  <AlertCircle className="w-5 h-5 shrink-0" />

                  <p className="text-sm">
                    {getCountdown(nextReservation.dateTime)}
                  </p>
                </div>
 
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">
              Nenhuma reserva futura para esta mesa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
