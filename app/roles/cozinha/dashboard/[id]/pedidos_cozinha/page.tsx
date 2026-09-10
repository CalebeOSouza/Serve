"use client";

import { ChefHat, Clock3 } from "lucide-react";
import { useState } from "react";

export default function Pedidos_Cozinha() {
  const [activeTab, setActiveTab] = useState<
    "recebidos" | "preparo" | "prontos"
  >("recebidos");
  return (
    <div className="w-full mx-auto flex flex-col">
      <div className="px-5 pb-5 pt-10 md:px-10 max-lg:landscape:px-3">
        <header className="flex justify-between text-start flex-col gap-6 lg:flex-row lg:gap-0">
          <div className="flex flex-col">
            <h1 className="font-semibold text-[27px] text-[#19274b] flex gap-2 items-center">
              <ChefHat className="w-7 h-7" />
              Cozinha
            </h1>

            <p className="text-[16px] text-[#19274b]">
              Selecione o cargo para criar um funcionário
            </p>
          </div>
        </header>
      </div>

      <span className="relative w-full h-px bg-gray-200" />
  
      <div className="relative w-full">
        <div className="relative flex w-full border-b border-gray-200">
        
          <button
            onClick={() => setActiveTab("recebidos")}
            className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "recebidos"
                ? "text-[#1b325f]"
                : "text-gray-500 hover:text-[#1b325f]"
            }`}
          >
            <span>Recebidos</span>

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium transition-colors ${
                activeTab === "recebidos"
                  ? "bg-[#1b325f] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              3
            </span>

            {activeTab === "recebidos" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#1b325f]" />
            )}
          </button>

          
          <button
            onClick={() => setActiveTab("preparo")}
            className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "preparo"
                ? "text-[#1b325f]"
                : "text-gray-500 hover:text-[#1b325f]"
            }`}
          >
            <span>Em preparo</span>

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium transition-colors ${
                activeTab === "preparo"
                  ? "bg-[#1b325f] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              0
            </span>

            {activeTab === "preparo" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#1b325f]" />
            )}
          </button>

          
          <button
            onClick={() => setActiveTab("prontos")}
            className={`relative flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "prontos"
                ? "text-[#1b325f]"
                : "text-gray-500 hover:text-[#1b325f]"
            }`}
          >
            <span>Prontos</span>

            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-medium transition-colors ${
                activeTab === "prontos"
                  ? "bg-[#1b325f] text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              0
            </span>

            {activeTab === "prontos" && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-full bg-[#1b325f]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
