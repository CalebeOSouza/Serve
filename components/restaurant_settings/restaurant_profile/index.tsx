"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type ProfileForm = {
  name: string;
  description: string;
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
};

interface RestaurantProfileProps {
  mode: "onboarding" | "settings";
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;

  restaurantId: number | null;
  setRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;

  onNext?: () => void;
}

export default function RestaurantProfile({
  mode,
  form,
  setForm,
  restaurantId,
  setRestaurantId,
  onNext,
}: RestaurantProfileProps) {
  const [alert, setAlert] = useState<{
    message: string | null;
    type?: "error" | "success" | "warning";
  }>({ message: null });

  const alertRef = useRef<HTMLDivElement | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    try {
      const response = await fetch("/api/restaurant/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: restaurantId,
        }),
      });

      const data = await response.json();

      if (data.restaurantId) {
        setRestaurantId(data.restaurantId);
      }

      if (!response.ok) {
        setAlert({
          message: data.error || "Erro ao salvar restaurante",
          type: "error",
        });
        return;
      }

      if (mode === "onboarding" && onNext) onNext();
    } catch (err) {
      setAlert({
        message: "Erro inesperado. Tente novamente.",
        type: "error",
      });
    }
  }

  useEffect(() => {
    if (alert.message && alertRef.current) {
      alertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [alert.message]);

  return (
    <section className="min-h-screen flex items-center justify-center pt-15">
      <div className="flex flex-col items-center gap-10">
        <div className="relative w-full max-w-xl bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-(--color-primary)" />

          <div className="p-8 pb-13">
            <div className="text-center flex flex-col gap-1 mb-10">
              <h1 className="text-[26px] text-gray-800">
                Informações do restaurante
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                Faça com que as pessoas conheçam seu negócio!
              </p>
            </div>

            <div ref={alertRef}>
              <AnimatedAlert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ message: null })}
              />
            </div>

            <form className="flex flex-col gap-8">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Sobre o restaurante
                  </h2>

                  <div>
                    <label className="text-sm text-gray-600">
                      Nome do restaurante{" "}
                      <span className="text-red-600 font-bold text-sm">
                        *
                      </span>
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      type="text"
                      className="w-full mt-1 px-4 py-3 rounded-md focus:ring-black/10 border border-gray-300 outline-none"
                      placeholder="Restaurante Exemplo"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-sm text-gray-600">
                      Descrição{" "}
                      <span className="font-semi text-[12.5px] italic text-gray-500">
                        - Opcional
                      </span>
                    </label>

                    <input
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      type="text"
                      className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                      placeholder="Descrição Exemplo"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Endereço
                  </h2>

                  <div>
                    <label className="text-sm text-gray-600">
                      CEP{" "}
                      <span className="text-red-600 font-bold text-sm">
                        *
                      </span>
                    </label>

                    <input
                      name="zipcode"
                      value={form.zipcode}
                      onChange={handleChange}
                      type="text"
                      className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                      placeholder="00000-000"
                      maxLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                      Rua{" "}
                      <span className="text-red-600 font-bold text-sm">
                        *
                      </span>
                    </label>

                    <input
                      name="street"
                      value={form.street}
                      onChange={handleChange}
                      type="text"
                      className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                      placeholder="Rua Exemplo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">
                        Número{" "}
                        <span className="text-red-600 font-bold text-sm">
                          *
                        </span>
                      </label>

                      <input
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        type="text"
                        className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                        placeholder="123"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">
                        Bairro{" "}
                        <span className="text-red-600 font-bold text-sm">
                          *
                        </span>
                      </label>

                      <input
                        name="neighborhood"
                        value={form.neighborhood}
                        onChange={handleChange}
                        type="text"
                        className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                        placeholder="Centro"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">
                        Cidade{" "}
                        <span className="text-red-600 font-bold text-sm">
                          *
                        </span>
                      </label>

                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        type="text"
                        className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                        placeholder="São Paulo"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600">
                        Estado{" "}
                        <span className="text-red-600 font-bold text-sm">
                          *
                        </span>
                      </label>

                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        type="text"
                        className="w-full mt-1 px-4 py-3 rounded-md border border-gray-300 outline-none focus:ring-black/10"
                        placeholder="SP"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {mode === "onboarding" && (
            <div className="mt-auto">
              <button
                onClick={handleSubmit}
                type="button"
                className="w-full h-14 bg-(--color-primary) text-white font-semibold text-[15px] hover:bg-(--color-secondary) transition-all duration-200 cursor-pointer"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
