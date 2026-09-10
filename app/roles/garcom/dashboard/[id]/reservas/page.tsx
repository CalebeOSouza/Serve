"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  UserRound,
  UsersRound,
  ChevronDown,
  Trash2,
  Calendar,
} from "lucide-react";

type TableType =
  | "mesa_quadrada"
  | "mesa_redonda"
  | "mesa_retangular"
  | "mesa_l";

type Reservation = {
  id: number;
  table_id: number;
  customer_name: string;
  people_count: number;
  reservation_date: string;
  reservation_time: string;
  table_number: number;
  table_type: TableType;
};

type PeriodFilter = "today" | "tomorrow" | "next7" | "all";
type TimeFilter = "all" | "morning" | "afternoon" | "evening";
type OrderFilter = "nearest" | "farthest" | "table";

function TablePreview({
  type,
}: {
  type: TableType;
}) {
  const fill = "#EBF5FF";
  const stroke = "#6388b2";

  return (
    <div className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center">
      {type === "mesa_quadrada" && (
        <svg
          width="58"
          height="58"
          viewBox="0 0 58 58"
          className="drop-shadow-sm"
        >
          <rect
            x="3"
            y="3"
            width="52"
            height="52"
            rx="4"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      )}

      {type === "mesa_redonda" && (
        <svg
          width="58"
          height="58"
          viewBox="0 0 58 58"
          className="drop-shadow-sm"
        >
          <circle
            cx="29"
            cy="29"
            r="26"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      )}

      {type === "mesa_retangular" && (
        <svg
          width="64"
          height="52"
          viewBox="0 0 64 52"
          className="drop-shadow-sm"
        >
          <rect
            x="3"
            y="7"
            width="58"
            height="38"
            rx="4"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      )}

      {type === "mesa_l" && (
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          className="drop-shadow-sm"
        >
          <path
            d="
              M8 3
              H29
              Q36 3 36 10
              V21
              Q36 28 43 28
              H52
              Q57 28 57 33
              V52
              Q57 57 52 57
              H8
              Q3 57 3 52
              V8
              Q3 3 8 3
              Z
            "
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </svg>
      )}
    </div>
  );
}

function parseReservationDateTime(reservation: Reservation) {
  const date = String(reservation.reservation_date).slice(0, 10);
  const time = String(reservation.reservation_time).slice(0, 8);

  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hours || 0,
    minutes || 0,
    seconds || 0,
  );
}

