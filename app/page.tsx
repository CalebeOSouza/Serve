import Link from "next/link";

export default function Home() {
  return (
    <section className="min-h-screen w-full flex flex-col">
      <div className="h-18" />
      <div className="w-full bg-[#F3F4F6]">
        {/* Bloco texto */}

        <div className="mx-auto max-w-6xl w-full items-center gap-12 grid grid-cols-1 md:grid-cols-2 text-(--color-primary) pt-10 px-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-(--font-inter) font-bold mb-6">
              Tudo que seu restaurante precisa, em um só sistema.
            </h1>

            <p className="font-(--font-inter) text-base md:text-lg lg:text-xl mb-8 max-w-xl">
              Um sistema completo para organizar pedidos, operações e
              atendimento em um só lugar. Feito para restaurantes que querem
              mais controle, agilidade e crescimento.
            </p>

            <div>
              <Link href="/">
                <button className="rounded-lg bg-(--color-primary) px-7 py-3 font-bold text-white hover:bg-(--color-secondary) transition cursor-pointer">
                  Comece agora — é grátis!
                </button>
              </Link>

              <p className="text-sm mt-3">
                Leva menos de 1 minuto para começar.
              </p>
            </div>
          </div>

          {/* Bloco imagem */}
          <div className="flex justify-center md:justify-end select-none">
            <img
              src="/cooking.svg"
              alt="Ilustração de cozinha e gestão de pedidos"
              className="w-full max-w-md lg:max-w-lg h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
