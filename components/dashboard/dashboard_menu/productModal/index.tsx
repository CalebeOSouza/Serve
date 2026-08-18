"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import { useRef } from "react";

export type ProductFormData = {
  name: string;
  description: string;
  price: string;
  imageFile: File | null;
};

export type EditingProduct = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
};

interface Props {
  open: boolean;
  mode: "create" | "edit";
  contextName: string;
  initialData?: EditingProduct | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<string | void>;
}

export default function ProductModal({
  open,
  mode,
  contextName,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success";
  }>({
    message: null,
    type: "error",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description ?? "",
        price: initialData.price,
        imageFile: null,
        imagePreview: initialData.imageUrl,
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        imageFile: null,
        imagePreview: null,
      });
    }
    setAlert({ message: null, type: "error" });
  }, [open, mode, initialData]);

  if (!open) return null;

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

    if (
      !allowedTypes.includes(file.type) ||
      !allowedExtensions.has(extension)
    ) {
      setAlert({
        message:
          "Formato inválido. Utilize apenas JPG, JPEG, PNG, WEBP ou GIF.",
        type: "error",
      });

      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  function resetAndClose() {
    setForm({
      name: "",
      description: "",
      price: "",
      imageFile: null,
      imagePreview: null,
    });
    setAlert({ message: null, type: "error" });
    onClose();
  }

  async function handleSubmit() {
    if (form.name.trim() === "") {
      setAlert({ message: "Digite um nome para o produto.", type: "error" });
      return;
    }

    if (form.price.trim() === "") {
      setAlert({ message: "Digite um preço para o produto.", type: "error" });
      return;
    }

    if (!form.imageFile && !form.imagePreview) {
      setAlert({
        message: "Selecione uma imagem para o produto.",
        type: "error",
      });

      return;
    }

    const errorMessage = await onSubmit({
      name: form.name,
      description: form.description,
      price: form.price,
      imageFile: form.imageFile,
    });

    if (errorMessage) {
      setAlert({ message: errorMessage, type: "error" });
      return;
    }

    resetAndClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[450px]">
        <h2 className="text-xl font-semibold text-[#19274b]">
          {mode === "create" ? "Novo produto" : "Editar produto"}
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">
          {mode === "create"
            ? `Adicione um novo produto em "${contextName}".`
            : `Edite os dados do produto em "${contextName}".`}
        </p>

        <AnimatedAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert((prev) => ({ ...prev, message: null }))}
        />

        <div>
          <label className="block mb-1 text-sm font-medium text-[#19274b]">
            Foto do produto
          </label>

          <div className="flex items-center gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-md border border-gray-300 overflow-hidden flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
            >
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImagePlus className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              onChange={handleImageChange}
              className="text-sm text-gray-600"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium text-[#19274b]">
            Nome do produto
          </label>

          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Ex: Bolo de chocolate"
            className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
            maxLength={100}
          />
        </div>

        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium text-[#19274b]">
            Descrição
          </label>

          <input
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Ex: Bolo de chocolate com cobertura"
            className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
            maxLength={200}
          />
        </div>

        <div className="mt-4">
          <label className="block mb-1 text-sm font-medium text-[#19274b]">
            Preço
          </label>

          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, price: e.target.value }))
            }
            placeholder="Ex: 19.90"
            className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={resetAndClose}
            className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
          >
            {mode === "create" ? "Criar" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
