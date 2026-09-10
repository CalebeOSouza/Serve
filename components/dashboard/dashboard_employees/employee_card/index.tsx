"use client";
import { KeyRound, DoorOpen } from "lucide-react";
import Image from "next/image";
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
  setConfirmDeleteId: (id: number | null) => void;
  confirmDeleteId: number | null;
  deletarFuncionario: (employeeId: number) => void;
  setNome: (nome: string) => void;
  setCpf: (cpf: string) => void;
  setCargosSelecionados: (cargos: CargoTipo[]) => void;
  abrirModal: () => void;
  getInitials: (name: string) => string;
}

function getFirstName(name: string) {
  return name.trim().split(" ")[0];
}

export default function EmployeeCard({
  emp,
  cargos,
  setConfirmDeleteId,
  confirmDeleteId,
  deletarFuncionario,
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
      className={`relative rounded-lg bg-white transition-all p-5 flex flex-col gap-5 shadow-sm`}
    >
      <div className="flex justify-between items-start w-full">
        <div className="relative flex gap-2">
          {emp.roles.map((roleType: string) => {
            const dadosCargo = cargos.find((c) => c.tipo === roleType);

            return (
              <div
                key={roleType}
                className="relative group w-8 h-8 flex items-center justify-center rounded-full bg-(--color-tertiary) shadow-sm cursor-pointer"
              >
                {dadosCargo && (
                  <Image
                    src={dadosCargo.imagem}
                    alt={dadosCargo.nome}
                    width={80}
                    height={80}
                    className="object-contain"
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
        <div className="w-16 h-16 rounded-full bg-(--color-tertiary) border border-[#c9dbff] flex items-center justify-center shadow-sm shrink-0">
          <span className="text-(--color-primary) font-semibold text-xl">
            {getInitials(emp.name)}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="relative group w-[90%]">
            <h1 className="font-semibold text-[20px] text-[#19274b] leading-tight truncate w-full">
              {emp.name}
            </h1>

            {/* Tooltip */}
            <div className="absolute hidden group-hover:block top-8 left-0 z-50 bg-white border border-gray-200 shadow-md rounded-md px-3 py-2 text-sm text-[#19274b] max-w-[220px] break-words whitespace-normal">
              {emp.name}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {emp.roles.length} cargo(s) vinculado(s)
          </p>
        </div>
      </div>

      <div className="relative flex gap-3 mt-auto">
        <button
          onClick={() => {
            setEditingEmployee(emp);
            setNome(emp.name);
            setCpf(emp.cpf);
            setCargosSelecionados(emp.roles);
            abrirModal();
          }}
          className="flex-1 text-white bg-(--color-primary) hover:bg-(--color-secondary) text-sm font-semibold py-2 rounded-md transition cursor-pointer"
        >
          Editar
        </button>

       
<button
     onClick={() => {
            setConfirmDeleteId(confirmDeleteId === emp.id ? null : emp.id);
          }}
    className="flex-1 px-2.5 py-2 items-center justify-center rounded-lg text-[#636976] hover:bg-[#fff1f1] hover:bg-gray-100 border border-gray-200 cursor-pointer"
  >
    Excluir
  </button>

        {confirmDeleteId === emp.id && (
          <div className="absolute bottom-12 right-0 z-50 w-[280px] rounded-md bg-red-600 shadow-xl overflow-hidden">
            <div className="p-4 text-white">
              <p className="font-semibold text-sm">
                Deseja excluir este funcionário?
              </p>

              <p className="text-xs mt-1 opacity-90">
                O funcionário "{emp.name}" será excluído.
              </p>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setConfirmDeleteId(null);
                  }}
                  className="flex-1 bg-white text-red-600 rounded py-2 text-sm cursor-pointer hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    deletarFuncionario(emp.id);
                  }}
                  className="flex-1 bg-red-800 rounded py-2 text-sm cursor-pointer hover:bg-red-900 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
