"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MousePointer2,
  Armchair,
  Clock3,
  HandPlatter,
  ChefHat,
  CookingPot,
  Soup,
  Pizza,
} from "lucide-react";

import { useState } from "react";
type KitchenOrder = {
  id: number;
  time: string;
  status: "recebido" | "em_preparo" | "pronto";
  table: number;
  waiter: string;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    transform?: string;
  };
  items: {
    quantity: number;
    name: string;
    observation?: string;
  }[];
};

type KitchenElement = {
  id: number;
  icon: React.ElementType;
  position: {
    top: string;
    left: string;
  };
};

const kitchenElements: KitchenElement[] = [
  {
    id: 1,
    icon: ChefHat,
    position: {
      top: "10.84%",
      left: "5.84%",
    },
  },
  {
    id: 2,
    icon: CookingPot,
    position: {
      top: "17.31%",
      left: "87.35%",
    },
  },
  {
    id: 3,
    icon: Soup,
    position: {
      top: "67.19%",
      left: "93.63%",
    },
  },
  {
    id: 4,
    icon: Pizza,
    position: {
      top: "64.37%",
      left: "2.64%",
    },
  },
];

const kitchenOrders: KitchenOrder[] = [
  {
    id: 27,
    time: "19:42",
    status: "recebido",
    table: 8,
    waiter: "Lucas",
    position: {
      top: "34.02%",
      left: "0.29%",
    },
    items: [
      {
        quantity: 2,
        name: "Hambúrguer Artesanal",
        observation: "Sem cebola",
      },
      {
        quantity: 1,
        name: "Batata Frita",
      },
    ],
  },

  {
    id: 31,
    time: "19:45",
    status: "em_preparo",
    table: 14,
    waiter: "Marina",
    position: {
      top: "35.29%",
      left: "79.64%",
    },
    items: [
      {
        quantity: 1,
        name: "Risoto de Camarão",
      },
      {
        quantity: 2,
        name: "Suco de Laranja",
      },
    ],
  },

  {
    id: 22,
    time: "19:28",
    status: "pronto",
    table: 3,
    waiter: "Rafael",
    position: {
      top: "68.17%",
      left: "11.92%",
    },
    items: [
      {
        quantity: 1,
        name: "Filé à Parmegiana",
      },
      {
        quantity: 1,
        name: "Refrigerante",
      },
    ],
  },

  {
    id: 35,
    time: "19:49",
    status: "recebido",
    table: 21,
    waiter: "Gabriel",
    position: {
      top: "68.10%",
      left: "66.08%",
    },
    items: [
      {
        quantity: 2,
        name: "Pizza Calabresa",
      },
      {
        quantity: 1,
        name: "Água Mineral",
      },
    ],
  },

  {
    id: 29,
    time: "19:44",
    status: "em_preparo",
    table: 11,
    waiter: "Beatriz",
    position: {
      top: "0.87%",
      left: "17.29%",
    },
    items: [
      {
        quantity: 1,
        name: "Massa Carbonara",
      },
      {
        quantity: 1,
        name: "Suco de Morango",
      },
    ],
  },

  {
    id: 18,
    time: "19:16",
    status: "pronto",
    table: 6,
    waiter: "André",
    position: {
      left: "62.00%",
      top: "0.84%",
    },
    items: [
      {
        quantity: 2,
        name: "X-Salada",
      },
      {
        quantity: 2,
        name: "Batata Frita",
      },
    ],
  },
];