function formatDate(reservation: Reservation) {
  const date = parseReservationDateTime(reservation);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatWeekday(reservation: Reservation) {
  const date = parseReservationDateTime(reservation);

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function formatTime(reservation: Reservation) {
  const date = parseReservationDateTime(reservation);

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeWeekday(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function getTodayStart() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
}

export default function Reservas() {
  const params = useParams(); 

  const restaurantId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [order, setOrder] = useState<OrderFilter>("nearest");

  async function loadReservations() {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/restaurant/${restaurantId}/garcom/reservation`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao carregar reservas.");
      }

      setReservations(data.reservations ?? []);
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
  }, [restaurantId]);

  const futureReservations = useMemo(() => {
    const now = new Date();

    return reservations.filter((reservation) => {
      return parseReservationDateTime(reservation) > now;
    });
  }, [reservations]);

  const filteredReservations = useMemo(() => {
    const today = getTodayStart();

    let result = futureReservations.filter((reservation) => {
      const reservationDate = parseReservationDateTime(reservation);

      if (period === "today") {
        return isSameDay(reservationDate, today);
      }

      if (period === "tomorrow") {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return isSameDay(reservationDate, tomorrow);
      }

      if (period === "next7") {
        const lastDay = new Date(today);
        lastDay.setDate(lastDay.getDate() + 7);

        return reservationDate >= today && reservationDate < lastDay;
      }

      return true;
    });

    result = result.filter((reservation) => {
      const hour = parseReservationDateTime(reservation).getHours();

      if (timeFilter === "morning") {
        return hour >= 6 && hour < 12;
      }

      if (timeFilter === "afternoon") {
        return hour >= 12 && hour < 18;
      }

      if (timeFilter === "evening") {
        return hour >= 18 && hour <= 23;
      }

      return true;
    });

    result.sort((a, b) => {
      const dateA = parseReservationDateTime(a).getTime();
      const dateB = parseReservationDateTime(b).getTime();

      if (order === "nearest") {
        return dateA - dateB;
      }

      if (order === "farthest") {
        return dateB - dateA;
      }

      return Number(a.table_number) - Number(b.table_number);
    });

    return result;
  }, [futureReservations, period, timeFilter, order]);

async function deleteReservation(reservationId: number) {
  const confirmed = window.confirm(
    "Tem certeza que deseja excluir esta reserva?",
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `/api/restaurant/${restaurantId}/garcom/reservation`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservationId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error || "Erro ao excluir reserva.",
      );
    }

    setReservations((current) =>
      current.filter(
        (reservation) => reservation.id !== reservationId,
      ),
    );
  } catch (error) {
    console.error("Erro ao excluir reserva:", error);
  }
}

  return (
    <div className="w-full min-h-full px-10 py-8">
      <div className="mx-auto w-full">

        <header className="flex flex-col gap-5 border-b border-[#e5e9f0] pb-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[27px] font-semibold text-[#19274b]">
              Minhas Reservas
            </h1>

            <p className="mt-1 text-[16px] text-[#7b8497]">
              Acompanhe todas as reservas futuras do restaurante
            </p>
          </div>

          <div className="flex h-[78px] min-w-[240px] items-center gap-4 rounded-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F6]">
              <CalendarDays className="h-6 w-6 text-[#1b325f]" />
            </div>

            <div>
              <p className="text-[13px] font-medium text-[#7b8497]">
                Reservas futuras
              </p>

              <p className="mt-0.5 text-[22px] font-bold text-[#19274b]">
                {futureReservations.length}
              </p>
            </div>
          </div>
        </header>

        {/* FILTROS */}
        <section className="my-8">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr_auto]">

            {/* PERÍODO */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#536078]">
                Período
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#71809a]" />

                <select
  value={period}
  onChange={(e) =>
    setPeriod(e.target.value as PeriodFilter)
  }
  className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white pl-10 pr-10 text-sm font-medium text-[#19274b] outline-none transition focus:border-[#6388b2]"
>
  <option value="all">Todas as reservas</option>
  <option value="today">Hoje</option>
  <option value="tomorrow">Amanhã</option>
  <option value="next7">Próximos 7 dias</option>
</select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
              </div>
            </div>

            {/* HORÁRIO */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#536078]">
                Horário
              </label>

              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#71809a]" />

                <select
                  value={timeFilter}
                  onChange={(e) =>
                    setTimeFilter(e.target.value as TimeFilter)
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white pl-10 pr-10 text-sm font-medium text-[#19274b] outline-none transition focus:border-[#6388b2]"
                >
                  <option value="all">Todos os horários</option>
                  <option value="morning">Manhã - 06:00 às 12:00</option>
                  <option value="afternoon">Tarde - 12:00 às 18:00</option>
                  <option value="evening">Noite - 18:00 às 00:00</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
              </div>
            </div>

            {/* ORDENAR */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#536078]">
                Ordenar por
              </label>

              <div className="relative">
                <select
                  value={order}
                  onChange={(e) =>
                    setOrder(e.target.value as OrderFilter)
                  }
                  className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white px-4 pr-10 text-sm font-medium text-[#19274b] outline-none transition focus:border-[#6388b2]"
                >
                  <option value="nearest">Mais próximas</option>
                  <option value="farthest">Mais distantes</option>
                  <option value="table">Número da mesa</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
              </div>
            </div>

         
          </div>
        </section>

        <section className="mt-4 space-y-3">

          {loading ? (
            <>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[104px] animate-pulse rounded-lg border border-[#e5e9f0] bg-[#fafbfd]"
                />
              ))}
            </>
          ) : filteredReservations.length > 0 ? (
            filteredReservations.map((reservation) => (
              <div
  key={reservation.id}
  className="grid min-h-[104px] grid-cols-1 gap-5 rounded-lg border border-[#e5e9f0] bg-white px-5 py-4 hover:border-[#d6dfeb] lg:grid-cols-[repeat(5,minmax(0,1fr))_auto] lg:items-center"
>
                {/* MESA */}
                <div className="flex items-center gap-4">
                  <div className="flex h-[72px] w-[84px] items-center justify-center">
                    <TablePreview type={reservation.table_type} />
                  </div>

                  <div>
                    <h2 className="mt-0.5 text-[17px] font-bold text-[#19274b]">
                      Mesa {reservation.table_number}
                    </h2>
                  </div>
                </div>

                {/* DATA */}
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-[#536b8e]" />

                  <div>
                    <p className="text-[14px] font-semibold text-[#19274b]">
                      {formatDate(reservation)}
                    </p>

                    <p className="mt-0.5 text-[13px] capitalize text-[#7b8497]">
                      {formatWeekday(reservation)}
                    </p>
                  </div>
                </div>

                {/* HORÁRIO */}
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 shrink-0 text-[#536b8e]" />

                  <p className="text-[15px] font-semibold text-[#19274b]">
                    {formatTime(reservation)}
                  </p>
                </div>

                {/* RESERVANTE */}
                <div className="flex flex-1 items-center gap-3">
                  <UserRound className="h-5 w-5 shrink-0 text-[#536b8e]" />

                  <div className="">
                    
                    <p className="truncate text-[15px] font-semibold text-[#19274b]">
                      {reservation.customer_name}
                    </p>
<p className="mt-0.5 text-[12px] text-[#8a93a5]">
                      Reservante
                    </p>
                    
                  </div>
                </div>

                {/* PESSOAS */}
                <div className="flex items-center gap-3">
                  <UsersRound className="h-5 w-5 shrink-0 text-[#536b8e]" />

                  <p className="text-[14px] font-medium text-[#19274b]">
                    {reservation.people_count}{" "}
                    {reservation.people_count === 1
                      ? "pessoa"
                      : "pessoas"}
                  </p>
                </div>

{/* EXCLUIR */}
<div className="flex items-center justify-start lg:justify-end">
  <button
    type="button"
    onClick={() => deleteReservation(reservation.id)}
    aria-label="Excluir reserva"
    title="Excluir reserva"
    className="flex px-2.5 py-2 items-center justify-center rounded-lg text-[#7b8497] hover:bg-[#fff1f1] hover:bg-gray-100 border border-gray-200 cursor-pointer"
  >
    Cancelar
  </button>
</div>

              </div>
            ))
          ) : (
            

<div className="flex flex-col items-center justify-center gap-3 py-30 w-full border border-gray-200 rounded-md col-span-full">
              <div className="bg-[#F5F5F6] p-6 rounded-full flex items-center justify-center">
                <Calendar className="w-14 h-14 text-[#CCCFD4]" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-gray-800 font-bold text-[20px]">
                   Nenhuma reserva encontrada
                </p>
                <p className="text-gray-500 text-[15px] w-92 text-center">
                   Não existem reservas futuras para os filtros selecionados.
                </p>
              </div>
</div>

          )}
        </section>

        {!loading && filteredReservations.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-1">
            <p className="text-[13px] text-[#8a93a5]">
              Mostrando{" "}
              <span className="font-semibold text-[#536078]">
                {filteredReservations.length}
              </span>{" "}
              {filteredReservations.length === 1
                ? "reserva"
                : "reservas"}
            </p>

            <p className="text-[13px] text-[#8a93a5]">
              {period === "today"
                ? "Reservas de hoje"
                : period === "tomorrow"
                  ? "Reservas de amanhã"
                  : period === "next7"
                    ? "Próximos 7 dias"
                    : "Todas as reservas futuras"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}