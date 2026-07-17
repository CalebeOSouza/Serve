"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

const diasComAcento: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

type Day =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado"
  | "domingo";

type Hour = {
  enabled: boolean;
  open: string;
  close: string;
};

type HoursForm = Record<Day, Hour>;

const diaBanco = "terca" as Day;

const diaExibicao = diasComAcento[diaBanco] ?? diaBanco;

console.log(diaExibicao);

interface RestaurantHoursProps {
  restaurantId: number | null;
  mode: "onboarding" | "settings";
  logoPreview?: string | null;
  bannerPreview?: string | null;
  onNext?: () => void;
  onBack?: () => void;
}

export default function RestaurantHours({
  restaurantId,
  mode,
  onNext,
  logoPreview: logoFromProps,
  bannerPreview: bannerFromProps,
  onBack,
}: RestaurantHoursProps) {
  const [hours, setHours] = useState<HoursForm>({
    segunda: { enabled: true, open: "08:00", close: "18:00" },
    terca: { enabled: true, open: "08:00", close: "18:00" },
    quarta: { enabled: true, open: "08:00", close: "18:00" },
    quinta: { enabled: true, open: "08:00", close: "18:00" },
    sexta: { enabled: true, open: "08:00", close: "18:00" },
    sabado: { enabled: false, open: "", close: "" },
    domingo: { enabled: false, open: "", close: "" },
  });

  const [alert, setAlert] = useState<{
    message: string | null;
    type?: "success" | "error";
  }>({ message: null });

  function toggleDay(day: Day) {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  }

  function updateHour(day: Day, field: "open" | "close", value: string) {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  function isHourValid(open: string, close: string) {
    if (!open || !close) return true; // deixa vazio passar
    return open < close;
  }

  async function handleSave() {
    if (!restaurantId) {
      setAlert({
        message: "Restaurante não identificado.",
        type: "error",
      });
      return;
    }

    for (const [day, data] of Object.entries(hours)) {
      if (data.enabled && !isHourValid(data.open, data.close)) {
        setAlert({
          message: `Horário inválido em ${diasComAcento[day]}`,
          type: "error",
        });
        return;
      }
    }

    const res = await fetch("/api/restaurant/profile/hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        hours,
      }),
    });

    if (!res.ok) {
      setAlert({
        message: "Erro ao salvar horários.",
        type: "error",
      });
      return;
    }

    setAlert({
      message: "Horários salvos com sucesso!",
      type: "success",
    });
  }

  const [bannerPreview, setBannerPreview] = useState<string | null>(
    bannerFromProps ?? null,
  );

  useEffect(() => {
    if (bannerFromProps) setBannerPreview(bannerFromProps);
  }, [logoFromProps, bannerFromProps]);

  useEffect(() => {
    if (!restaurantId) return;

    fetch(`/api/restaurant/me?restaurantId=${restaurantId}`).then(
      async (res) => {
        const data = await res.json();
        if (!res.ok) return;

        setBannerPreview(data.media?.banner_url ?? null);
      },
    );
  }, [restaurantId]);

  useEffect(() => {
    if (!restaurantId) return;

    fetch(`/api/restaurant/profile/hours?restaurantId=${restaurantId}`).then(
      async (res) => {
        if (!res.ok) return;

        const data = await res.json();

        if (Object.keys(data).length === 0) return;

        setHours((prev) => ({
          ...prev,
          ...data,
        }));
      },
    );
  }, [restaurantId]);

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-10">
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

        <div className="relative w-full max-w-xl bg-white rounded-sm shadow-sm overflow-hidden">
          <AnimatedAlert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ message: null })}
          />

          {bannerPreview && (
            <div className="relative w-full h-25">
              <Image
                src={bannerPreview}
                alt="Banner do restaurante"
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-8 pb-13 flex flex-col gap-6">
            <div className="text-start flex flex-col gap-1 mb-6">
              <h1 className="text-[17px] font-semibold text-gray-800">
                Horários de funcionamento
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Defina quando o seu restaurante estará acessível ao público!
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {Object.entries(hours).map(([day, data]) => (
                <div
                  key={day}
                  className="flex items-center gap-4 border-b border-gray-300 pb-3"
                >
                  <input
                    type="checkbox"
                    checked={data.enabled}
                    onChange={() => toggleDay(day as Day)}
                    className="accent-[var(--color-primary)]"
                  />

                  <span className="w-28 text-sm">
                    {diasComAcento[day as Day]}
                  </span>

                  <input
                    type="time"
                    disabled={!data.enabled}
                    value={data.open}
                    onChange={(e) =>
                      updateHour(day as Day, "open", e.target.value)
                    }
                    className="px-2 py-1 rounded bg-gray-100 disabled:opacity-50"
                  />

                  <span>até</span>

                  <input
                    type="time"
                    disabled={!data.enabled}
                    value={data.close}
                    onChange={(e) =>
                      updateHour(day as Day, "close", e.target.value)
                    }
                    className="px-2 py-1 rounded bg-gray-100 disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <button
              onClick={async () => {
                await handleSave();

                const channel = new BroadcastChannel("restaurants");
                channel.postMessage("restaurant-created");
                channel.close();

                if (mode === "onboarding" && onNext) onNext();
              }}
              type="button"
              className="w-full h-14 bg-(--color-primary) text-white font-semibold text-[16px] hover:bg-(--color-secondary) transition-all duration-200 cursor-pointer"
            >
              {mode === "onboarding" ? "Finalizar" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
