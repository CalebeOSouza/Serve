"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { RegisterForm } from "../../../components/register_form/index";
import { LoginForm } from "../../../components/login_form/index";
import Image from "next/image";

export default function Cadastro() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const router = useRouter();

  const [activeContainer, setActiveContainer] = useState(mode === "login");

const [imageSide, setImageSide] = useState(mode === "login");
const [imageTransition, setImageTransition] = useState(false);
const [isReady, setIsReady] = useState(false);
useEffect(() => {
  if (imageSide === activeContainer) return;

  setImageTransition(true);

  const exitTimer = setTimeout(() => {
    setImageSide(activeContainer);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setImageTransition(false);
      });
    });
  }, 500);

  return () => clearTimeout(exitTimer);
}, [activeContainer, imageSide]);
useEffect(() => {
  setIsReady(true);
}, []);
  useEffect(() => {
    setActiveContainer(mode === "login");
  }, [mode]);
if (!isReady) return null;
  return (
    <section
  className={`relative w-full min-h-screen h-screen overflow-hidden bg-white ${
    isReady ? "opacity-100" : "opacity-0"
  }`}
>
      {/* Container  */}
      <div className="relative w-full h-full min-h-screen bg-white overflow-hidden">
        {/* Formulário de cadastro */}

        <RegisterForm activeContainer={activeContainer} />

        {/* Formulário de login */}

        <LoginForm activeContainer={activeContainer} />

        {/* Div Before  */}

       
<div className="pointer-events-none absolute inset-0 h-full w-full">
  


<div
  className={`pointer-events-none absolute inset-y-0 z-10 w-full overflow-hidden transition-[left] duration-900 ease-in-out md:w-1/2 ${
    activeContainer
      ? "left-0 md:left-1/2"
      : "left-0 md:left-0"
  }`}
>
  <Image
    src="/form_image.jpg"
    alt="Imagem de fundo do acesso ao SERVE"
    fill
    priority
    unoptimized
    sizes="(max-width: 767px) 100vw, 50vw"
    className="object-cover object-center brightness-75"
  />
</div>



  <div
    className={`left pointer-events-auto absolute top-0 z-20 flex h-[30%] w-full flex-col items-center justify-center gap-5 text-center text-white transition-all duration-900 ease-in-out delay-200 md:h-full md:w-1/2 ${
      activeContainer
        ? "top-[-30%] md:left-[-50%] md:top-0"
        : "top-0 md:left-0"
    }`}
  >
    <h1 className="text-2xl font-bold md:text-3xl">
      Olá, Bem vindo(a)!
    </h1>

    <p className="mb-2">Já tem uma conta?</p>

    <button className="h-11.5 w-40 cursor-pointer rounded-lg border-2 border-white bg-white text-[15px] font-semibold text-(--color-primary) shadow-none transition-all ease-in-out hover:bg-transparent hover:text-white"
      onClick={() => {
        setActiveContainer(true);
        router.push("?mode=login");
      }}
    >
      Entrar
    </button>
  </div>

  <div
    className={`right pointer-events-auto absolute right-0 z-20 flex h-[30%] w-full flex-col items-center justify-center gap-5 text-center text-white transition-all duration-700 ease-in-out delay-200 md:h-full md:w-1/2 ${
      activeContainer
        ? "bottom-0 md:bottom-auto md:right-0"
        : "bottom-[-30%] md:bottom-auto md:right-[-50%]"
    }`}
  >
    <h1 className="text-2xl font-bold md:text-3xl">
      Olá, Bem vindo(a)!
    </h1>

    <p className="mb-2">Ainda não tem uma conta?</p>

    <button
      type="button"
      className="h-11.5 w-40 cursor-pointer rounded-lg border-2 border-white bg-white text-[15px] font-semibold text-(--color-primary) shadow-none transition-all ease-in-out hover:bg-transparent hover:text-white"
      onClick={() => {
        setActiveContainer(false);
        router.push("?mode=cadastro");
      }}
    >
      Cadastre-se
    </button>
  </div>
</div>

      </div>
    </section>
  );
}
