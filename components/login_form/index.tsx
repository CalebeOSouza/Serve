"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type Props = {
  activeContainer: boolean;
};

export function LoginForm({ activeContainer }: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      setErrorMessage("Preencha email e senha.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Digite um email válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setErrorMessage("Email ou senha inválidos.");
      return;
    } else {
      router.push("/admin/my-restaurants");
    }
  }

  return (
    // Form box

    <div
      className={`absolute w-full h-[70%] bottom-0 md:w-1/2 md:h-full bg-white flex items-center text-center text-[#333] p-10 transition-all duration-0 delay-500 ${
        activeContainer
          ? "opacity-100 z-10 md:right-1/2 md:bottom-0 right-0 bottom-[30%]"
          : "opacity-0 z-0 right-0"
      }`}
    >
      <form className="w-full" onSubmit={handleSubmit} autoComplete="on">
        <h1 className="text-[32px] font-bold -mt-2.5 mb-4">Login</h1>

        <AnimatedAlert
          message={errorMessage}
          type="error"
          onClose={() => setErrorMessage(null)}
        />

        <div className="relative my-7.5">
          {/* <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 bg-[#eee] rounded-lg border-transparent outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-2 focus:ring-black/10 transition"
            type="text"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          /> */}
          <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 rounded-md border border-gray-300 outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-1 focus:ring-black/10 transition autofill:bg-white
    autofill:text-black
    autofill:shadow-[inset_0_0_0px_1000px_white]"
            type="text"
            name="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <i className="bi bi-envelope-fill absolute right-5 top-1/2 -translate-y-1/2 text-[#888] text-[20px]"></i>
        </div>
        <div className="relative my-7.5">
          {/* border border-gray-300 py-2 px-4 rounded-md outline-none */}
          <input
            className="w-full pt-3.25 pr-12.5 pb-3.25 pl-5 rounded-md border border-gray-300 outline-none text-[16px] font-normal placeholder-[#888] font-small focus:ring-1 focus:ring-black/10 transition autofill:bg-white
    autofill:text-black
    autofill:shadow-[inset_0_0_0px_1000px_white]"
            type="password"
            name="password"
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
          />
          <i className="bi bi-lock-fill absolute right-5 top-1/2 -translate-y-1/2 text-[#888] text-[20px]"></i>
        </div>

        <div className="-mt-3.75 mr-0 ml-0 mb-3.75">
          <Link href="" className="text-[14.5px] text-[#333] no-underline">
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-(--color-primary) rounded-lg shadow-2xl border-transparent cursor-pointer text-[15px] text-white font-semibold transition-all ease-in-out duration-200 hover:bg-(--color-secondary)"
        >
          Entrar
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
