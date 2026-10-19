"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import CustomerActions, {
  Account,
} from "../../../../../../components/restaurant/customer_actions";

import {
  CreditCard,
  Coins,
  UsersRound,
  Clock3,
  CheckCircle2,
  LoaderCircle,
  ScrollText,
  CircleDashed,
} from "lucide-react";

export default function Painel_Caixa() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [alert, setAlert] = useState<{
    message: string | null;
    type: "success" | "error";
  }>({
    message: null,
    type: "success",
  });

  const loadAccounts = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/caixa/accounts`,
        { cache: "no-store" },
      );

      if (!response.ok) throw new Error("Erro ao carregar contas.");

      const data = await response.json();
      const newAccounts = data.accounts || [];

      setAccounts(newAccounts);

      setSelectedAccount((current) =>
        current
          ? newAccounts.find(
              (a: Account) => a.account_id === current.account_id,
            ) || null
          : null,
      );
    } catch (error) {
      console.error("Erro ao carregar contas das mesas:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  async function freeTable(account: Account) {
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/caixa/accounts`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "liberar",
            accountId: account.account_id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao liberar mesa.");
      }

      if (selectedAccount?.account_id === account.account_id) {
        setSelectedAccount(null);
      }

      await loadAccounts();

      setAlert({
        message:
          data.message || `Mesa ${account.table_number} liberada com sucesso.`,
        type: "success",
      });
    } catch (error) {
      console.error("Erro ao liberar mesa:", error);

      setAlert({
        message:
          error instanceof Error ? error.message : "Erro ao liberar mesa.",
        type: "error",
      });
    }
  }

  async function manageAccount(account: Account) {
    setLoadingAccount(true);
    setSelectedAccount(null);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSelectedAccount(account);
    setLoadingAccount(false);
  }

  useEffect(() => {
    if (!restaurantId) return;
    loadAccounts();
    const interval = setInterval(loadAccounts, 5000);
    return () => clearInterval(interval);
  }, [restaurantId, loadAccounts]);

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div className="w-full px-10 py-8 max-[1024px]:px-4">
      <header className="flex flex-col border-b border-[#e5e9f0] pb-7">
        <h1 className="text-[27px] font-semibold text-[#19274b]">Caixa</h1>

        <p className="mt-1 text-[15px] text-gray-700">
          Gerencie contas e pagamentos das mesas.
        </p>
      </header>

      <main className="mt-8 grid w-full grid-cols-[410px_minmax(0,1fr)] gap-4 max-[1669px]:grid-cols-1">
        
