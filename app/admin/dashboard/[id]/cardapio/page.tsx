"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Plus } from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import EmployeeCard, {
  Employee,
} from "@/components/dashboard/dashboard_employees/employee_card";
import { useRef } from "react";

export default function RestaurantCardapio() {
  return (
    <div className={`w-full mx-auto flex flex-col p-8 px-16`}>
      <div className="flex justify-between text-start my-5 flex-col gap-6 lg:flex-row lg:gap-0">
        <div className="flex flex-col">
          <h1 className="font-semibold text-[26px] text-[#19274b]">
            Criar cardápio!
          </h1>
          <p className=" text-[15px] text-[#19274b]">
            Gerencie o cardápio do seu estabelecimento e destaque o que o seu restaurante tem de melhor a oferecer.
          </p>
        </div>
        <div className="flex items-center">
          <button className="flex items-center gap-2 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer">
            <Plus className="w-5 h-5 text-white" />
            Nova categoria
          </button>
        </div>
      </div>
      <span className="mt-4 border-b border-gray-200"></span>
    </div>
  );
}
