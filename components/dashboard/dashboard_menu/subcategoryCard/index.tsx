"use client";

import {
  ChevronDown,
  Pencil,
  Plus,
  EllipsisVertical,
  Trash2,
  Inbox,
  ChevronUp,
  CircleAlert,
  CircleQuestionMark,
} from "lucide-react";
import { createPortal } from "react-dom";
import ProductCard from "@/components/dashboard/dashboard_menu/productCard";
import ProductModal, {
  ProductFormData,
} from "@/components/dashboard/dashboard_menu/productModal";
import { useEffect, useRef, useState } from "react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type Product = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
};

interface Props {
  id: number;
  name: string;
  products: Product[];
  onProductCreated: (product: Product) => void;
  onEdit: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onProductUpdated: (product: Product) => void;
  onProductDeleted: (productId: number) => void;
}

export default function SubcategoryCard({
  id,
  name,
  products,
  onProductCreated,
  onEdit,
  onDelete,
  onProductUpdated,
  onProductDeleted,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });

  const [productModalMode, setProductModalMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  async function handleCreateProduct(data: ProductFormData) {
    const formData = new FormData();
    formData.append("restaurantId", "1");
    formData.append("categoryId", String(id));
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const response = await fetch("/api/restaurant/menu/product", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return result.error;
    }

    onProductCreated({
      id: result.id,
      categoryId: result.categoryId,
      name: result.name,
      description: result.description,
      price: result.price,
      imageUrl: result.imageUrl,
      available: result.available ?? true,
    });
  }

  function openCreateProduct() {
    setProductModalMode("create");
    setEditingProduct(null);
    setProductModalOpen(true);
  }

  function openEditProduct(product: Product) {
    setProductModalMode("edit");
    setEditingProduct(product);
    setProductModalOpen(true);
  }

  async function handleUpdateProduct(data: ProductFormData) {
    if (!editingProduct) return;

    const formData = new FormData();
    formData.append("id", String(editingProduct.id));
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    if (data.imageFile) {
      formData.append("image", data.imageFile);
    }

    const response = await fetch("/api/restaurant/menu/product", {
      method: "PUT",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) {
      return result.error;
    }

    onProductUpdated({
      ...editingProduct,
      name: data.name,
      description: data.description || null,
      price: data.price,
      imageUrl: result.imageUrl,
    });
  }

  async function handleDeleteProduct(productId: number) {
    await fetch(`/api/restaurant/menu/product?id=${productId}`, {
      method: "DELETE",
    });
    onProductDeleted(productId);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden border border-gray-200 py-5 px-3 rounded-md flex flex-col gap-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="cursor-pointer"
            >
              {collapsed ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            <div className="flex items-center gap-1">
              <p className="font-semibold text-[15px]">{name}</p>
              {name === "Produtos" && (
                <div
                  ref={iconRef}
                  className="flex items-center"
                  onMouseEnter={() => {
                    if (!iconRef.current) return;

                    const rect = iconRef.current.getBoundingClientRect();

                    setPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.bottom + 10,
                    });

                    setOpen(true);
                  }}
                  onMouseLeave={() => setOpen(false)}
                >
                  <CircleQuestionMark className="w-4.5 h-4.5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 ml-5">
            <p className="text-sm text-gray-500">
              {products.length} {products.length === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCreateProduct}
            className="bg-white border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5 text-gray-800" />
          </button>

          <div className="flex items-center gap-1" ref={menuRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="cursor-pointer rounded-md p-1 hover:bg-gray-100 transition"
              >
                <EllipsisVertical className="w-5 h-5 text-gray-600" />
              </button>

              {(menuOpen || confirmDelete) && (
                <div
                  className={`absolute right-0 top-full mt-2 rounded-lg shadow-xl overflow-hidden z-50 ${
                    confirmDelete
                      ? "bg-red-600 w-50"
                      : "bg-white border border-gray-200 w-28"
                  }`}
                >
                  {!confirmDelete ? (
                    <>
                      {name !== "Produtos" && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            onEdit(id, name);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-white">
                      <p className="font-semibold text-sm">
                        Deseja excluir esta categoria?
                      </p>

                      <p className="text-xs mt-1 opacity-90">
                        Todos os produtos e subcategorias serão apagados.
                      </p>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setConfirmDelete(false);
                          }}
                          className="flex-1 bg-white text-red-600 rounded py-2 text-sm cursor-pointer hover:bg-gray-100 transition"
                        >
                          Cancelar
                        </button>

                        <button
                          onClick={async () => {
                            await fetch(
                              `/api/restaurant/menu/category?id=${id}`,
                              {
                                method: "DELETE",
                              },
                            );

                            onDelete(id);

                            setConfirmDelete(false);

                            setMenuOpen(false);
                          }}
                          className="flex-1 bg-red-800 rounded py-2 text-sm cursor-pointer hover:bg-red-900 transition"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ${  ? "" : ""} */}
      {!collapsed && (
        <div
          className="w-full overflow-y-auto flex flex-col gap-6 mt-1 px-5"
          style={{
            maxHeight: "230px",
          }}
        >
          {products.length === 0 ? (
            <div className="flex items-center justify-center py-3 text-center gap-3">
              <div className="bg-[#F5F5F6] p-4 rounded-full flex items-center justify-center">
                <Inbox className="w-8 h-8 text-[#CCCFD4]" />
              </div>

              <p className="text-gray-500 font-semibold text-[15px]">
                Nenhum produto cadastrado!
              </p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                available={product.available}
                onEdit={() => openEditProduct(product)}
                onDelete={handleDeleteProduct}
              />
            ))
          )}
        </div>
      )}

      <ProductModal
        open={productModalOpen}
        mode={productModalMode}
        contextName={name}
        initialData={editingProduct}
        onClose={() => setProductModalOpen(false)}
        onSubmit={
          productModalMode === "create"
            ? handleCreateProduct
            : handleUpdateProduct
        }
      />

      {open &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: position.y,
              left: position.x,
              transform: "translateX(-50%)",
              zIndex: 999999,
            }}
            className="w-80 rounded-xl border border-gray-200 bg-white shadow-2xl p-4"
          >
            <p className="text-sm text-gray-700 leading-6">
              Os produtos que não forem criados em uma subcategoria, mas
              diretamente na categoria, são posicionados na subcategoria
              "Produtos". Por isso, é recomendado criar subcategorias para
              organizar melhor os produtos.
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}
