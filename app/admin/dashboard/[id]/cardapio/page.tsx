"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, GripVertical, Trash2, Inbox, LoaderCircle } from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import CategoryCard from "@/components/dashboard/dashboard_menu/categoryCard";

type CategoryModalState = {
  open: boolean;
  mode: "create" | "edit";
  categoryId: number | null;
  parentId: number | null;
  editingType: "category" | "subcategory";
  form: {
    name: string;
    subcategories: {
      tempId: string;
      name: string;
    }[];
  };
};

export default function RestaurantCardapio() {
  const params = useParams();

  const restaurantId = Number(params.id);

  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({
    open: false,
    mode: "create" as "create" | "edit",

    categoryId: null as number | null,

    parentId: null as number | null,

    editingType: "category" as "category" | "subcategory",

    form: {
      name: "",
      subcategories: [],
    },
  });

  const [innerSubcategoryInput, setInnerSubcategoryInput] = useState("");

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const [subcategoryModal, setSubcategoryModal] = useState({
    open: false,

    categoryId: null as number | null,

    input: "",

    list: [] as string[],
  });

  const [subcategoryName, setSubcategoryName] = useState("");

  type Product = {
    id: number;
    categoryId: number;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    available: boolean;
  };

  const [categories, setCategories] = useState<
    {
      id: number;
      name: string;
      subcategories: { id: number; name: string; products: Product[] }[];
    }[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });

  useEffect(() => {
    if (!restaurantId || Number.isNaN(restaurantId)) return;

    async function fetchMenu() {
      try {
        const [catResponse, prodResponse] = await Promise.all([
          fetch(`/api/restaurant/menu/category?restaurantId=${restaurantId}`),
          fetch(`/api/restaurant/menu/product?restaurantId=${restaurantId}`),
        ]);

        if (!catResponse.ok || !prodResponse.ok) return;

        const catData = await catResponse.json();
        const prodData: Product[] = await prodResponse.json();

        const merged = catData.map((cat: any) => ({
          ...cat,
          subcategories: cat.subcategories.map((sub: any) => ({
            ...sub,
            products: prodData.filter((p) => p.categoryId === sub.id),
          })),
        }));

        setCategories(merged);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurantId]);

  function handleProductCreated(
    topCategoryId: number,
    targetCategoryId: number,
    product: Product,
    createdSubcategory: { id: number; name: string } | null,
  ) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== topCategoryId) return cat;

        let subcategories = cat.subcategories;

        if (createdSubcategory) {
          subcategories = [
            ...subcategories,
            {
              id: createdSubcategory.id,
              name: createdSubcategory.name,
              products: [],
            },
          ];
        }

        return {
          ...cat,
          subcategories: subcategories.map((sub) =>
            sub.id === targetCategoryId
              ? { ...sub, products: [...sub.products, product] }
              : sub,
          ),
        };
      }),
    );
  }

  function handleProductUpdated(
    topCategoryId: number,
    targetCategoryId: number,
    updatedProduct: Product,
  ) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== topCategoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === targetCategoryId
              ? {
                  ...sub,
                  products: sub.products.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p,
                  ),
                }
              : sub,
          ),
        };
      }),
    );
  }

  function handleProductDeleted(
    topCategoryId: number,
    targetCategoryId: number,
    productId: number,
  ) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== topCategoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === targetCategoryId
              ? {
                  ...sub,
                  products: sub.products.filter((p) => p.id !== productId),
                }
              : sub,
          ),
        };
      }),
    );
  }

  async function createCategory() {
    if (categoryModal.mode === "edit") {
      const response = await fetch("/api/restaurant/menu/category", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          id: categoryModal.categoryId,
          name: categoryModal.form.name,
          parentId: categoryModal.parentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({
          message: data.error,
          type: "error",
        });
        return;
      }

      setCategories((prev) =>
        prev.map((cat) => {
          if (categoryModal.editingType === "category") {
            if (cat.id !== categoryModal.categoryId) return cat;

            return {
              ...cat,
              name: categoryModal.form.name,
            };
          }

          return {
            ...cat,
            subcategories: cat.subcategories.map((sub) =>
              sub.id === categoryModal.categoryId
                ? {
                    ...sub,
                    name: categoryModal.form.name,
                  }
                : sub,
            ),
          };
        }),
      );

      setCategoryModal({
        open: false,
        mode: "create",
        categoryId: null,
        parentId: null,
        editingType: "category",
        form: {
          name: "",
          subcategories: [],
        },
      });

      return;
    }

    if (categoryModal.form.name.trim() == "") {
      setAlert({
        message: "Digite um nome para a categoria.",
        type: "error",
      });
      return;
    }

    const response = await fetch("/api/restaurant/menu/category/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        name: categoryModal.form.name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setAlert({ message: data.error, type: "error" });
      return;
    }

    const createdSubcategories: { id: number; name: string }[] = [];

    for (const sub of categoryModal.form.subcategories) {
      const subResponse = await fetch("/api/restaurant/menu/category/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          name: sub.name,
          parentId: data.id,
        }),
      });

      const subData = await subResponse.json();

      if (!subResponse.ok) {
        setAlert({ message: subData.error, type: "error" });
        return;
      }

      createdSubcategories.push(subData);
    }

    setCategories((prev) => [
      ...prev,
      {
        id: data.id,
        name: data.name,
        subcategories: createdSubcategories.map((sub) => ({
          ...sub,
          products: [],
        })),
      },
    ]);
    setCategoryModal({
      open: false,
      mode: "create",
      categoryId: null,
      parentId: null,
      editingType: "category",
      form: {
        name: "",
        subcategories: [],
      },
    });
  }

  function addSubcategoryToForm() {
    const name = innerSubcategoryInput.trim();
    if (name === "") return;

    const alreadyExists = categoryModal.form.subcategories.some(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      setAlert({
        message: "Essa subcategoria já está na lista.",
        type: "error",
      });
      return;
    }

    setCategoryModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        subcategories: [
          ...prev.form.subcategories,
          { tempId: crypto.randomUUID(), name },
        ],
      },
    }));

    setInnerSubcategoryInput("");
  }

  function removeSubcategoryFromForm(tempId: string) {
    setCategoryModal((prev) => ({
      ...prev,
      form: {
        ...prev.form,
        subcategories: prev.form.subcategories.filter(
          (s) => s.tempId !== tempId,
        ),
      },
    }));
  }

  function handleDragStart(index: number) {
    setDraggingIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    setCategoryModal((prev) => {
      const list = [...prev.form.subcategories];
      const [dragged] = list.splice(draggingIndex, 1);
      list.splice(index, 0, dragged);
      return { ...prev, form: { ...prev.form, subcategories: list } };
    });

    setDraggingIndex(index);
  }

  function handleDragEnd() {
    setDraggingIndex(null);
  }
