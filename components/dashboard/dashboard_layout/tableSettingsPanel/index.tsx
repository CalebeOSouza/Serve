import type { RestaurantTable } from "@/app/admin/dashboard/[id]/layout/types";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

const elementSize = {
  mesa_quadrada: { w: 75, h: 75 },
  mesa_redonda: { w: 75, h: 75 },
  mesa_retangular: { w: 125, h: 75 },
  mesa_l: { w: 125, h: 125 },
};

type Props = {
  table: RestaurantTable;
  onClose: () => void;
  onUpdate: (id: string, changes: Partial<RestaurantTable>) => void;
};

export default function TableSettingsPanel({
  table,
  onClose,
  onUpdate,
}: Props) {
  const size = elementSize[table.type];
  const disabled = table.status === "indisponivel";

  const MAX_CAPACITY: Record<string, number> = {
    mesa_quadrada: 4,
    mesa_redonda: 6,
    mesa_retangular: 10,
    mesa_l: 12,
  };

  return (
    <div
      className="absolute z-[9999] cursor-auto"
      style={{
        left: table.x + size.w + 95,
        top: table.y - 90,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="
          w-64
          h-68
          rounded-xl
          bg-white
          shadow-xl
          border
          border-gray-200
          p-4
          animate-panel-pop
        "
      >
        <div className="flex items-center justify-between text-[#19274b] mb-2">
          <h2 className="text-sm font-bold">Mesa {table.tableNumber}</h2>

          <button
            onClick={onClose}
            className="hover:bg-gray-50 p-1 rounded-full transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="h-px w-full bg-gray-50 rounded" />

        {/* Div dos botões de capacidade */}
        <div className="mt-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-gray-700">Capacidade</h3>
            <p className="text-[11px] text-gray-500">
              Número máximo de pessoas que podem se sentar na mesa.
            </p>
          </div>

          <div className="mt-3 flex items-center rounded-xl border border-gray-200 overflow-hidden h-9">
            <button
              className="w-11 h-full hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
              onClick={() => {
                if ((table.capacity ?? 0) <= 0) return;
                onUpdate(table.id, { capacity: (table.capacity ?? 0) - 1 });
              }}
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1 text-center">
              <span className="font-semibold text-[#19274b]">
                {table.capacity ?? 4}
              </span>
            </div>

            <button
              className="w-11 h-full hover:bg-gray-50 transition flex items-center justify-center cursor-pointer"
              onClick={() => {
                const max = MAX_CAPACITY[table.type];
                if ((table.capacity ?? 0) >= max) return;
                onUpdate(table.id, { capacity: (table.capacity ?? 0) + 1 });
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-gray-700 mt-3">
              Desativar mesa
            </h3>
            <p className="text-[11px] text-gray-500">
              Impede qualquer ação sobre à mesa.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() =>
                onUpdate(table.id, {
                  status: disabled ? "livre" : "indisponivel",
                })
              }
              className={`relative inline-flex h-6 w-11.25 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                disabled ? "bg-(--color-primary)" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  disabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>

            <p className="text-[11px] text-gray-500">
              {disabled ? "Mesa desativada" : "Mesa ativada"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