export default function Home() {
  return (
    <section className="min-h-screen w-full flex flex-col">
      <div className="h-16" />

      {/* <div className="w-full">
        <div className="mx-auto max-w-[1400px] w-full px-8 pt-15 pb-24 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center text-(--color-primary)">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-(--font-inter) font-bold mb-6 leading-tight">
              Tudo que seu restaurante precisa, em um{" "}
              <span className="text-[#2E518A]">único sistema.</span>
            </h1>

            <p className="font-(--font-inter) text-base md:text-lg leading-relaxed mb-8 max-w-[560px]">
              Um sistema completo para organizar pedidos, operações e
              atendimento em um só lugar. Feito para estabelecimentos
              gastronômicos que querem mais controle, agilidade e crescimento.
            </p>

            <div>
              <Link href="/account_access?mode=cadastro">
                <button className="rounded-lg bg-(--color-primary) px-17 py-3 font-bold text-white hover:bg-[#1d3d7d] transition cursor-pointer">
                  Comece agora!
                </button>
              </Link>

              <p className="text-sm mt-3 font-(--font-inter)">
                Leva menos de 1 minuto para começar.
              </p>
            </div>
          </div>

         
<div className="flex justify-center md:justify-end select-none">
  <Image
    src="/home_image_5.png"
    alt="Ilustração de restaurante"
    width={1200}
    height={1200}
    unoptimized
    className="w-full max-w-[680px] h-auto object-contain"
    priority
  />
</div>

        </div>
      </div> */}

      <div className="relative w-full min-h-[600px] md:min-h-[750px] overflow-hidden">
        <Image
          src="/home_image_10.jpg"
          alt="Restaurante"
          unoptimized
          fill
          priority
          sizes="100vw"
          quality={100}
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1D38]/70 via-[#0B1D38]/60 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[600px] md:min-h-[680px] max-w-[1400px] items-center px-6 py-16 md:px-8">
          <div className="flex w-full max-w-[650px] flex-col items-center text-center text-white md:items-start md:text-left">
            <h1 className="mb-6 font-(--font-inter) text-3xl leading-tight md:text-4xl lg:text-5xl">
              Tudo que seu restaurante precisa, em um{" "}
              <span className="font-bold">único sistema.</span>
            </h1>

            <p className="mb-8 max-w-[560px] font-(--font-inter) text-base leading-relaxed md:text-lg">
              Um sistema completo para organizar pedidos, operações e
              atendimento em um só lugar. Feito para estabelecimentos
              gastronômicos que querem mais controle, agilidade e crescimento.
            </p>

            <div>
              <Link href="/account_access?mode=cadastro">
                <button className="h-11.5 w-40 cursor-pointer rounded-lg border-2 border-white bg-white text-[15px] font-semibold text-(--color-primary) shadow-none transition-all ease-in-out hover:bg-transparent hover:text-white">
                  Comece agora!
                </button>
              </Link>

              <p className="mt-5 font-(--font-inter) text-sm">
                Leva menos de 1 minuto para começar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#f4f8fd] py-28">
        <div className="relative mx-auto max-w-[1400px] w-full min-h-[520px] px-8 overflow-hidden">
          <div
            className="absolute w-[90px] h-[90px] rounded-full border border-[#6388b2] bg-[#EBF5FF]"
            style={{ top: "8%", left: "15%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-1/2 right-1/2 flex gap-1 items-center justify-center">
                <div className="w-fit max-w-6 h-4.5 rounded-sm flex items-center justify-center px-1.5 text-[11px] text-white bg-[#274778]">
                  <p className="text-[11px] leading-none text-center">27</p>
                </div>

                <div className="flex gap-0.5 items-center justify-center">
                  <Armchair className="w-3.5 h-3.5" />
                  <p className="text-[11px] leading-none mt-[1.7px] text-center">
                    4
                  </p>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Livre</p>
              </div>
            </div>
          </div>

          <div
            className="absolute w-[90px] h-[90px] rounded-md border border-[#ffbb7f] bg-[#FFF8ED]"
            style={{ top: "42%", left: "11%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 left-1 w-fit max-w-6 px-1.5 h-4.5 rounded-sm flex items-center justify-center text-[11px] text-white bg-[#fc8417]">
                <p className="text-[11px] leading-none text-center">16</p>
              </div>

              <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
                <Armchair className="w-3.5 h-3.5" />
                <p className="text-[11px] leading-none text-center">2</p>
              </div>

              <div className="absolute bottom-0 left-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Reservada</p>

                <div className="flex items-center text-center gap-1 text-[11px]">
                  <Clock3 className="w-2.5 h-2.5" />
                  <span>22:40</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute w-[90px] h-[90px] rounded-full border border-[#6388b2] bg-[#EBF5FF]"
            style={{ top: "76%", left: "15%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-1/2 right-1/2 flex gap-1 items-center justify-center">
                <div className="w-fit max-w-6 h-4.5 rounded-sm flex items-center justify-center px-1.5 text-[11px] text-white bg-[#274778]">
                  <p className="text-[11px] leading-none text-center">21</p>
                </div>

                <div className="flex gap-0.5 items-center justify-center">
                  <Armchair className="w-3.5 h-3.5" />
                  <p className="text-[11px] leading-none mt-[1.7px] text-center">
                    4
                  </p>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Livre</p>
              </div>
            </div>
          </div>

          <div
            className="absolute w-[90px] h-[90px] rounded-md border border-red-400 bg-red-200"
            style={{ top: "11%", right: "15%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 left-1 w-fit max-w-6 px-1.5 h-4.5 rounded-sm flex items-center justify-center text-[11px] text-white bg-[#c93237]">
                <p className="text-[11px] leading-none text-center">13</p>
              </div>

              <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
                <Armchair className="w-3.5 h-3.5" />
                <p className="text-[11px] leading-none text-center">2</p>
              </div>

              <div className="absolute bottom-0 left-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Ocupada</p>
              </div>
            </div>
          </div>

          <div
            className="absolute w-[90px] h-[90px] rounded-full border border-[#6388b2] bg-[#EBF5FF]"
            style={{ top: "44%", right: "11%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-3 left-1/2 right-1/2 flex gap-1 items-center justify-center">
                <div className="w-fit max-w-6 h-4.5 rounded-sm flex items-center justify-center px-1.5 text-[11px] text-white bg-[#274778]">
                  <p className="text-[11px] leading-none text-center">27</p>
                </div>

                <div className="flex gap-0.5 items-center justify-center">
                  <Armchair className="w-3.5 h-3.5" />
                  <p className="text-[11px] leading-none mt-[1.7px] text-center">
                    4
                  </p>
                </div>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Livre</p>
              </div>
            </div>
          </div>

          <div
            className="absolute w-[90px] h-[90px] rounded-md border border-[#6D7387] bg-gray-110"
            style={{ top: "76%", right: "15%" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1 left-1 w-fit max-w-6 px-1.5 h-4.5 rounded-sm flex items-center justify-center text-[11px] text-white bg-[#374151]">
                <p className="text-[11px] leading-none text-center">8</p>
              </div>

              <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
                <Armchair className="w-3.5 h-3.5" />
                <p className="text-[11px] leading-none text-center">4</p>
              </div>

              <div className="absolute bottom-0 left-1 flex flex-col justify-center">
                <p className="text-[11px] mt-0.5">Indisponível</p>
              </div>
            </div>
          </div>

          <div className="relative z-11 min-h-[520px] flex items-center justify-center">
            <div className="w-full max-w-[650px] text-center text-(--color-primary)">
              <span className="text-sm font-bold tracking-[0.2em] text-[#2E518A] mb-3 block">
                SALÃO
              </span>

              <h2 className="text-2xl md:text-4xl font-(--font-monasans) font-bold mb-6 leading-tight">
                Seu restaurante, do{" "}
                <span className="text-[#2E518A]">seu jeito.</span>
              </h2>

              <p className="font-(--font-inter) text-base md:text-lg leading-relaxed">
                Crie o espaço do seu restaurante com liberdade. Organize mesas,
                formatos e posições de forma simples e visual, deixando o layout
                sempre alinhado à realidade do seu salão.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-28">
        <div className="mx-auto max-w-[1400px] w-full px-8 text-(--color-primary) ">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-sm font-bold tracking-[0.2em] text-[#2E518A] mb-3">
              GARÇOM
            </span>

            <h2 className="text-2xl md:text-4xl font-(--font-monasans) font-bold mb-6 leading-tight">
              Pedidos de forma{" "}
              <span className="text-[#2E518A]">rápida e organizada.</span>
            </h2>

            <p className="font-(--font-inter) text-base md:text-lg leading-relaxed max-w-[700px]">
              O garçom encontra a mesa, adiciona os produtos e envia o pedido
              diretamente para a cozinha. Tudo de forma simples e sem
              complicação.
            </p>
          </div>

          <div className="w-full flex justify-center select-none">
            <div className="relative isolate w-full max-w-[900px]">
              <div
                aria-hidden="true"
                className="absolute z-[-1] top-1/2 left-1/2 w-[calc(100%+100px)] h-[72%] -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] rounded-[48%_52%_44%_56%/58%_42%_58%_42%] bg-[#dce9fb]"
              />

              <Image
                src="/garcom_example_3.png"
                alt="Tela do garçom"
                width={1400}
                height={1100}
                unoptimized
                className="relative z-10 w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-[#f4f8fd] pt-20 pb-10">
        <div className="relative mx-auto max-w-[1400px] w-full min-h-[820px] px-8 overflow-hidden">
          {kitchenElements.map((element) => {
            const Icon = element.icon;

            return (
              <div
                key={element.id}
                className="absolute w-20 h-20 flex items-center justify-center z-[5]"
                style={element.position}
              >
                <Icon size={58} strokeWidth={1.7} className="text-[#6D9BD2]" />
              </div>
            );
          })}

          {kitchenOrders.map((order) => {
            const statusConfig = {
              recebido: {
                label: "Recebido",
                header: "bg-[#616161]",
                badge: "bg-[#7f7f7f]",
              },
              em_preparo: {
                label: "Em preparo",
                header: "bg-[#EF8E2E]",
                badge: "bg-[#FDBE75]",
              },
              pronto: {
                label: "Concluído",
                header: "bg-(--color-primary)",
                badge: "bg-[#2d4583]",
              },
            };

            const status = statusConfig[order.status];

            return (
              <div
                key={order.id}
                className="absolute w-[280px] bg-white rounded-lg shadow-sm border border-[#e4e7ed] overflow-hidden select-none"
                style={order.position}
              >
                <div
                  className={`${status.header} px-4 py-2.5 flex items-center justify-between`}
                >
                  <div>
                    <p className="font-semibold text-white text-[13px]">
                      Pedido #{order.id}
                    </p>
                    <p className="text-white text-[12px]">{order.time}</p>
                  </div>

                  <span
                    className={`${status.badge} text-white text-[12px] font-medium px-2 py-0.5 rounded-full`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="px-3 py-2.5 flex items-center justify-between">
                  <p className="font-medium text-[13px] text-[#19274b]">
                    Mesa {String(order.table).padStart(2, "0")}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <HandPlatter className="w-4 h-4 text-[#19274b]" />

                    <p className="font-medium text-[13px] text-[#19274b]">
                      {order.waiter}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-3 py-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${index > 0 ? "mt-2" : ""}`}
                    >
                      <span className="font-medium text-[13px]">
                        {item.quantity}x
                      </span>

                      <div>
                        <p className="font-semibold text-[13px] text-[#19274b]">
                          {item.name}
                        </p>

                        {item.observation && (
                          <p className="text-[12px] text-[#7d89a6]">
                            {item.observation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="relative z-10 min-h-[720px] flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-[600px] text-center text-(--color-primary)">
              <span className="text-sm font-bold tracking-[0.2em] text-[#2E518A] mb-3 block">
                COZINHA
              </span>

              <h2 className="text-2xl md:text-4xl font-(--font-monasans) font-bold mb-6 leading-tight">
                Chega de <span className="text-[#2E518A]">caos </span> na
                cozinha!
              </h2>

              <p className="font-(--font-inter) text-base md:text-lg leading-relaxed ">
                A cozinha acompanha os pedidos em tempo real, organiza a
                produção e mantém o ritmo da operação. Com o SERVE, tudo chega
                de forma clara e organizada.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full py-28">
        <div className="mx-auto max-w-[1400px] w-full px-8 text-(--color-primary)">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="text-sm font-bold tracking-[0.2em] text-[#2E518A] mb-3">
              CAIXA
            </span>

            <h2 className="text-2xl md:text-4xl lg:text-5xl font-(--font-monasans) font-bold mb-6 leading-tight">
              Controle total <span className="text-[#2E518A]">das contas.</span>
            </h2>

            <p className="font-(--font-inter) text-base md:text-lg leading-relaxed max-w-[700px]">
              O caixa gerencia as contas das mesas, finaliza pagamentos e
              acompanha o movimento do restaurante com segurança e praticidade.
            </p>
          </div>

          <div className="w-full flex justify-center select-none">
            <div className="relative isolate w-full max-w-[1000px]">
              <div
                aria-hidden="true"
                className="absolute z-[-1] top-1/2 left-1/2 w-[calc(100%+100px)] h-[72%] -translate-x-1/2 -translate-y-1/2 rotate-[-5deg] rounded-[48%_52%_44%_56%/58%_42%_58%_42%] bg-[#dce9fb]"
              />

              <Image
                src="/caixa_example_3.png"
                alt="Tela do caixa"
                width={1400}
                height={900}
                unoptimized
                className="relative z-10 w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-32 bg-[#f4f8fd]">
        <div className="mx-auto max-w-[1100px] px-8 text-center text-(--color-primary)">
          <h2 className="text-3xl md:text-5xl font-(--font-monasans) font-bold mb-6 leading-tight">
            Tudo conectado.
            <br />
            <span className="text-[#2E518A]">Tudo sob controle.</span>
          </h2>

          <p className="font-(--font-inter) text-base md:text-lg leading-relaxed max-w-[650px] mx-auto mb-8">
            Do primeiro atendimento ao fechamento da conta, o SERVE conecta as
            principais etapas da operação do seu restaurante em um só lugar.
          </p>

          <Link href="/account_access?mode=cadastro">
            <button className="rounded-lg bg-(--color-primary) px-8 py-3 font-bold text-white hover:bg-[#1d3d7d] transition cursor-pointer">
              Comece agora!
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