function handleSubcategoryDeleted(
  categoryId: number,
  subcategoryId: number,
) {
  setCategories((prev) =>
    prev.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            subcategories: category.subcategories.filter(
              (sub) => sub.id !== subcategoryId,
            ),
          }
        : category,
    ),
  );
}
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-x-hidden">
      <header className={`w-full mx-auto flex flex-col pt-10 px-5 lg:px-10`}>
        <div className="flex justify-between text-start mb-3 flex-col gap-6 lg:flex-row lg:gap-0">
          <div className="flex flex-col">
            <h1 className="font-semibold text-[27px] text-[#19274b]">
              Criar cardápio!
            </h1>
            <p className="max-w-full text-[16px] leading-6 text-[#19274b]">
              Gerencie o cardápio do seu estabelecimento e destaque o que o seu
              restaurante tem de melhor a oferecer.
            </p>
          </div>
          <div className="flex w-full items-center sm:w-auto">
            <button
              className="flex items-center gap-2 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
              onClick={() => {
                setCategoryModal({ ...categoryModal, open: true });
              }}
            >
              <Plus className="w-5 h-5 text-white" />
              Nova categoria
            </button>
          </div>
        </div>
        <span className="mt-4 border-b border-gray-200"></span>

        {categoryModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-[450px]">
              <h2 className="text-xl font-semibold text-[#19274b]">
                {categoryModal.mode === "create"
                  ? "Crie uma nova categoria"
                  : "Editar categoria"}
              </h2>

              <p className="text-sm text-gray-500 mt-2 mb-6">
     
                {categoryModal.mode === "create"
                  ? "Adicione uma nova categoria ao seu cardápio para organizar seus produtos de forma eficiente."
                  : "Edite o nome da categoria."}
              </p>

              <AnimatedAlert
                message={alert.message}
                type={alert.type}
                onClose={() =>
                  setAlert((prev) => ({
                    ...prev,
                    message: null,
                  }))
                }
              />

              <div>
                <label className="block mb-1 text-sm font-medium text-[#19274b]">
                  Nome da categoria
                </label>

                <input
                  value={categoryModal.form.name}
                  onChange={(e) =>
                    setCategoryModal((prev) => ({
                      ...prev,
                      form: {
                        ...prev.form,
                        name: e.target.value,
                      },
                    }))
                  }
                  placeholder="Ex: Sobremesas"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                />
              </div>
              {categoryModal.mode === "create" && (
                <div className="mt-4">
                  <label className="block mb-1 text-sm font-medium text-[#19274b]">
                    Subcategorias
                  </label>

                  <div className="flex gap-2">
                    <input
                      value={innerSubcategoryInput}
                      onChange={(e) => setInnerSubcategoryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSubcategoryToForm();
                        }
                      }}
                      placeholder="Ex: Bebidas quentes"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
                    />

                    <button
                      type="button"
                      onClick={addSubcategoryToForm}
                      className="bg-(--color-primary) text-white px-4 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {categoryModal.form.subcategories.length > 0 && (
                    <div className="flex flex-col gap-2 mt-3 max-h-[180px] overflow-y-auto pr-1">
                      {categoryModal.form.subcategories.map((item, index) => (
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
                            <span className="text-sm text-[#19274b]">
                              {item.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSubcategoryFromForm(item.tempId)
                            }
                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() =>
                    setCategoryModal({ ...categoryModal, open: false })
                  }
                  className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  onClick={createCategory}
                  className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
                >
                  {categoryModal.mode === "create"
                    ? "Criar"
                    : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex w-full min-w-0 py-5 pb-10 lg:px-10 mt-5">
        <div className="grid w-full min-w-0 grid-cols-1 min-[1530px]:grid-cols-2 gap-6 items-start">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-30 w-full col-span-full gap-3">
              <LoaderCircle className="w-10 h-10 text-(--color-primary) animate-spin" />
              <p className="text-gray-500">Carregando cardápio...</p>
            </div>
          ) : categories.length === 0 ? (

            
            <div className="flex flex-col items-center justify-center gap-3 py-30 w-full border border-gray-200 rounded-md col-span-full">
              <div className="bg-[#F5F5F6] p-6 rounded-full flex items-center justify-center">
                <Inbox className="w-14 h-14 text-[#CCCFD4]" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-gray-800 font-bold text-[20px]">
                  Nenhuma categoria criada ainda
                </p>
                <p className="text-gray-500 text-[15px] w-92 text-center">
                  Comece adicionando sua primeira categoria para organizar os
                  itens do seu cardápio
                </p>
              </div>

              <div className="flex items-center mt-3">
                <button
                  className="flex items-center gap-2 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
                  onClick={() => {
                    setCategoryModal({ ...categoryModal, open: true });
                  }}
                >
                  <Plus className="w-5 h-5 text-white" />
                  Nova categoria
                </button>
              </div>
            </div>
          ) : (
            categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                restaurantId={restaurantId}
                subcategories={category.subcategories}
                onSubcategoriesCreated={(categoryId, created) => {
                  setCategories((prev) =>
                    prev.map((cat) =>
                      cat.id === categoryId
                        ? {
                            ...cat,
                            subcategories: [
                              ...cat.subcategories,
                              ...created.map((sub) => ({
                                ...sub,
                                products: [],
                              })),
                            ],
                          }
                        : cat,
                    ),
                  );
                }}
                onProductCreated={handleProductCreated}
                onEdit={(id, name, parentId, type) => {
                  setCategoryModal({
                    open: true,
                    mode: "edit",

                    categoryId: id,

                    parentId,

                    editingType: type,

                    form: {
                      name,
                      subcategories: [],
                    },
                  });
                }}
                onDelete={(id) => {
                  setCategories((prev) => prev.filter((c) => c.id !== id));
                }}
                onSubcategoryDeleted={handleSubcategoryDeleted}
                onProductUpdated={handleProductUpdated}
                onProductDeleted={handleProductDeleted}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
