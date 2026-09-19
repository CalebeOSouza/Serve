"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ClipboardList,
  Clock3,
  UserRound,
  ChevronDown,
  FileText,
  Trash2,
} from "lucide-react";

type SystemAccount = "cozinha" | "caixa" | "garçom";

type Log = {
  id: number;
  employee_id: number;
  employee_name: string;
  system_account: SystemAccount;
  action_description: string;
  created_at: string;
};

type RoleFilter = "all" | SystemAccount;
type PeriodFilter = "all" | "today" | "last7" | "last30";

function formatDate(dateValue: string) {
  const date = new Date(dateValue);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(dateValue: string) {
  const date = new Date(dateValue);

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRole(role: SystemAccount) {
  if (role === "garçom") return "Garçom";
  if (role === "cozinha") return "Cozinha";
  return "Caixa";
}

function getPeriodStart(period: PeriodFilter) {
  const now = new Date();

  if (period === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  }

  if (period === "last7") {
    const date = new Date(now);
    date.setDate(date.getDate() - 7);
    return date;
  }

  if (period === "last30") {
    const date = new Date(now);
    date.setDate(date.getDate() - 30);
    return date;
  }

  return null;
}

export default function Logs() {
  const params = useParams();

  const restaurantId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);
  async function loadLogs() {
    if (!restaurantId) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/restaurant/${restaurantId}/logs`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao carregar logs.");
      }

      setLogs(data.logs ?? []);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }
  async function clearLogs() {
    if (!restaurantId || clearingLogs) return;

    try {
      setClearingLogs(true);

      const response = await fetch(`/api/restaurant/${restaurantId}/logs`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao limpar os logs.");
      }

      setLogs([]);
      setConfirmClearLogs(false);
    } catch (error) {
      console.error("Erro ao limpar logs:", error);
    } finally {
      setClearingLogs(false);
    }
  }
  useEffect(() => {
    loadLogs();
  }, [restaurantId]);

  const filteredLogs = useMemo(() => {
    const periodStart = getPeriodStart(period);

    return logs.filter((log) => {
      if (roleFilter !== "all" && log.system_account !== roleFilter) {
        return false;
      }

      if (periodStart) {
        const logDate = new Date(log.created_at);

        if (logDate < periodStart) {
          return false;
        }
      }

      return true;
    });
  }, [logs, roleFilter, period]);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage,
  );
  return (
    <div className="min-h-full w-full px-10 py-8">
      <div className="mx-auto w-full">
        <header className="flex flex-col gap-5 border-b border-[#e5e9f0] pb-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[27px] font-semibold text-[#19274b]">
              Logs do sistema
            </h1>

            <p className="mt-1 text-[16px] text-[#7b8497]">
              Acompanhe as ações realizadas pelos funcionários
            </p>
          </div>

          <div className="flex h-[78px] min-w-[240px] items-center gap-4 rounded-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F6]">
              <ClipboardList className="h-6 w-6 text-[#1b325f]" />
            </div>

            <div>
              <p className="text-[13px] font-medium text-[#7b8497]">
                Registros encontrados
              </p>

              <p className="mt-0.5 text-[22px] font-bold text-[#19274b]">
                {filteredLogs.length}
              </p>
            </div>
          </div>
        </header>

        <section className="my-8">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#536078]">
                Funcionário / setor
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#71809a]" />

                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleFilter);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white pl-10 pr-10 text-sm font-medium text-[#19274b] outline-none transition cursor-pointer"
                >
                  <option value="all">Todos os setores</option>
                  <option value="garçom">Garçom</option>
                  <option value="cozinha">Cozinha</option>
                  <option value="caixa">Caixa</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#536078]">
                Período
              </label>

              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#71809a]" />

                <select
                  value={period}
                  onChange={(e) => {
                    setPeriod(e.target.value as PeriodFilter);
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full appearance-none rounded-lg border border-[#dfe4eb] bg-white pl-10 pr-10 text-sm font-medium text-[#19274b] outline-none transition cursor-pointer"
                >
                  <option value="all">Todos os registros</option>
                  <option value="today">Hoje</option>
                  <option value="last7">Últimos 7 dias</option>
                  <option value="last30">Últimos 30 dias</option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71809a]" />
              </div>
            </div>

            <div className="relative flex items-end">
              <button
                type="button"
                onClick={() => setConfirmClearLogs(!confirmClearLogs)}
                disabled={clearingLogs || logs.length === 0}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#f0caca] bg-[#fff7f7] px-5 text-sm text-[#d64545] hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-50 xl:w-auto cursor-pointer"
              >
                <Trash2 className="h-[17px] w-[17px]" />
                Limpar logs
              </button>

              {confirmClearLogs && (
                <div className="absolute bottom-13 right-0 z-50 w-[280px] overflow-hidden rounded-md bg-red-600 shadow-xl">
                  <div className="p-4 text-white">
                    <p className="text-sm font-semibold">
                      Deseja limpar todos os logs?
                    </p>

                    <p className="mt-1 text-xs opacity-90">
                      Todos os registros deste restaurante serão excluídos.
                    </p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          setConfirmClearLogs(false);
                        }}
                        className="flex-1 cursor-pointer rounded bg-white py-2 text-sm text-red-600 transition hover:bg-gray-100"
                      >
                        Cancelar
                      </button>

                      <button
                        onClick={clearLogs}
                        disabled={clearingLogs}
                        className="flex-1 cursor-pointer rounded bg-red-800 py-2 text-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {clearingLogs ? "Limpando..." : "Limpar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[96px] animate-pulse rounded-lg border border-[#e5e9f0] bg-[#fafbfd]"
                />
              ))}
            </>
          ) : filteredLogs.length > 0 ? (
            paginatedLogs.map((log) => (
              <div
                key={log.id}
                className="grid min-h-[96px] grid-cols-1 gap-5 rounded-lg border border-[#e5e9f0] bg-white px-5 py-4 hover:border-[#d6dfeb] lg:grid-cols-[1.2fr_1fr_1fr_2fr] lg:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F5F5F6]">
                    <UserRound className="h-5 w-5 text-[#536b8e]" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-[#19274b]">
                      {log.employee_name}
                    </p>

                    <p className="mt-0.5 text-[12px] text-[#8a93a5]">
                      {formatRole(log.system_account)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 shrink-0 text-[#536b8e]" />

                  <div>
                    <p className="text-[14px] font-semibold text-[#19274b]">
                      {formatDate(log.created_at)}
                    </p>

                    <p className="mt-0.5 text-[13px] text-[#7b8497]">
                      {formatTime(log.created_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="inline-flex rounded-md bg-[#F5F7FA] px-3 py-1.5 text-[12px] font-semibold text-[#536078]">
                    {formatRole(log.system_account)}
                  </span>
                </div>

               <div className="flex min-w-0 items-center gap-3">
  <FileText className="h-5 w-5 shrink-0 text-[#536b8e]" />

  <div className="min-w-0">
    {log.action_description.startsWith("Criou reserva para a mesa") ? (
      <>
        <p className="text-[14px] font-semibold text-[#19274b]">
          Reserva criada
        </p>

        <p className="mt-1 text-[13px] text-[#7b8497]">
          {log.action_description
            .replace("Criou reserva para a mesa ", "Mesa ")
            .replace(/: /, " · ")
            .replace(/, /g, " · ")
            .replace(
              /(\d{4})-(\d{2})-(\d{2}) às/,
              (_, year, month, day) => `${day}/${month}/${year} às`,
            )}
        </p>
      </>
    ) : (
      <p className="text-[14px] font-medium text-[#19274b]">
        {log.action_description}
      </p>
    )}
  </div>
</div>
              </div>
            ))
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-3 rounded-md border border-gray-200 py-30">
              <div className="flex items-center justify-center rounded-full bg-[#F5F5F6] p-6">
                <ClipboardList className="h-14 w-14 text-[#CCCFD4]" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[20px] font-bold text-gray-800">
                  Nenhum log encontrado
                </p>

                <p className="w-92 text-center text-[15px] text-gray-500">
                  Não existem registros para os filtros selecionados.
                </p>
              </div>
            </div>
          )}
        </section>

        {!loading && filteredLogs.length > 0 && (
          <div className="relative mt-4 flex min-h-9 items-center px-1">
            <p className="text-[13px] text-[#8a93a5]">
              Mostrando{" "}
              <span className="font-semibold text-[#536078]">
                {paginatedLogs.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-[#536078]">
                {filteredLogs.length}
              </span>{" "}
              {filteredLogs.length === 1 ? "registro" : "registros"}
            </p>

            <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer rounded-lg border border-[#dfe4eb] bg-white px-3 py-2 text-sm font-medium text-[#536078] hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 min-w-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition outline-none ${
                      currentPage === page
                        ? "bg-[#1b325f] text-white"
                        : "border border-[#dfe4eb] bg-white text-[#536078] hover:bg-[#f7f9fc]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer rounded-lg border border-[#dfe4eb] bg-white px-3 py-2 text-sm font-medium text-[#536078] hover:bg-[#f7f9fc] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
