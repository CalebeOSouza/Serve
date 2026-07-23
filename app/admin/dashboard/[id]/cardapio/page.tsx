"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Pizza,
  Coffee,
  CakeSlice,
  Beef,
  Sandwich,
  Salad,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import EmployeeCard, {
  Employee,
} from "@/components/dashboard/dashboard_employees/employee_card";
import { useRef } from "react";

export default function RestaurantCardapio() {
  const [categoryModal, setCategoryModal] = useState({
    open: false,
    mode: "create" as "create" | "edit",
    categoryId: null as number | null,

    form: {
      name: "",
      icon: "",
    },
  });
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconPickerRef = useRef<HTMLDivElement>(null);

  const icons = [
    {
      id: "pizza",
      name: "Pizza",
      Icon: Pizza,
    },
    {
      id: "coffee",
      name: "Café",
      Icon: Coffee,
    },
    {
      id: "cake",
      name: "Sobremesa",
      Icon: CakeSlice,
    },
    {
      id: "beef",
      name: "Carne",
      Icon: Beef,
    },
    {
      id: "sandwich",
      name: "Sanduíche",
      Icon: Sandwich,
    },
    {
      id: "salad",
      name: "Salada",
      Icon: Salad,
    },
  ];

  const SelectedIcon = icons.find(
    (i) => i.id === categoryModal.form.icon,
  )?.Icon;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        iconPickerRef.current &&
        !iconPickerRef.current.contains(e.target as Node)
      ) {
        setIconPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`w-full mx-auto flex flex-col p-8 px-16`}>
      <div className="flex justify-between text-start my-5 flex-col gap-6 lg:flex-row lg:gap-0">
        <div className="flex flex-col">
          <h1 className="font-semibold text-[26px] text-[#19274b]">
            Criar cardápio!
          </h1>
          <p className=" text-[15px] text-[#19274b]">
            Gerencie o cardápio do seu estabelecimento e destaque o que o seu
            restaurante tem de melhor a oferecer.
          </p>
        </div>
        <div className="flex items-center">
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
              Crie uma nova categoria
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Adicione uma nova categoria ao seu cardápio para organizar seus
              produtos de forma eficiente.
            </p>

            <div
              className="mt-6 flex items-end gap-3 relative"
              ref={iconPickerRef}
            >
              <div className="flex-1">
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

              <div>
                <button
                  type="button"
                  onClick={() => setIconPickerOpen((prev) => !prev)}
                  className="
        w-11
        h-11
        rounded-md
        border
        border-gray-300
    
        hover:bg-gray-50
        transition
        flex
        items-center
        justify-center
        cursor-pointer

      "
                >
                  {SelectedIcon ? (
                    <SelectedIcon className="w-5 h-5 text-[#19274b]" />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {iconPickerOpen && (
                  <div
                    className="
    absolute
    left-0
    right-0
    top-full
    mt-2
    bg-white
    border
    border-gray-200
    rounded-xl
    shadow-xl
    p-4
    z-50
  "
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => {
                            setCategoryModal((prev) => ({
                              ...prev,
                              form: {
                                ...prev.form,
                                icon: icon.id,
                              },
                            }));

                            setIconPickerOpen(false);
                          }}
                          className={`h-12 rounded-lg border transition flex items-center justify-center text-xl cursor-pointer
            ${
              categoryModal.form.icon === icon.id
                ? "border-none bg-blue-50"
                : "border-transparent hover:bg-gray-100"
            }`}
                        >
                          <icon.Icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      <div></div>
    </div>
  );
}
