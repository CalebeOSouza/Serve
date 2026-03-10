"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import Image from "next/image";

interface RestaurantMediaProps {
  mode: "onboarding" | "settings";
  onNext?: () => void;
  onBack?: () => void;

  logoPreview: string | null;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  bannerPreview: string | null;
  setBannerPreview: React.Dispatch<React.SetStateAction<string | null>>;
  logoFile: File | null;
  setLogoFile: React.Dispatch<React.SetStateAction<File | null>>;
  bannerFile: File | null;
  setBannerFile: React.Dispatch<React.SetStateAction<File | null>>;

  restaurantId: number | null;
  setRestaurantId: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function RestaurantMedia({
  mode,
  onNext,
  onBack,
  logoPreview,
  setLogoPreview,
  bannerPreview,
  setBannerPreview,
  logoFile,
  setLogoFile,
  bannerFile,
  setBannerFile,
  restaurantId,
  setRestaurantId,
}: RestaurantMediaProps) {
  const [alert, setAlert] = useState<{
    message: string | null;
    type?: "error" | "success" | "warning";
  }>({ message: null });

  async function handleSubmit() {
    try {
      if (logoFile) {
        const formData = new FormData();
        if (!restaurantId) {
          setAlert({ message: "Restaurante não identificado", type: "error" });
          return;
        }

        formData.append("file", logoFile);
        formData.append("restaurantId", String(restaurantId));

        const res = await fetch("/api/restaurant/profile/logo", {
          method: "POST",
          body: formData,
        });

        let data: { error?: string } = {};
        try {
          data = await res.json();
        } catch {}

        if (!res.ok) {
          setAlert({
            message: data.error || "Erro ao enviar logo",
            type: "error",
          });
          return;
        }
      }

      if (bannerFile) {
        const formData = new FormData();
        formData.append("file", bannerFile);
        formData.append("restaurantId", String(restaurantId));

        const res = await fetch("/api/restaurant/profile/banner", {
          method: "POST",
          body: formData,
        });

        let data: { error?: string } = {};
        try {
          data = await res.json();
        } catch {}

        if (!res.ok) {
          setAlert({
            message: data.error || "Erro ao enviar banner",
            type: "error",
          });
          return;
        }
      }

      setLogoFile(null);
      setBannerFile(null);

      setAlert({
        message: "Imagens salvas com sucesso!",
        type: "success",
      });

      if (mode === "onboarding" && onNext) onNext();
    } catch {
      setAlert({
        message: "Erro inesperado ao enviar imagens",
        type: "error",
      });
    }
  }

  const alertRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (alert.message && alertRef.current) {
      alertRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [alert.message]);

  const [restaurant, setRestaurant] = useState<{
    name: string;
    description: string;
    city: string;
    state: string;
  } | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    async function loadRestaurant() {
      try {
        const res = await fetch(
          `/api/restaurant/me?restaurantId=${restaurantId}`,
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        setRestaurant(data);
      } catch {
        setAlert({
          message: "Erro ao carregar dados do restaurante",
          type: "error",
        });
      }
    }

    loadRestaurant();
  }, [restaurantId]);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-10">
        {/* Cabeçalho */}

        <div className="text-center flex flex-col gap-1">
          <h1 className="text-[30px] text-gray-800">
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

        {/* BOTÃO VOLTAR */}
        {mode === "onboarding" && (
          <div className="w-full max-w-2xl">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              ← Voltar
            </button>
          </div>
        )}

        <div className="relative w-full max-w-2xl bg-white rounded-sm shadow-sm overflow-hidden">
          <form className="flex flex-col gap-20">
            <div className="relative w-full">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={logoInputRef}
                onChange={handleLogoChange}
              />

              <input
                type="file"
                accept="image/*"
                hidden
                ref={bannerInputRef}
                onChange={handleBannerChange}
              />

              {/* BANNER */}

              <div
                onClick={() => bannerInputRef.current?.click()}
                className="relative w-full h-32 bg-gray-200 rounded-t-sm overflow-hidden group cursor-pointer"
              >
                <Image
                  src={bannerPreview || "/no_banner2.png"}
                  alt="Banner do restaurante"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                  priority
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-70 transition duration-500" />
              </div>

              {/* LOGO */}
              <div
                onClick={() => logoInputRef.current?.click()}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 group cursor-pointer"
              >
                <div className="relative w-26 h-26 rounded-full border-2 border-gray-300 shadow-md overflow-hidden">
                  <Image
                    src={logoPreview || "/no_logo4.png"}
                    alt="Logo do restaurante"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    priority
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-70 transition duration-500" />
                </div>
              </div>
            </div>

            <div className="text-center mb-10 flex flex-col gap-5 px-10 items-center text-center">
              <h2 className="text-md font-semibold text-gray-800 break-all w-[240px]">
                {restaurant?.name || "Nome do restaurante"}
              </h2>

              <p className="text-sm text-gray-500">
                {restaurant
                  ? `${restaurant.city} - ${restaurant.state}`
                  : "Cidade - UF"}
              </p>
            </div>
          </form>

          {mode === "onboarding" && (
            <div className="mt-auto">
              <button
                onClick={handleSubmit}
                type="button"
                className="w-full h-14 bg-(--color-primary) text-white font-semibold text-[16px] hover:bg-(--color-secondary) transition-all duration-200 cursor-pointer"
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
