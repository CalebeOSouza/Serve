"use client";
import { SquareMousePointer, KeyRound, DoorOpen } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Dispatch, SetStateAction } from "react";
export type CargoTipo = "gerente" | "cozinha" | "garcom" | "caixa";

export type Cargo = {
  nome: string;
  descricao: string;
  imagem: string;
  tipo: CargoTipo;
};

export type Employee = {
  id: number;
  name: string;
  cpf: string;
  roles: CargoTipo[];
};

interface Props {
  emp: Employee;
  cargos: Cargo[];
  setPinModal: Dispatch<
    SetStateAction<{
      open: boolean;
      pin: string | null;
      employeeId: number | null;
      hasPin: boolean;
    }>
  >;
  setEditingEmployee: (emp: Employee) => void;
  setDeleteModal: (data: { open: boolean; employee: Employee | null }) => void;
  setNome: (nome: string) => void;
  setCpf: (cpf: string) => void;
  setCargosSelecionados: (cargos: CargoTipo[]) => void;
  abrirModal: () => void;
  getInitials: (name: string) => string;
}

export default function EmployeeCard({
  emp,
  cargos,
  setDeleteModal,
  setEditingEmployee,
  setNome,
  setCpf,
  setCargosSelecionados,
  abrirModal,
  setPinModal,
  getInitials,
}: Props) {
  return (
    <div
      className={`relative rounded-2xl bg-white shadow-md hover:shadow-lg transition-all p-5 flex flex-col gap-5 border border-gray-200`}
    >
      <div className="flex justify-between items-start w-full">
        <div className="relative flex gap-2">
          {emp.roles.map((roleType: string) => {
            const dadosCargo = cargos.find((c) => c.tipo === roleType);

            return (
              <div
                key={roleType}
                className="relative group w-8 h-8 flex items-center justify-center rounded-full bg-[#e3effe] shadow-sm cursor-pointer"
              >
                {dadosCargo && (
                  <Image
                    src={dadosCargo.imagem}
                    alt={dadosCargo.nome}
                    width={80}
                    height={80}
                    className="object-contain "
                  />
                )}

                <span className="absolute top-10 hidden group-hover:flex px-2 py-1 rounded-md text-xs bg-white border border-gray-100 text-(--color-primary) font-semibold whitespace-nowrap shadow-md">
                  {dadosCargo?.nome}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative group flex flex-col items-center">
          {!emp.roles.includes("gerente") ? (
            <button
              onClick={async () => {
                const res = await fetch(
                  `/api/restaurant/employees/pin?employeeId=${emp.id}`,
                );
                const data = await res.json();

                setPinModal({
                  open: true,
                  pin: null,
                  employeeId: emp.id,
                  hasPin: data.hasPin,
                });
              }}
              className="cursor-pointer flex justify-center p-2 rounded-full hover:bg-gray-100 transition"
            >
              <KeyRound className="w-4 h-4 text-(--color-primary)" />
            </button>
          ) : (
            <button className="cursor-pointer flex justify-center p-2 rounded-full hover:bg-gray-100 transition">
              <DoorOpen className="w-4 h-4 text-(--color-primary)" />
            </button>
          )}

          <span className="absolute top-10 z-50 hidden group-hover:flex px-2 py-1 rounded-md text-xs bg-white border border-gray-100 text-(--color-primary) font-semibold whitespace-nowrap shadow-md">
            {!emp.roles.includes("gerente")
              ? "Gerenciar PIN"
              : "Acesso credencial"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-1">
        <div className="w-16 h-16 rounded-full bg-[#e3effe] border border-[#c9dbff] flex items-center justify-center shadow-sm shrink-0">
          <span className="text-(--color-primary) font-semibold text-xl">
            {getInitials(emp.name)}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="w-[90%] overflow-x-auto whitespace-nowrap">
            <h1 className="font-semibold text-[20px] text-[#19274b] leading-tight inline-block">
              {emp.name}
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            {emp.roles.length} cargo(s) vinculado(s)
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => {
            setEditingEmployee(emp);
            setNome(emp.name);
            setCpf(emp.cpf);
            setCargosSelecionados(emp.roles);
            abrirModal();
          }}
          className="flex-1 border border-gray-300 text-(--color-primary) text-sm font-semibold py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
        >
          Editar
        </button>
        <button
          onClick={() => {
            setDeleteModal({
              open: true,
              employee: emp,
            });
          }}
          className="flex-1 bg-(--color-primary) text-white text-sm font-semibold py-2 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
