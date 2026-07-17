"use client";

import { Check, ArrowRight, Store } from "lucide-react";
import { useRouter } from "next/navigation";

import Image from "next/image";

interface RestaurantSuccessProps {
  logoPreview?: string | null;
}

export default function RestaurantSuccess({
  logoPreview,
}: RestaurantSuccessProps) {
  const router = useRouter();

  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="relative w-full max-w-[560px] pt-15">
        <div className="bg-white border border-[#E4EAF2] shadow-[0_12px_40px_rgba(27,50,95,0.08)] rounded-[34px] p-10 md:p-12">
          {/* Ícone */}
          <div className="flex justify-center mb-8">
            {logoPreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-[#D6E2F1] shadow-sm">
                <Image
                  src={logoPreview}
                  alt="Logo do restaurante"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-(--color-badge-1) border border-[#D6E2F1] flex items-center justify-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-(--color-primary) flex items-center justify-center shadow-md">
                  <Check size={32} strokeWidth={3} className="text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Texto */}
          <div className="text-center">
            <h1 className="text-[34px] leading-[1.1] font-bold text-(--color-dark)">
              Tudo pronto!
            </h1>

            <p className="mt-4 text-[16px] leading-7 text-[#667085] max-w-[430px] mx-auto">
              Seu restaurante foi criado com sucesso. Agora você já pode acessar
              o painel e continuar a configuração do ambiente, funcionários,
              cardápio e layout.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-10 flex flex-col gap-4">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFBFD] border border-[#EEF2F6]">
              <div className="min-w-10 w-10 h-10 rounded-xl bg-(--color-badge-1) flex items-center justify-center">
                <Check
                  size={18}
                  className="text-(--color-primary)"
                  strokeWidth={3}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-dark)">
                  Restaurante criado
                </p>

                <p className="text-sm text-[#667085] mt-1 leading-6">
                  As informações foram salvas corretamente no sistema.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAFBFD] border border-[#EEF2F6]">
              <div className="min-w-10 w-10 h-10 rounded-xl bg-(--color-badge-1) flex items-center justify-center">
                <ArrowRight
                  size={18}
                  className="text-(--color-primary)"
                  strokeWidth={2.8}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-(--color-dark)">
                  Próximo passo
                </p>

                <p className="text-sm text-[#667085] mt-1 leading-6">
                  Configure e personalize seu restaurante para que ele se torne
                  operacional.
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                router.push("/admin/my-restaurants");
                router.refresh();
              }}
              className="flex-1 py-3 px-6 rounded-md bg-(--color-primary) hover:bg-(--color-secondary) transition-all duration-200 text-white font-semibold text-[15px] cursor-pointer shadow-[0_10px_25px_rgba(27,50,95,0.18)]"
            >
              Ir para o painel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
