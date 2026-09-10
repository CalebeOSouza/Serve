"use client";

import SubcategoryCard from "@/components/dashboard/dashboard_menu/subcategoryCard";
import { createPortal } from "react-dom";
import ProductModal, {
  ProductFormData,
} from "@/components/dashboard/dashboard_menu/productModal";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import {
  EllipsisVertical,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Inbox,
  Dot,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
   restaurantId: number;
  subcategories: { id: number; name: string; products: Product[] }[];
  onSubcategoriesCreated: (
    categoryId: number,
    created: { id: number; name: string }[],
  ) => void;
  onProductCreated: (
    topCategoryId: number,
    targetCategoryId: number,
    product: Product,
    createdSubcategory: { id: number; name: string } | null,
  ) => void;
  onEdit: (
    id: number,
    name: string,
    parentId: number | null,
    type: "category" | "subcategory",
  ) => void;
  onDelete: (id: number) => void;
onSubcategoryDeleted: (
  categoryId: number,
  subcategoryId: number,
) => void;
  onProductUpdated: (
    topCategoryId: number,
    targetCategoryId: number,
    product: Product,
  ) => void;
  onProductDeleted: (
    topCategoryId: number,
    targetCategoryId: number,
    productId: number,
  ) => void;
  
}

export default function CategoryCard({
  id,
  name,
  subcategories,
  restaurantId,
  onSubcategoriesCreated,
  onProductCreated,
  onEdit,
  onDelete,
   onSubcategoryDeleted,
  onProductUpdated,
  onProductDeleted,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [subcategoryModal, setSubcategoryModal] = useState({
    open: false,
    input: "",
    list: [] as { tempId: string; name: string }[],
  });

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [productModalOpen, setProductModalOpen] = useState(false);

  async function handleCreateProduct(data: ProductFormData) {
    const formData = new FormData();
    formData.append("restaurantId", String(restaurantId));
    formData.append("parentCategoryId", String(id));
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

    onProductCreated(
      id,
      result.categoryId,
      {
        id: result.id,
        categoryId: result.categoryId,
        name: result.name,
        description: result.description,
        price: result.price,
        imageUrl: result.imageUrl,
        available: result.available ?? true,
      },
      result.createdSubcategory,
    );
  }

  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (menuRef.current?.contains(target)) {
        return;
      }

      setMenuOpen(false);
      setConfirmDelete(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addSubcategoryToList() {
    const name = subcategoryModal.input.trim();
    if (name === "") return;

    const alreadyExists =
      subcategories.some((s) => s.name.toLowerCase() === name.toLowerCase()) ||
      subcategoryModal.list.some(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );

    if (alreadyExists) {
      setAlert({
        message: "Essa subcategoria já está na lista.",
        type: "error",
      });
      return;
    }

    setSubcategoryModal((prev) => ({
      ...prev,
      input: "",
      list: [...prev.list, { tempId: crypto.randomUUID(), name }],
    }));
  }

  function removeSubcategoryFromList(tempId: string) {
    setSubcategoryModal((prev) => ({
      ...prev,
      list: prev.list.filter((item) => item.tempId !== tempId),
    }));
  }

  function handleDragStart(index: number) {
    setDraggingIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    setSubcategoryModal((prev) => {
      const list = [...prev.list];
      const [dragged] = list.splice(draggingIndex, 1);
      list.splice(index, 0, dragged);
      return { ...prev, list };
    });

    setDraggingIndex(index);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
  }

  async function createSubcategories() {
    if (subcategoryModal.list.length === 0) {
      setAlert({
        message: "Adicione ao menos uma subcategoria.",
        type: "error",
      });
      return;
    }

    const created: { id: number; name: string }[] = [];

    for (const item of subcategoryModal.list) {
      const response = await fetch("/api/restaurant/menu/category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          name: item.name,
          parentId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({ message: data.error, type: "error" });
        return;
      }

      created.push(data);
    }

    onSubcategoriesCreated(id, created);
    setSubcategoryModal({ open: false, input: "", list: [] });
  }

  const subcategoryCount = subcategories.length;

  const productCount = subcategories.reduce(
    (total, sub) => total + sub.products.length,
    0,
  );

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden border border-gray-200 bg-white rounded-lg px-6 py-5 flex flex-col justify-between gap-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-semibold text-[17px]">{name}</p>

          <div className="flex gap-2">
            <p className="text-sm text-gray-500 flex item-center gap-1 justify-center">
              {subcategoryCount}{" "}
              {subcategoryCount === 1 ? "subcategoria" : "subcategorias"}
              {" - "}
              {productCount} {productCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <button
            type="button"
            onClick={() => setProductModalOpen(true)}
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
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(id, name, null, "category");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>

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
    try {
      const response = await fetch(
        `/api/restaurant/menu/category?id=${id}&restaurantId=${restaurantId}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro ao excluir categoria:", result);
        return;
      }

      // Remove imediatamente da tela
      onDelete(id);

      setConfirmDelete(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
    }
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
      <div
        className="flex w-full min-w-0 max-w-full flex-col gap-2 overflow-y-auto overflow-x-hidden pr-1"
        style={{
          maxHeight: "640px",
        }}
      >
        {subcategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-5 text-center">
            <div className="bg-[#F5F5F6] p-5 rounded-full flex items-center justify-center mb-5">
              <Inbox className="w-10 h-10 text-[#CCCFD4]" />
            </div>
            <div className="flex items-center flex-col gap-2">
              <p className="text-gray-500 font-semibold">
                Nenhuma subcategoria ou produto cadastrados
              </p>
              <p className="text-sm text-gray-400 w-72">
                Comece adicionando uma subcategoria ou um produto para esta
                categoria.
              </p>
            </div>
          </div>
        ) : (
          subcategories.map((sub) => (
            <SubcategoryCard
              key={sub.id}
              id={sub.id}
              name={sub.name}
              restaurantId={restaurantId}
              products={sub.products}
              onProductCreated={(product) =>
                onProductCreated(id, sub.id, product, null)
              }
              onProductUpdated={(product) =>
                onProductUpdated(id, sub.id, product)
              }
              onProductDeleted={(productId) =>
                onProductDeleted(id, sub.id, productId)
              }
              onEdit={(subId, subName) =>
                onEdit(subId, subName, id, "subcategory")
              }
              onDelete={(subId) => onSubcategoryDeleted(id, subId)}
            />
          ))
        )}
      </div>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() =>
            setSubcategoryModal((prev) => ({ ...prev, open: true }))
          }
          className="bg-white border border-gray-300 w-full py-2 rounded-md hover:bg-gray-100 transition cursor-pointer "
        >
          <p className="text-[15px] flex items-center justify-center gap-2">
            <Plus className="h-4.5 w-4.5" />
            Nova subcategoria
          </p>
        </button>
      </div>

      {subcategoryModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[450px]">
            <h2 className="text-xl font-semibold text-[#19274b]">
              Nova subcategoria
            </h2>

            <p className="text-sm text-gray-500 mt-2 mb-6">
              Adicione uma ou mais subcategorias para "{name}". Arraste para
              reordenar.
            </p>

            <AnimatedAlert
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert((prev) => ({ ...prev, message: null }))}
            />

            <div>
              <label className="block mb-1 text-sm font-medium text-[#19274b]">
                Nome da subcategoria
              </label>

              <div className="flex gap-2">
                <input
                  value={subcategoryModal.input}
                  onChange={(e) =>
                    setSubcategoryModal((prev) => ({
                      ...prev,
                      input: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSubcategoryToList();
                    }
                  }}
                  placeholder="Ex: Bebidas quentes"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                />

                <button
                  type="button"
                  onClick={addSubcategoryToList}
                  className="bg-(--color-primary) text-white px-4 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4 max-h-[240px] overflow-y-auto pr-1">
              {subcategoryModal.list.map((item, index) => (
                <div
                  key={item.tempId}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <span className="text-sm text-[#19274b]">{item.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSubcategoryFromList(item.tempId)}
                    className="text-red-500 hover:text-red-700 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setSubcategoryModal({ open: false, input: "", list: [] })
                }
                className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={createSubcategories}
                className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal
        open={productModalOpen}
        mode="create"
        contextName={name}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[400px]">
            <h2 className="text-xl font-semibold text-[#19274b]">
              Subcategorias de "{name}"
            </h2>

            <div className="flex flex-col gap-2 mt-4 max-h-[280px] overflow-y-auto pr-1">
              {subcategories.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Nenhuma subcategoria criada ainda.
                </p>
              ) : (
                subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50"
                  >
                    <span className="text-sm text-[#19274b]">{sub.name}</span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setViewModalOpen(false)}
              className="w-full mt-6 py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
