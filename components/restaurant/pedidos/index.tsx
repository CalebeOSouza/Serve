"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Utensils,
  ChevronRight,
  ArrowLeft,
  UsersRound,
  Plus,
  Trash2,
  PackageOpen,
  Inbox,
  X,
  Send,
  Minus,
} from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type TableType =
  | "mesa_quadrada"
  | "mesa_redonda"
  | "mesa_retangular"
  | "mesa_l";

type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  category_id: number;
};

type MenuSubcategory = {
  id: number;
  name: string;
  items: MenuItem[];
};

type MenuCategory = {
  id: number;
  name: string;
  subcategories: MenuSubcategory[];
};

type OrderItem = {
  id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  observation: string | null;
  name: string;
};

type Order = {
  id: number;
  customer_name: string;
  status: "recebido" | "em_preparo" | "pronto" | "cancelado";
  created_at: string;
  items: OrderItem[];
};

type PendingOrderItem = {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  observation: string;
  customerName: string;
};

type Props = {
  restaurantId: string;
  tableId: string;
  tableNumber: number;
  tableType: TableType;
  tableCapacity?: number;
  onClose: () => void;
};




function TablePreview({
  type,
  tableNumber,
}: {
  type: TableType;
  tableNumber: number;
}) {


  const fill = "#EBF5FF";
  const stroke = "#6388b2";



  return (
    <div className="flex items-center gap-4">
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
              rx="8"
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

      <div className="min-w-0">
        <p className="text-[13px] font-medium text-[#7b8497]">
          Mesa selecionada
        </p>

        <h2 className="mt-0.5 text-[20px] font-bold text-[#19274b]">
          Mesa {tableNumber}
        </h2>
      </div>
    </div>
  );
}

export function Pedidos({
  restaurantId,
  tableId,
  tableNumber,
  tableType,
  tableCapacity,
  onClose,
}: Props) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingOrderItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [observation, setObservation] = useState("");
  const [quantity, setQuantity] = useState(1);
