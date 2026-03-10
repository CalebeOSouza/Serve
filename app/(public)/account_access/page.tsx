"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { RegisterForm } from "../../../components/register_form/index";
import { LoginForm } from "../../../components/login_form/index";


export default function Cadastro() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const router = useRouter();

  const [activeContainer, setActiveContainer] = useState(mode === "login");

  useEffect(() => {
    setActiveContainer(mode === "login");
  }, [mode]);

  return (
    <section className="flex items-center justify-center min-h-screen px-3.5 py-30 pt-42">
      {/* Container  */}
      <div
        className={`relative w-220 h-[calc(140vh-100px)] md:h-145 bg-white rounded-xl shadow-2xl overflow-hidden`} //h-[calc(140vh-180px)]
      >
        {/* Formulário de cadastro */}

        <RegisterForm activeContainer={activeContainer} />

        {/* Formulário de login */}

        <LoginForm activeContainer={activeContainer} />

        {/* Div Before  */}

        <div
          className={`absolute w-full h-full before:content-[''] before:absolute before:w-full before:h-[300%] before:left-0 before:top-[-270%] md:before:w-[300%] md:before:h-full md:before:top-0 before:bg-(--color-primary) before:z-10 before:rounded-[50px] md:before:rounded-[30px] before:transition-all before:duration-1000 before:ease-in-out ${
            activeContainer
              ? "before:top-[70%] before:left-0 md:before:left-[50%]"
              : "md:before:left-[-250%]"
          }`}
        >
          {/* Toggle panel Left - Esquerda  */}

         <div className={`left absolute w-full h-[30%] top-0 md:top-0 md:w-1/2 md:h-full flex flex-col items-center justify-center text-white z-20 transition-all duration-600 ease-in-out delay-200 gap-5 text-center ${activeContainer ? "top-[-30%] md:top-0 md:left-[-50%]" : "top-0 md:left-0"}`}>

            {/* */}
            <h1 className="text-2xl md:text-3xl font-bold">Olá, Bem vindo(a)!</h1>
            <p className="mb-2">Já tem uma conta?</p>
            <button
              className="bg-transparent w-40 h-11.5 border-2 border-white shadow-none rounded-lg cursor-pointer text-[15px] text-white font-semibold transition-all ease-in-out duration-200 hover:bg-white hover:text-(--color-primary)"
              onClick={() => {
                setActiveContainer(true);
                router.push("?mode=login");
              }}
            >
              {" "}
              Entrar
            </button>
          </div>

          {/* Toggle panel Right - Direita */}
          <div
            className={`right absolute w-full h-[30%] right-0 md:w-1/2 md:h-full flex flex-col items-center justify-center text-white z-20 transition-all ease-in-out duration-700 delay-200 gap-5 text-center ${activeContainer ? "bottom-0 md:bottom-auto md:right-0" : "bottom-[-30%] md:bottom-auto md:-right-1/2"}`}>
            {/* */}
            <h1 className="text-2xl md:text-3xl font-bold">Olá, Bem vindo(a)!</h1>
            <p className="mb-2">Ainda não tem uma conta?</p>
            <button
              className="bg-transparent w-40 h-11.5 border-2 border-white shadow-none rounded-lg cursor-pointer text-[15px] text-white font-semibold transition-all ease-in-out duration-200 hover:bg-white hover:text-(--color-primary)"
              onClick={() => {
                setActiveContainer(false);
                router.push("?mode=cadastro");
              }}
            >
              {" "}
              Cadastre-se
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
