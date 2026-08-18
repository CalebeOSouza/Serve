"use client";

import {
  ChevronDown,
  EllipsisVertical,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  available: boolean;
  onEdit: () => void;
  onDelete: (id: number) => Promise<void> | void;
};

export default function ProductCard({
  id,
  name,
  description,
  price,
  imageUrl,
  available,
  onEdit,
  onDelete,
}: Props) {
  const [enabled, setEnabled] = useState(available);
  const [updatingAvailable, setUpdatingAvailable] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [tooltip, setTooltip] = useState<{
    type: "name" | "description";
    x: number;
    y: number;
  } | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function showTooltip(type: "name" | "description", element: HTMLElement) {
    const rect = element.getBoundingClientRect();

    setTooltip({
      type,
      x: rect.left,
      y: rect.bottom + 6,
    });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  async function handleToggleAvailable() {
    if (updatingAvailable) return;

    const newAvailable = !enabled;

    try {
      setUpdatingAvailable(true);

      const formData = new FormData();

      formData.append("id", String(id));
      formData.append("available", String(newAvailable));

      const response = await fetch("/api/restaurant/menu/product", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(result.error);
        return;
      }

      setEnabled(newAvailable);
    } catch (error) {
      console.error("Erro ao alterar disponibilidade:", error);
    } finally {
      setUpdatingAvailable(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
      setConfirmDelete(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const MAX_TEXT = 40;

  const showNameTooltip = name.length > MAX_TEXT;
  const showDescriptionTooltip = (description?.length ?? 0) > MAX_TEXT;

  const shortName = showNameTooltip ? name.slice(0, MAX_TEXT) + "..." : name;

  const shortDescription = showDescriptionTooltip
    ? description!.slice(0, MAX_TEXT) + "..."
    : description;

  useEffect(() => {
    function handleScroll() {
      setMenuOpen(false);
      setConfirmDelete(false);
      setTooltip(null);
    }

    document.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
   <div className="flex w-full min-w-0 flex-col gap-3 py-1 sm:min-h-[88px] sm:flex-row sm:items-center sm:justify-between">
      {/* ESQUERDA */}
      <div className="flex min-w-0 w-full flex-1 items-center gap-3">
        {/* <button className="cursor-grabbing">
          <GripVertical className="w-4.5 h-4.5 text-gray-600" />
        </button> */}

        {imageUrl ? (
          <div
            className={`relative w-[64px] h-[64px] sm:w-[90px] sm:h-[90px] shrink-0 overflow-hidden rounded-md bg-gray-100 transition-all duration-200 ${
              !enabled ? "grayscale opacity-60" : ""
            }`}
          >
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-[60px] h-[60px] rounded-md bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">Sem imagem</span>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-w-0 w-full">
            <p
              className="text-[16px] font-semibold truncate"
              onMouseEnter={(e) => {
                if (showNameTooltip) {
                  showTooltip("name", e.currentTarget);
                }
              }}
              onMouseLeave={hideTooltip}
            >
              {shortName}
            </p>
          </div>

          <div className="relative min-w-0 w-full">
            <p
              className="text-[15px] text-gray-500 truncate"
              onMouseEnter={(e) => {
                if (showDescriptionTooltip) {
                  showTooltip("description", e.currentTarget);
                }
              }}
              onMouseLeave={hideTooltip}
            >
              {shortDescription}
            </p>
          </div>
        </div>
      </div>

      {tooltip &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: tooltip.y,
              left: tooltip.x,
              zIndex: 999999,
            }}
            className="w-72 max-w-[320px] text-[15px] rounded-md border border-gray-200 bg-white shadow-xl px-3 py-2 text-xs leading-5 whitespace-normal break-words [overflow-wrap:anywhere] pointer-events-none"
          >
            {tooltip.type === "name" ? name : description}
          </div>,
          document.body,
        )}

      {/* DIREITA */}
      <div className="flex w-full shrink-0 items-center gap-4 sm:w-auto sm:gap-5">
        <p className="font-bold text-[16px] whitespace-nowrap">
          R${" "}
          {Number(price).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleAvailable}
            disabled={updatingAvailable}
            aria-pressed={enabled}
            className={`relative inline-flex h-6.5 w-10 items-center rounded-full transition-colors duration-200 ${
              updatingAvailable ? "cursor-wait opacity-70" : "cursor-pointer"
            } ${enabled ? "bg-(--color-primary)" : "bg-gray-300"}`}
          >
            <span
              className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
                enabled ? "translate-x-4.5" : "translate-x-1"
              }`}
            />
          </button>

          <div className="flex items-center gap-1" ref={menuRef}>
            <button
              ref={buttonRef}
              type="button"
              onClick={() => {
                if (!buttonRef.current) return;

                const rect = buttonRef.current.getBoundingClientRect();

                setMenuPosition({
                  x: rect.right + window.scrollX,
                  y: rect.bottom + window.scrollY + 8,
                });

                setMenuOpen((prev) => !prev);
              }}
              className="cursor-pointer rounded-md p-1 hover:bg-gray-100 transition"
            >
              <EllipsisVertical className="w-6 h-6 text-gray-600" />
            </button>

            {(menuOpen || confirmDelete) &&
              createPortal(
                <div
                  ref={dropdownRef}
                  style={{
                    position: "absolute",
                    top: menuPosition.y,
                    left: menuPosition.x,
                    transform: "translateX(-100%)",
                    zIndex: 999999,
                  }}
                  className={`rounded-lg shadow-xl overflow-hidden ${
                    confirmDelete
                      ? "bg-red-600 w-50"
                      : "w-28 border border-gray-200 bg-white"
                  }`}
                >
                  {!confirmDelete ? (
                    <>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-white">
                      <p className="font-semibold text-sm">
                        Deseja excluir este produto?
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        Essa ação não pode ser desfeita.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 bg-white text-red-600 rounded py-2 text-sm cursor-pointer hover:bg-gray-100 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => {
                            await onDelete(id);
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
                </div>,
                document.body,
              )}
          </div>
        </div>
      </div> 
    </div>
  );
}