<div className={`rounded-lg border border-[#e3e6ed] bg-white p-4 ${
  !loading && accounts.length === 0
    ? "h-auto min-h-0 overflow-hidden"
    : "h-[calc(100vh-257px)] min-h-[500px] overflow-y-auto max-[1669px]:h-auto max-[1669px]:min-h-[300px]"
}`}>

          <AnimatedAlert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert((prev) => ({ ...prev, message: null }))}
          />

          <div className="flex h-full flex-col gap-3 mt-3">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-700">
                Carregando contas...
              </div>
            ) : accounts.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center rounded-full bg-[#F5F5F6] p-4">
                    <ScrollText className="h-8 w-8 text-[#a9b2c6]" />
                  </div>

                  <h2 className="mt-4 text-[17px] font-semibold text-[#123b73]">
                    Nenhuma mesa com conta aberta
                  </h2>

                  <p className="mt-1 max-w-[280px] text-[13px] leading-5 text-[#8294b8]">
                    Quando uma mesa possuir uma conta aberta, ela aparecerá
                    aqui.
                  </p>
                </div>
              </div>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.account_id}
                  className="flex items-center justify-between rounded-lg border border-[#e3e6ed] bg-white px-3 py-3 max-[500px]:flex-col max-[500px]:items-start max-[500px]:gap-3"
                >
                  <div className="flex min-w-0 items-center gap-3 max-[500px]:w-full">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1b325f] text-[14.5px] font-semibold text-white">
                      {account.table_number}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#19274b]">
                        Mesa {account.table_number}
                      </p>

                      <div className="mt-1 flex items-center gap-2 text-[13px] text-[#19274b]">
                        <UsersRound size={15} />
                        <span>
                          {account.people_count}{" "}
                          {account.people_count === 1 ? "pessoa" : "pessoas"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 max-[500px]:w-full max-[500px]:flex-col">
                    {account.account_status === "aberta" && (
                      <button
                        className="cursor-pointer rounded-md border border-[#dce4ef] bg-white px-3 py-1.75 text-[13.25px] text-[#123b73] outline-none hover:border-[#355fb3] hover:bg-[#f5f8ff] max-[500px]:w-full"
                        onClick={() => manageAccount(account)}
                        disabled={loadingAccount}
                      >
                        Gerenciar
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        Math.max(
                          0,
                          account.total_consumed - account.total_paid,
                        ) > 0
                      }
                      onClick={() => freeTable(account)}
                      className="flex items-center gap-1.5 rounded-md border border-[#dce4ef] bg-white px-3 py-1.75 text-[13.25px] text-[#123b73] outline-none hover:border-[#355fb3] hover:bg-[#f5f8ff] disabled:cursor-not-allowed disabled:border-[#e3e6ed] disabled:bg-[#f4f6f9] disabled:text-[#a1a9b8] cursor-pointer max-[500px]:w-full"
                    >
                      <CheckCircle2 size={15} />
                      Liberar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="h-[calc(100vh-257px)] min-h-[500px] overflow-y-auto rounded-lg border border-[#e3e6ed] bg-white">
          {loadingAccount ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <LoaderCircle className="w-9 h-9 text-(--color-primary) animate-spin" />
                <p className="mt-4 text-[15px] font-medium text-[#123b73]">
                  Carregando informações da mesa...
                </p>
              </div>
            </div>
          ) : !selectedAccount ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center rounded-full bg-[#F5F5F6] p-4">
                  <CircleDashed className="h-8 w-8 text-[#a9b2c6]" />{" "}
                  {/* #CCCFD4 */}
                </div>

                <h2 className="mt-4 text-[17px] font-semibold text-[#123b73]">
                  Nenhuma mesa selecionada
                </h2>

                <p className="mt-1 max-w-[320px] text-[13px] leading-5 text-[#8294b8]">
                  Selecione uma mesa e clique em "Gerenciar" para visualizar a
                  conta, organizar os pedidos e registrar os pagamentos.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full bg-white">
             <div className="flex min-h-[108px] items-center px-4 max-[1250px]:flex-col max-[1250px]:items-start max-[1250px]:gap-4 max-[1250px]:py-4">
                <div className="flex w-[300px] shrink-0 items-center gap-4 max-[1250px]:w-full">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center">
                    {(() => {
                      const size =
                        selectedAccount.table_type === "mesa_quadrada"
                          ? { w: 60, h: 60 }
                          : selectedAccount.table_type === "mesa_redonda"
                            ? { w: 60, h: 60 }
                            : selectedAccount.table_type === "mesa_retangular"
                              ? { w: 80, h: 48 }
                              : { w: 65, h: 65 };

                      const rotation = selectedAccount.table_rotation ?? 0;

                      const base = "border border-[#6388b2] bg-[#EBF5FF]";

                      switch (selectedAccount.table_type) {
                        case "mesa_quadrada":
                          return (
                            <div
                              style={{
                                width: size.w,
                                height: size.h,
                                transform: `rotate(${rotation}deg)`,
                              }}
                              className={`${base} rounded-md`}
                            />
                          );

                        case "mesa_redonda":
                          return (
                            <div
                              style={{
                                width: size.w,
                                height: size.h,
                                transform: `rotate(${rotation}deg)`,
                              }}
                              className={`${base} rounded-full`}
                            />
                          );

                        case "mesa_retangular":
                          return (
                            <div
                              style={{
                                width: size.w,
                                height: size.h,
                                transform: `rotate(${rotation}deg)`,
                              }}
                              className={`${base} rounded-md`}
                            />
                          );

                        case "mesa_l":
                          return (
                            <div
                              style={{
                                width: size.w,
                                height: size.h,
                              }}
                              className="relative"
                            >
                              <svg width="60" height="60" viewBox="0 0 60 60">
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
                                  fill="#EBF5FF"
                                  stroke="#6388b2"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })()}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-[20px] font-semibold text-[#123b73]">
                      Mesa {selectedAccount.table_number}
                    </h2>

                    <div className="mt-1 flex items-center gap-2 text-[15px] text-[#19274b]">
                      <UsersRound size={15} />

                      <span>
                        {selectedAccount.people_count}{" "}
                        {selectedAccount.people_count === 1
                          ? "pessoa"
                          : "pessoas"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 gap-4 max-[1250px]:w-full max-[1250px]:flex-col">
                  <div className="flex flex-1 items-center gap-5 rounded-lg px-5 py-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF5FF]">
                      <Coins
                        size={24}
                        strokeWidth={2}
                        className="text-[#1b4f91]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#8294b8]">
                        Total consumido
                      </p>

                      <p className="mt-1 text-[18px] font-semibold text-[#123b73]">
                        {formatCurrency(selectedAccount.total_consumed)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-5 rounded-lg px-5 py-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF5FF]">
                      <CreditCard
                        size={24}
                        strokeWidth={2}
                        className="text-[#1b4f91]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#8294b8]">
                        Total pago
                      </p>

                      <p className="mt-1 text-[18px] font-semibold text-[#123b73]">
                        {formatCurrency(selectedAccount.total_paid)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-5 rounded-lg px-5 py-4">
                    <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#EBF5FF]">
                      <Clock3
                        size={24}
                        strokeWidth={2}
                        className="text-[#1b4f91]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[#8294b8]">
                        Pendente
                      </p>

                      <p className="mt-1 text-[18px] font-semibold text-[#123b73]">
                        {formatCurrency(
                          Math.max(
                            0,
                            selectedAccount.total_consumed -
                              selectedAccount.total_paid,
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

             

{selectedAccount.total_consumed === 0 ? (
  <div className="flex min-h-[400px] items-center justify-center p-4 mt-15">
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center rounded-full bg-[#F5F5F6] p-4">
        <ScrollText className="h-8 w-8 text-[#a9b2c6]" />
      </div>

      <h2 className="mt-4 text-[17px] font-semibold text-[#123b73]">
        Nenhum pedido realizado
      </h2>

      <p className="mt-1 max-w-[320px] text-[13px] leading-5 text-[#8294b8]">
        Esta mesa ainda não realizou nenhum pedido.
      </p>
    </div>
  </div>
) : (
  <div className="grid grid-cols-2 gap-4 p-4 max-[1250px]:grid-cols-1">
    {selectedAccount.customers.map((customer) => (
      <div
        key={customer.name}
        className="flex min-h-[400px] flex-col rounded-lg border border-[#e3e6ed] bg-white px-4 py-4"
      >
        <div>
          <h3 className="text-[18px] font-semibold text-[#123b73]">
            {customer.name}
          </h3>

          <p className="mt-1 text-[14px] text-[#1b3d70]">
            Total consumido
          </p>

          <p className="mt-1 text-[18px] font-semibold text-[#123b73]">
            {formatCurrency(customer.total_consumed)}
          </p>
        </div>

        <div className="my-3 border-t border-[#e5e9f0]" />

        <div className="flex flex-1 flex-col gap-3">
          {customer.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="h-[70px] w-[70px] shrink-0 overflow-hidden rounded-lg border border-[#e3e6ed] bg-[#f7f9fc]">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-[#8a94a8]">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold text-[#123b73]">
                  {item.name}
                </p>

                <p className="mt-1 text-[15px] text-[#1b3d70]">
                  {formatCurrency(item.total)}
                </p>
              </div>

              <span className="shrink-0 text-[14px] font-medium text-[#123b73]">
                {item.quantity}x
              </span>
            </div>
          ))}
        </div>

        <CustomerActions
          customer={customer}
          account={selectedAccount}
          restaurantId={restaurantId}
          onRefresh={loadAccounts}
        />
      </div>
    ))}
  </div>
)}
             
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
