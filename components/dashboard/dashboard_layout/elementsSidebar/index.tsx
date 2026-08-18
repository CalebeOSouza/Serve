"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type {
  ElementType,
  TableType,
  ElementConfig,
} from "../../../../app/admin/dashboard/[id]/layout/types";

type Props = {
  selectedType: TableType | ElementType | "parede" | "parede_interna" | "piso" | null;
  onSelect: (
    type: TableType | ElementType | "parede" | "parede_interna" | "piso",
  ) => void;
};

export default function ElementsSidebar({ selectedType, onSelect }: Props) {
  const [openSections, setOpenSections] = useState({
    mesas: true,
    estruturas: true,
  });

  const elements: {
    id: string;
    title: string;
    items: ElementConfig[];
  }[] = [
    {
      id: "mesas",
      title: "Mesas",
      items: [
        {
          type: "mesa_quadrada",
          label: "Quadrada",
          render: () => (
            <div className="h-6 w-6 border border-[#6388b2] bg-[#EBF5FF] rounded-sm"></div>
          ),
        },

        {
          type: "mesa_redonda",
          label: "Redonda",
          render: () => (
            <div className="h-6 w-6 border border-[#6388b2] bg-[#EBF5FF] rounded-full"></div>
          ),
        },

        {
          type: "mesa_retangular",
          label: "Retangular",
          render: () => (
            <div className="h-5 w-9 border border-[#6388b2] bg-[#EBF5FF] rounded-sm"></div>
          ),
        },

        {
          type: "mesa_l",
          label: "Mesa em L",
          render: () => (
            <svg width="32" height="32" viewBox="0 0 125 125">
              <path
                d="M 20,10 H 105 A 10,10 0 0 1 115,20 V 65 A 10,10 0 0 1 105,75 H 85 A 10,10 0 0 0 75,85 V 105 A 10,10 0 0 1 65,115 H 20 A 10,10 0 0 1 10,105 V 20 A 10,10 0 0 1 20,10 Z"
                fill="#EBF5FF"
                stroke="#6388b2"
                strokeWidth="4"
              />
            </svg>
          ),
        },
      ],
    },

    {
      id: "estruturas",
      title: "Paredes",
      items: [
        {
          type: "parede",
          label: "Externa",
          render: () => (
            <div className="h-1 w-8 bg-[#59595B] rounded-full"></div>
          ),
        },

        {
          type: "parede_interna",
          label: "Interna",
          render: () => (
            <div className="h-1 w-8 bg-[#a3a3a3] rounded-full"></div>
          ),
        },
      ],
    },

    {
      id: "outros",
      title: "Outros",
      items: [
        {
          type: "porta",
          label: "Porta",
          render: () => (
            <img
              src="/porta4.png"
              draggable={false}
              alt="Porta"
              width={25}
              height={25}
            />
          ),
        },

         {
          type: "piso",
          label: "Piso",
          render: () => (
            <div className="h-7 w-7 bg-[#ffffff] border border-gray-300"></div>
          ),
        },
      ],
    },
  ];

  function toggleSection(id: string) {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id as keyof typeof prev],
    }));
  }

  return (
    <div className="w-full lg:w-[300px] border-b md:border-b lg:border-r border-[#e5e7eb] p-3 flex flex-col gap-3">
      {elements.map((section) => {
        const isOpen = openSections[section.id as keyof typeof openSections];
        return (
          <div
            key={section.id}
            className="bg-white border border-[#dfe3ea] rounded-xl overflow-hidden outline-none cursor-pointer"
          >
            {/* HEADER */}
            <button
              onClick={() => toggleSection(section.id)}
              className="
  w-full
  flex
  items-center
  justify-between
  px-4
  py-3
  text-[15px]
  font-semibold
  text-[#2b2f3a]
  hover:bg-[#f5f7fa]
  transition-colors
  focus:outline-none
  focus:ring-0
  border-none
  outline-none
  cursor-pointer
"
            >
              <span>{section.title}</span>

              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* ITEMS */}
            <div
              className={`
                transition-all
                duration-300
                overflow-hidden
                ${isOpen ? "max-h-[400px]" : "max-h-0"}
              `}
            >
              <div className="flex flex-col gap-1 px-2 pb-2">
                {section.items.map((item) => {
                  const selected = selectedType === item.type;

                  return (
                    <button
                      key={item.type}
                      onClick={() =>
                        onSelect(
                          item.type as
                            | TableType
                            | ElementType
                            | "parede"
                            | "parede_interna",
                        )
                      }
                      className={`
  flex
  items-center
  gap-4
  px-4
  py-3
  rounded-lg
  transition-all
  duration-150
  text-[14px]

  appearance-none
  outline-none
  border
  focus:outline-none
  focus:ring-0
  active:outline-none
cursor-pointer

  ${
    selected
      ? "bg-[#edf4ff] border border-[#cfe0ff]"
      : "border border-transparent hover:bg-[#f3f4f6]"
  }
`}
                    >
                      <div className="w-8 flex justify-center items-center">
                        {item.render()}
                      </div>

                      <span className="text-[#444] text-[14px] font-medium">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
