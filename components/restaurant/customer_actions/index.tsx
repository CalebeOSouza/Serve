"use client";

import { useState } from "react";
import { ArrowRightLeft, WalletCards, CheckCircle2, X, BadgeCheck } from "lucide-react";

export type CustomerItem = {
  id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Customer = {
  name: string;
  total_consumed: number;
  total_paid: number;
  items: CustomerItem[];
};

export type Account = {
  account_id: number;
  table_id: number;
  table_number: number;
  table_capacity: number;
  table_type: "mesa_quadrada" | "mesa_redonda" | "mesa_retangular" | "mesa_l";
  table_rotation: number;
  people_count: number;
  account_status: "aberta" | "conta_solicitada";
  total_consumed: number;
  total_paid: number;
  opened_at: string;
  customers: Customer[];
};

type ActionType = "transferir" | "parcial" | "pago";

type CustomerActionsProps = {
  customer: Customer;
  account: Account;
  restaurantId: string;
  onRefresh: () => void;
};

export default function CustomerActions({
  customer,
  account,
  restaurantId,
  onRefresh,
}: CustomerActionsProps) {
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [saving, setSaving] = useState(false);

  const [transferItem, setTransferItem] = useState<number | null>(null);
  const [transferTarget, setTransferTarget] = useState("");
  const [partialValue, setPartialValue] = useState("");

  const pending = Math.max(0, customer.total_consumed - customer.total_paid);
  const isFullyPaid = pending <= 0;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function closeActions() {
    setOpen(false);
    setActiveAction(null);
    setTransferItem(null);
    setTransferTarget("");
    setPartialValue("");
  }

  function openAction(action: ActionType) {
    setOpen(true);
    setActiveAction(action);
    setTransferItem(null);
    setTransferTarget("");
    setPartialValue("");
  }

  async function send(body: any) {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/restaurant/${restaurantId}/caixa/accounts`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: account.account_id, ...body }),
        },
      );

      if (!response.ok) throw new Error("Erro ao salvar ação.");

      closeActions();
      onRefresh();
    } catch (error) {
      console.error(error);
      alert("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleTransferItem() {
    if (!transferItem || !transferTarget) return;
    send({
      action: "transferir",
      orderItemId: transferItem,
      fromCustomer: customer.name,
      toCustomer: transferTarget,
    });
  }

  function handlePartialPayment() {
    const value = Number(partialValue.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    send({ action: "pagar", customerName: customer.name, value });
  }

  function handleMarkAsPaid() {
    if (pending <= 0) return;
    send({ action: "pagar", customerName: customer.name, value: pending });
  }

  return (
    <>
      {isFullyPaid ? (
        <div className="mt-3 flex items-center gap-4 rounded-md border border-[#dce4ef] bg-[#f5f8ff] px-3 py-2">
          <BadgeCheck size={18} className="shrink-0 text-[#355fb3]" />
          <div>
            <p className="text-[11px] text-[#123b73]">Situação do cliente</p>
            <p className="text-[14px] font-semibold text-[#355fb3]">
              Pagamento concluído
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-md border border-[#dce4ef] bg-white px-3 py-2">
          <p className="text-[11px] text-[#8294b8]">Pendente deste cliente</p>
          <p className="mt-1 text-[16px] font-semibold text-[#123b73]">
            {formatCurrency(pending)}
          </p>
        </div>
      )}

      {!isFullyPaid && open && (
        <div className="mt-4">
          {!activeAction && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-3 rounded-md border border-[#dce4ef] bg-white px-3 py-3 text-left outline-none hover:border-[#355fb3] hover:bg-[#f5f8ff]"
                onClick={() => openAction("transferir")}
              >
                <ArrowRightLeft size={18} className="shrink-0 text-[#355fb3]" />
                <span>
                  <span className="block text-[13px] font-semibold text-[#123b73]">
                    Transferir itens
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8294b8]">
                    Mover itens para outro cliente
                  </span>
                </span>
              </button>

              <button
                type="button"
                className="flex cursor-pointer items-center gap-3 rounded-md border border-[#dce4ef] bg-white px-3 py-3 text-left outline-none hover:border-[#355fb3] hover:bg-[#f5f8ff]"
                onClick={() => openAction("parcial")}
              >
                <WalletCards size={18} className="shrink-0 text-[#355fb3]" />
                <span>
                  <span className="block text-[13px] font-semibold text-[#123b73]">
                    Pagamento parcial
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8294b8]">
                    Registrar parte do pagamento
                  </span>
                </span>
              </button>

              <button
                type="button"
                className="col-span-2 flex cursor-pointer items-center gap-3 rounded-md border border-[#dce4ef] bg-white px-3 py-3 text-left outline-none hover:border-[#355fb3] hover:bg-[#f5f8ff]"
                onClick={() => openAction("pago")}
              >
                <CheckCircle2 size={18} className="shrink-0 text-[#355fb3]" />
                <span>
                  <span className="block text-[13px] font-semibold text-[#123b73]">
                    Marcar como pago
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#8294b8]">
                    Registrar quitação completa
                  </span>
                </span>
              </button>
            </div>
          )}

          {activeAction === "transferir" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-[#123b73]">
                    Transferir itens
                  </p>
                  <p className="mt-1 text-[12px] text-[#8294b8]">
                    Escolha um item e depois o cliente que irá recebê-lo.
                  </p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-[#8294b8] outline-none hover:text-[#123b73]"
                  onClick={closeActions}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {customer.items.length === 0 ? (
                  <p className="rounded-md bg-white px-3 py-3 text-center text-[12px] text-[#8294b8]">
                    Este cliente não possui itens para transferir.
                  </p>
                ) : (
                  customer.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-left outline-none ${
                        transferItem === item.id
                          ? "border-[#355fb3] bg-[#eef4ff]"
                          : "border-[#dce4ef] bg-white hover:border-[#355fb3]"
                      }`}
                      onClick={() => setTransferItem(item.id)}
                    >
                      <div>
                        <p className="text-[13px] font-semibold text-[#123b73]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#8294b8]">
                          {item.quantity}x
                        </p>
                      </div>
                      <span className="text-[13px] font-medium text-[#123b73]">
                        {formatCurrency(item.total)}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {transferItem !== null && (
                <div className="mt-3">
                  <p className="mb-2 text-[12px] font-medium text-[#123b73]">
                    Transferir para
                  </p>

                  <select
                    value={transferTarget}
                    onChange={(event) => setTransferTarget(event.target.value)}
                    className="h-10 w-full cursor-pointer rounded-md border border-[#dce4ef] bg-white px-3 text-[13px] text-[#123b73] outline-none"
                  >
                    <option value="">Selecione um cliente</option>
                    {account.customers
                      .filter((c) => c.name !== customer.name)
                      .map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    disabled={!transferTarget || saving}
                    className="mt-3 h-10 w-full cursor-pointer rounded-md bg-[#355fb3] text-[13px] font-medium text-white outline-none hover:bg-[#294d96] disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleTransferItem}
                  >
                    Transferir item
                  </button>
                </div>
              )}
            </div>
          )}

          {activeAction === "parcial" && (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[#123b73]">
                    Pagamento parcial
                  </p>
                  <p className="mt-1 text-[12px] text-[#8294b8]">
                    Registre quanto este cliente está pagando agora.
                  </p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-[#8294b8] outline-none hover:text-[#123b73]"
                  onClick={closeActions}
                >
                  <X size={18} />
                </button>
              </div>

              <input
                type="text"
                inputMode="decimal"
                value={partialValue}
                onChange={(event) => setPartialValue(event.target.value)}
                placeholder="Valor pago"
                className="mt-3 h-10 w-full rounded-md border border-[#dce4ef] bg-white px-3 text-[13px] text-[#123b73] outline-none focus:border-[#355fb3]"
              />

              <button
                type="button"
                disabled={!partialValue || saving}
                className="mt-3 h-10 w-full cursor-pointer rounded-md bg-[#355fb3] text-[13px] font-medium text-white outline-none hover:bg-[#294d96] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handlePartialPayment}
              >
                Registrar pagamento
              </button>
            </div>
          )}

          {activeAction === "pago" && (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[#123b73]">
                    Marcar como pago
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#8294b8]">
                    Isso registrará a quitação completa dos{" "}
                    {formatCurrency(pending)} deste cliente.
                  </p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer text-[#8294b8] outline-none hover:text-[#123b73]"
                  onClick={closeActions}
                >
                  <X size={18} />
                </button>
              </div>

              <button
                type="button"
                disabled={saving || pending <= 0}
                className="mt-3 h-10 w-full cursor-pointer rounded-md bg-(--color-primary) text-[13px] font-medium text-white outline-none hover:opacity-95 disabled:opacity-50"
                onClick={handleMarkAsPaid}
              >
                Confirmar pagamento
              </button>
            </div>
          )}
        </div>
      )}

      {!isFullyPaid && (
        <button
          type="button"
          className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-[#355fb3] bg-white text-[13px] font-medium text-[#355fb3] outline-none hover:bg-[#355fb3] hover:text-white"
          onClick={() => {
            if (open) closeActions();
            else {
              setOpen(true);
              setActiveAction(null);
            }
          }}
        >
          Ações
        </button>
      )}
    </>
  );
}