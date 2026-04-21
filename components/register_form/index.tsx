"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type Props = {
  activeContainer: boolean;
};

export function RegisterForm({ activeContainer }: Props) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (response.ok) {
          router.push("/user-type");
        }
      } else {
        setErrorMessage(data.error || "Erro ao cadastrar.");
      }
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
      setErrorMessage("Erro no servidor. Tente novamente.");
    }
  };

  return (
    // Form box
    <div
      className={`absolute w-full h-[70%] bottom-0 md:w-1/2 md:h-full flex items-center text-center text-[#333] p-10 transition-all duration-0 delay-500 ${
        activeContainer ? "opacity-0 z-0 right-1/2" : "opacity-100 z-10 right-0"
      }`}
    >
      <form className="w-full" onSubmit={handleSubmit} autoComplete="on">
        <h1 className="text-[32px] font-bold mt-0 md:-mt-2.5 mb-4">Cadastro</h1>

        <AnimatedAlert
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
          
        />

          {/* border border-gray-300 py-2 px-4 rounded-md outline-none */}
        <div className="relative my-7.5 ">
          <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 rounded-md border border-gray-300 outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-1 focus:ring-black/10 transition autofill:bg-white
    autofill:text-black
    autofill:shadow-[inset_0_0_0px_1000px_white]"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome de usuário"
          />
          <i className="bi bi-person-fill absolute right-5 top-1/2 -translate-y-1/2 text-[#888] text-[20px]"></i>
        </div>
        <div className="relative my-7.5">
          <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 rounded-md border border-gray-300 outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-1 focus:ring-black/10 transition autofill:bg-white
    autofill:text-black
    autofill:shadow-[inset_0_0_0px_1000px_white]"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="text"
            placeholder="Email"
          />
          <i className="bi bi-envelope-fill absolute right-5 top-1/2 -translate-y-1/2 text-[#888] text-[20px]"></i>
        </div>
        <div className="relative my-7.5">
          <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 rounded-md border border-gray-300 outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-1 focus:ring-black/10 transition autofill:bg-white
    autofill:text-black
    autofill:shadow-[inset_0_0_0px_1000px_white]"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Senha"
          />
          <i className="bi bi-lock-fill absolute right-5 top-1/2 -translate-y-1/2 text-[#888] text-[20px]"></i>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-(--color-primary) rounded-lg shadow-2xl border-transparent cursor-pointer text-[15px] text-white font-semibold transition-all ease-in-out duration-200 hover:bg-(--color-secondary)"
        >
          Cadastrar
        </button>

        <div className="flex items-center my-6 w-full">
          <div className="grow h-px bg-gray-300"></div>

          <span className="mx-3 text-[12px] text-gray-400 uppercase">ou</span>

          <div className="grow h-px bg-gray-300"></div>
        </div>

        <div className="">
          <Link
            href="/"
            className="
    w-full h-12
    flex items-center justify-center gap-4
    rounded-lg
    bg-[#FFFFFF]
    border border-[#DADCE0]
    text-[#3C4043] text-[15px] font-medium
    shadow-md
    hover:bg-[#F8F9FA]
    transition
  "
          >
            <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
            Continuar com o Google
          </Link>
        </div>
      </form>
    </div>
  );
}