const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/restaurant/${restaurantId}/garcom/orders?tableId=${tableId}`,
          {
            cache: "no-store",
          },
        );

        const data = await res.json();

        console.log("STATUS DA API:", res.status);
        console.log("RESPOSTA DA API:", data);

        if (!res.ok) {
          throw new Error(
            data?.error ||
              `Erro HTTP ${res.status} ao carregar dados dos pedidos.`,
          );
        }

        const loadedCategories = data.categories ?? [];

        setCategories(loadedCategories);
        setOrders(data.orders ?? []);

        const firstCategoryWithSubcategory = loadedCategories.find(
          (category: MenuCategory) => category.subcategories?.length > 0,
        );

        if (firstCategoryWithSubcategory) {
          setSelectedCategoryId(firstCategoryWithSubcategory.id);

          setSelectedSubcategoryId(
            firstCategoryWithSubcategory.subcategories[0].id,
          );
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [restaurantId, tableId]);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  const selectedSubcategory =
    selectedCategory?.subcategories.find(
      (subcategory) => subcategory.id === selectedSubcategoryId,
    ) ?? null;

  const filteredItems =
    selectedSubcategory?.items.filter((item) => {
      if (!item.available) return false;

      if (!search.trim()) return true;

      return item.name.toLowerCase().includes(search.toLowerCase());
    }) ?? [];

  function handleCategoryChange(category: MenuCategory) {
    setSelectedCategoryId(category.id);

    const firstSubcategory = category.subcategories?.[0];

    setSelectedSubcategoryId(firstSubcategory?.id ?? null);

    setSearch("");
  }

  function formatPrice(value: number) {
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleAddPendingItem() {
  if (!selectedItem) return;

  if (!customerName.trim()) {
    setAlert({
      type: "error",
      message: "Informe o nome do cliente.",
    });
    return;
  }

  const newItem: PendingOrderItem = {
    id: `${selectedItem.id}-${Date.now()}`,
    menuItem: selectedItem,
    quantity: quantity,
    observation,
    customerName: customerName.trim(),
  };

  setPendingItems((current) => [...current, newItem]);

  setSelectedItem(null);
  setCustomerName("");
  setObservation("");
  setQuantity(1);
}

  function handleRemovePendingItem(id: string) {
    setPendingItems((current) => current.filter((item) => item.id !== id));
  }
//observação no waiter id
async function handleSubmitOrder() {
  if (pendingItems.length === 0) {
    return;
  }

  try {
    setSendingOrder(true);

    const response = await fetch(
      `/api/restaurant/${restaurantId}/garcom/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,

          items: pendingItems.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            observation: item.observation,
            customerName: item.customerName,
          })),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Não foi possível realizar o pedido.",
      );
    }

    setPendingItems([]);

    const ordersResponse = await fetch(
      `/api/restaurant/${restaurantId}/garcom/orders?tableId=${tableId}`,
      {
        cache: "no-store",
      },
    );

    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();

      setOrders(ordersData.orders ?? []);
    }

    setAlert({
      type: "success",
      message: "Pedido realizado com sucesso!",
    });
  } catch (error) {
    console.error(
      "Erro ao fazer pedido:",
      error,
    );

    setAlert({
      type: "error",
      message:
        error instanceof Error
          ? error.message
          : "Erro ao realizar pedido.",
    });
  } finally {
    setSendingOrder(false);
  }
}

  const pendingTotal = pendingItems.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 z-10000 bg-[#f8fafc] flex flex-col">
     
      <header className="h-[72px] shrink-0 border-b border-[#e5e9f0] bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="
              flex items-center gap-2
              text-sm font-medium
              text-[#536078]
              hover:text-[#1b325f]
              transition
              cursor-pointer
            "
          >
            <ArrowLeft className="h-[18px] w-[18px]" />

            <span>Voltar ao salão</span>
          </button>

          <div className="h-5 w-px bg-[#e5e9f0]" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-[#8a93a5]">Pedidos</span>

            <ChevronRight className="h-4 w-4 text-[#b5bcc9]" />

            <span className="text-sm font-semibold text-[#19274b]">
              Mesa {tableNumber}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className="
            w-[350px]
            shrink-0
            border-r border-[#e5e9f0]
            bg-white
            flex
            flex-col
          "
        >
          <div className="px-5 pt-5 pb-5 border-b border-[#e5e9f0]">
            <TablePreview type={tableType} tableNumber={tableNumber} />

            {/* <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md bg-[#eaf2fc] px-2.5 py-1 text-xs font-medium text-[#1b325f]">
                <UsersRound className="h-3.5 w-3.5" />

                <span>
                  {tableCapacity ?? "-"} lugares
                </span>
              </div>

              <div className="rounded-md bg-[#f3f5f8] px-2.5 py-1 text-xs font-medium text-[#667085]">
                Pedidos
              </div>
            </div> */}
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#19274b]">
                Itens do pedido
              </h2>

              <span className="rounded-sm bg-[#edf3fb] px-2.5 py-1 text-[11px] font-semibold text-[#1b325f]">
                {pendingItems.reduce((total, item) => total + item.quantity, 0)}{" "}
                {pendingItems.reduce(
                  (total, item) => total + item.quantity,
                  0,
                ) === 1
                  ? "item"
                  : "itens"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {pendingItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f6f9]">
                  <PackageOpen className="h-6 w-6 text-[#aab2c0]" />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#667085]">
                  Nenhum item
                </p>

                <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#9aa2b1]">
                  Adicione itens do cardápio para montar o pedido.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((pendingItem) => {
                  const category = categories.find(
                    (category) =>
                      category.id === pendingItem.menuItem.category_id,
                  );

                  return (
                    <div
                      key={pendingItem.id}
                      className="overflow-hidden rounded-lg border border-[#e1e5eb] bg-white"
                    >

                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Quantidade */}
                          <div className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-md bg-[#edf3fb] px-1.5 text-[12px] font-bold text-[#1b325f]">
                            {pendingItem.quantity}x
                          </div>

                          {/* Imagem */}
                          {pendingItem.menuItem.image_url ? (
                            <img
                              src={pendingItem.menuItem.image_url}
                              alt={pendingItem.menuItem.name}
                              className="h-16 w-16 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[#f3f4f6]">
                              <Utensils className="h-6 w-6 text-[#b8bec8]" />
                            </div>
                          )}

                          {/* Informações */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-bold text-[#19274b]">
                                  {pendingItem.menuItem.name}
                                </p>

                                <p className="mt-0.5 text-[12px] font-medium text-[#7b8497]">
                                  {pendingItem.customerName.trim().split(/\s+/)[0] || "Sem nome"}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemovePendingItem(pendingItem.id)
                                }
                                className="shrink-0 text-[#536078] hover:text-[#19274b] cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <p className="mt-1.5 text-[15px] font-bold text-[#19274b]">
                              {formatPrice(
                                pendingItem.menuItem.price *
                                  pendingItem.quantity,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      {pendingItem.observation && (
                        <div className="mt-3 bg-[#f8f9fb] px-4 py-2">
                          <p className="text-[13px] font-medium text-[#7b8497]">
                            Observação do cliente
                          </p>

                          <div className="mt-1 w-full">
  <p className="whitespace-pre-wrap break-words text-[12px] font-semibold leading-5 text-[#1b325f]">
    {pendingItem.observation}
  </p>
</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="shrink-0 bg-white px-4 pb-4 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#536078]">Total</span>

              <span className="text-lg font-bold text-[#19274b]">
                {formatPrice(pendingTotal)}
              </span>
            </div>

           
<button
  type="button"
  onClick={handleSubmitOrder}
  disabled={
    pendingItems.length === 0 ||
    sendingOrder
  }
  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#1b325f] text-sm font-medium text-white hover:bg-[#16294d] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
>
  <Send className="h-4 w-4" />

    Fazer pedido
</button>


          </div>
        </aside>

        <main className="flex-1 min-w-0 bg-white flex flex-col">
          <div className="px-7 pt-5">
            <div className="flex justify-between items-center gap-5">
              <div>
                <h2 className="text-xl font-semibold text-[#19274b]">
                  Cardápio
                </h2>

                <p className="text-sm text-gray-500">
                  Selecione os itens desejados para adicionar ao pedido.
                </p>
              </div>

              <div className="relative w-[280px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar item..."
                  className="w-full h-11 rounded-lg border border-gray-200 px-4 pr-10 text-sm text-[#19274b] outline-none focus:border-[#1b325f]"
                />

                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="px-7 pt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8a93a5]">
              Categoria
            </p>

            <div className="flex flex-wrap gap-3">
              {categories.length > 0 ? (
                categories.map((category) => {
                  const isSelected = selectedCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category)}
                      className={`
            min-w-[120px]
            h-9
            rounded-sm
            border
            px-4
            text-sm
            font-semibold
            cursor-pointer
            ${
              isSelected
                ? "border-[#6388b2] bg-[#EBF5FF] text-[#1b325f]"
                : "border-[#e1e6ed] bg-white text-[#667085] hover:border-[#cbd5e1]"
            }
          `}
                    >
                      {category.name}
                    </button>
                  );
                })
              ) : (
                <div className="h-9 min-w-[120px] rounded-sm border border-[#e1e6ed] bg-[#f3f4f6] px-4 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#9aa2b1]">
                    Nenhuma categoria
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="px-7 pt-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#8a93a5]">
              Subcategoria
            </p>

            <div className="flex flex-wrap gap-2.5">
              {selectedCategory?.subcategories?.length ? (
                selectedCategory.subcategories.map((subcategory) => {
                  const isSelected = selectedSubcategoryId === subcategory.id;

                  return (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedSubcategoryId(subcategory.id)}
                      className={`
            h-9
            rounded-sm
            border
            px-4
            text-sm
            font-medium
            cursor-pointer
            ${
              isSelected
                ? "border-[#8bb5df] bg-[#f2f8ff] text-[#1b325f]"
                : "border-[#e5e9ef] bg-white text-[#7b8497] hover:border-[#d1d9e3]"
            }
          `}
                    >
                      {subcategory.name}
                    </button>
                  );
                })
              ) : (
                <div className="h-9 min-w-[120px] rounded-sm border border-[#e5e9ef] bg-[#f3f4f6] px-4 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#9aa2b1]">
                    Nenhuma subcategoria
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Produtos */}
          <div className="flex-1 overflow-y-auto p-7">
            {!loading &&
              (categories.length === 0 || filteredItems.length === 0) && (
                <div className="flex flex-col items-center justify-center gap-3 py-30 w-full h-full border border-gray-200 rounded-md col-span-full">
                  <div className="bg-[#F5F5F6] p-6 rounded-full flex items-center justify-center">
                    <Inbox className="w-14 h-14 text-[#CCCFD4]" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-gray-800 font-bold text-[20px]">
                      Nenhuma produto cadastrado
                    </p>
                    <p className="text-gray-500 text-[15px] w-92 text-center">
                      Entre em contato com o Admin do restaurante para que seja
                      efetuada a criação do cardápio.
                    </p>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  {/* Imagem */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-[400px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[180px] bg-gray-100 flex items-center justify-center">
                      <Utensils className="w-10 h-10 text-gray-300" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-semibold text-[#19274b]">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-5">
                      <span className="font-semibold text-[#19274b]">
                        {formatPrice(item.price)}
                      </span>

                      <button
                        className="h-9 w-9 border border-gray-200 rounded-lg flex items-center justify-center text-[#1b325f] hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedItem(item);
                          setCustomerName("");
                          setObservation("");
                          setQuantity(1);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-[480px] rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-md text-[#8a93a5] hover:bg-[#f3f5f8] hover:text-[#19274b] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pr-16">
              <h2 className="text-lg font-semibold text-[#19274b]">
                Adicionar pedido
              </h2>
disabled={pendingItems.length === 0}
              <p className="mt-1 text-sm text-[#818598]">
                Informe quem pediu e alguma observação.
              </p>
            </div>

            <div className="mx-6 mt-5 flex gap-4 mb-2">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-gray-100">
                  <Utensils className="h-7 w-7 text-gray-300" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#19274b]">
                  {selectedItem.name}
                </p>

                <p className="mt-1 text-sm font-medium text-[#1b325f]">
                  {formatPrice(selectedItem.price)}
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
               <AnimatedAlert
  message={alert.message}
  type={alert.type}
  onClose={() =>
    setAlert({
      message: null,
      type: "error",
    })
  }
/>
              <div >
                <label className="mb-1.5 block text-sm font-medium text-[#273453]">
                  Quantidade
                </label>

                <div className="flex items-center h-11 w-full rounded-lg border border-[#dfe4eb] overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="h-full w-11 flex items-center justify-center text-lg text-[#536078] hover:bg-[#f5f7fa] cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setQuantity(Number.isNaN(value) ? 1 : Math.max(1, value));
                    }}
                    className="h-full flex-1 text-center text-sm font-semibold text-[#19274b] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="h-full w-11 flex items-center justify-center text-lg text-[#536078] hover:bg-[#f5f7fa] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-[#273453]">
                  Nome do cliente
                </label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Digite o nome do cliente"
                  className="h-11 w-full rounded-lg border border-[#dfe4eb] px-3.5 text-sm text-[#19274b] outline-none focus:border-[#6388b2]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-[#273453]">
                  Observação
                </label>

                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex.: sem cebola, ponto da carne..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#dfe4eb] px-3.5 py-3 text-sm text-[#19274b] outline-none focus:border-[#6388b2]"
                />
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={handleAddPendingItem}
                className="h-11 w-full rounded-md bg-[#1b325f] text-sm font-medium text-white hover:bg-[#16294d] cursor-pointer"
              >
                Adicionar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
