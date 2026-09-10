"use client";

import { use, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  SquareMousePointer,
  UserRoundKey,
  Lock,
  LoaderCircle,
  Search,
} from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";
import EmployeeCard, {
  Employee,
} from "@/components/dashboard/dashboard_employees/employee_card";
import { useRef } from "react";
export default function RestaurantFuncionarios() {
  const formRef = useRef<HTMLDivElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState<Cargo["tipo"] | null>(null);
  const [page, setPage] = useState<number>(1);
  const employeesPerPage = 4;
  const [hasRolePassword, setHasRolePassword] = useState(false);
  const [cargosSelecionados, setCargosSelecionados] = useState<string[]>([]);
  const [rolePassword, setRolePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [roles, setRoles] = useState<{ type: string; username: string }[]>([]);
  const [isReset, setIsReset] = useState(false);
  const [pinModal, setPinModal] = useState<{
    open: boolean;
    pin: string | null;
    employeeId: number | null;
    hasPin: boolean;
  }>({
    open: false,
    pin: null,
    employeeId: null,
    hasPin: false,
  });
  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success" | "warning";
  }>({
    message: null,
    type: "error",
  });
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [credentialsModal, setCredentialsModal] = useState<{
    open: boolean;
  }>({
    open: false,
  });

  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;
  type Cargo = {
    nome: string;
    descricao: string;
    descricao_form: string;
    scale_form?: string;
    imagem: string;
    tipo: "gerente" | "cozinha" | "garcom" | "caixa";
    scale?: string;
    offsetY?: string;
  };

  const cargos: Cargo[] = [
    {
      nome: "Gerente",
      descricao: "Acesso total ao sistema",
      descricao_form: "Acesso total",
      imagem: "/gerente.png",
      tipo: "gerente",
      scale: "scale-110",
      scale_form: "scale-150",
      offsetY: "mt-1",
    },
    {
      nome: "Cozinha",
      descricao: "Visualiza e gerencia pedidos",
      descricao_form: "Visualizar e gerenciar pedidos",
      imagem: "/cozinha.png",
      tipo: "cozinha",
      scale: "scale-110",
      scale_form: "scale-150",
      offsetY: "mt-1",
    },
    {
      nome: "Garçom",
      descricao: "Atende mesas e gerencia pedidos",
      descricao_form: "Atender mesas e gerenciar pedidos",
      imagem: "/garcom.png",
      tipo: "garcom",
      scale_form: "scale-140",
    },
    {
      nome: "Caixa",
      descricao: "Processa pagamentos",
      descricao_form: "Processar pagamentos",
      imagem: "/caixa.png",
      tipo: "caixa",
      scale_form: "scale-150",
    },
  ];

  async function fetchRoles() {
    const res = await fetch(
      `/api/restaurant/roles?restaurantId=${restaurantId}`,
    );

    const data = await res.json();
    setRoles(data.roles);
  }

  function getUsernameByCargo(tipo: string) {
    const role = roles.find((r) => r.type === tipo);
    return role?.username || "Sem username";
  }

  async function salvarSenhaCargos(e: React.FormEvent) {
    e.preventDefault();

    if (hasRolePassword && rolePassword !== confirmPassword) {
      setAlert({
        message: "As senhas não coincidem",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/restaurant/roles/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: rolePassword,
          restaurantId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar senha");
      }

      setCredentialsModal({ open: false });
      setRolePassword("");
      setConfirmPassword("");
      setHasRolePassword(true);

      await fetchRoles();
    } catch (error: any) {
      setAlert({
        message: error.message || "Erro inesperado",
        type: "error",
      });
    }
  }

  function toggleCargo(tipo: Cargo["tipo"]) {
    setCargosSelecionados((prev) => {
      if (prev.includes(tipo)) {
        if (prev.length > 1) {
          return prev.filter((t) => t !== tipo);
        } else {
          return prev;
        }
      } else {
        return [...prev, tipo];
      }
    });
  }

  function handleCriarFuncionario(tipo: Cargo["tipo"]) {
    setEditingEmployee(null);
    setNome("");
    setCpf("");

    setCargosSelecionados([tipo]);

    abrirModal();
  }

  function abrirModal() {
    setShowModal(true);

    setTimeout(() => {
      setOpenModal(true);
    }, 10);
  }

  function fecharModal() {
    setOpenModal(false);
    setShowModal(false);
    setEditingEmployee(null);
    setNome("");
    setCpf("");
    setCargosSelecionados([]);
  }

  async function checkRolePassword() {
    const res = await fetch(
      `/api/restaurant/roles/password/has-password/?restaurantId=${restaurantId}`,
    );

    const data = await res.json();
    setHasRolePassword(data.hasPassword);
  }

  useEffect(() => {
    if (restaurantId) {
      fetchEmployees();
      checkRolePassword();
      fetchRoles();
    }
  }, [restaurantId]);

  useEffect(() => {
    if (openModal && formRef.current && window.innerWidth < 1700) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  }, [openModal]);

  useEffect(() => {
    console.log("Selecionados:", cargosSelecionados);
  }, [cargosSelecionados]);

  async function fetchEmployees() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/restaurant/employees?restaurantId=${restaurantId}`,
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar funcionários");
      }

      setEmployees(data.employees);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
    } finally {
      setLoading(false);
    }
  }

  const lastEmployee = page * employeesPerPage;
  const firstEmployee = lastEmployee - employeesPerPage;

  const filteredEmployees = employees.filter((emp) => {
    const matchNome = emp.name.toLowerCase().includes(search.toLowerCase());

    const matchCargo = cargoFiltro ? emp.roles.includes(cargoFiltro) : true;

    return matchNome && matchCargo;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aIsGerente = a.roles.includes("gerente");
    const bIsGerente = b.roles.includes("gerente");

    if (aIsGerente && !bIsGerente) return -1;
    if (!aIsGerente && bIsGerente) return 1;
    return 0;
  });

  const visibleEmployees = sortedEmployees.slice(firstEmployee, lastEmployee);

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  const maxVisiblePages = 5;

  const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  useEffect(() => {
    setPage(1);
  }, [employees, search, cargoFiltro]);

  function getInitials(name: string) {
    if (!name) return "";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  }

  function capitalize(text: string) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async function criarFuncionario(e: React.FormEvent) {
    e.preventDefault();

    const nomeFinal = nome;
    const cpfFinal = cpf;

    const response = await fetch("/api/restaurant/employees", {
      method: editingEmployee ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: editingEmployee?.id,
        name: nomeFinal,
        roles: cargosSelecionados,
        cpf: cpfFinal,
        restaurantId: restaurantId,
      }),
    });

    if (response.ok) {
      fecharModal();
      setCargosSelecionados([]);

      await fetchEmployees();
    } else {
      const data = await response.json();

      setAlert({
        message: data.error || "Erro ao criar funcionário",
        type: "error",
      });
    }
  }

  async function gerarPinModal() {
    if (!pinModal.employeeId) return;

    setPinModal((prev) => ({ ...prev, loading: true }));

    const res = await fetch("/api/restaurant/employees/pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ employeeId: pinModal.employeeId }),
    });

    const data = await res.json();

    if (res.ok) {
      setPinModal((prev) => ({
        ...prev,
        pin: data.pin,
        loading: false,
      }));
    } else {
      setPinModal((prev) => ({ ...prev, loading: false }));
      setAlert({
        message: data.error || "Erro ao gerar PIN",
        type: "error",
      });
    }
  }

  async function deletarFuncionario(employeeId: number) {
    const res = await fetch(
      `/api/restaurant/employees?employeeId=${employeeId}`,
      {
        method: "DELETE",
      },
    );

    if (res.ok) {
      setConfirmDeleteId(null);
      await fetchEmployees();
    } else {
      const data = await res.json();

      setAlert({
        message: data.error || "Erro ao excluir",
        type: "error",
      });
    }
  }

  return (
    <div
      className={`${openModal ? "lg:px-10 px-5" : "px-5 lg:px-10 md:px-10"} py-10 w-full mx-auto flex flex-col gap-6 transition-all duration-400`}
    >
      <div className="flex flex-col text-start gap-2">
        <div className="flex flex-col text-start">
          <h1 className="font-semibold text-[27px] text-[#19274b]">
            Gerencie sua equipe!
          </h1>
          <p className=" text-[16px] text-[#19274b]">
            Crie e administre as contas dos cargos do seu restaurante.
          </p>
        </div>
        <span className="mt-4 border-b border-gray-200"></span>
      </div>

      <div className="flex justify-between text-start my-5 flex-col gap-6 lg:flex-row lg:gap-0">
        <div className="flex flex-col">
          <h1 className="font-semibold text-[27px] text-[#19274b]">
            Criar funcionários!
          </h1>
          <p className=" text-[16px] text-[#19274b]">
            Selecione o cargo para criar um funcionário
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={() =>
              setCredentialsModal({
                open: true,
              })
            }
            className="flex items-center gap-4 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4 text-white" />
            {hasRolePassword
              ? "Redefinir senha dos cargos"
              : "Definir senha dos cargos"}
          </button>
        </div>
      </div>
   
      <section className={`layout-container`}>
        <div className={`layout-main ${openModal ? "is-open" : ""}`}>
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {cargos.map((cargo) => (
                <div
                  key={cargo.tipo}
                  className="relative rounded-lg bg-white flex flex-col items-center shadow-sm transition-all"
                >
                  <div className="absolute top-4 left-4">
                    <div className="relative group flex-col items-center cursor-pointer flex justify-center p-2 rounded-full hover:bg-gray-100 transition">
                      <UserRoundKey className="w-4 h-4 text-(--color-primary)" />

                      <span className="absolute top-10 z-50 hidden group-hover:flex px-2 py-1 rounded-md text-xs bg-white border border-gray-100 text-(--color-primary) font-semibold overflow-x-auto whitespace-nowrap shadow-md">
                        {getUsernameByCargo(cargo.tipo)}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-18 h-18 min-w-18 min-h-18 rounded-full flex items-center justify-center mt-6 shadow-sm ${
                      hasRolePassword
                        ? "bg-(--color-tertiary) border border-[#c9dbff]" //bg-[#e3effe] border border-[#c9dbff]
                        : "bg-[#E5E5E5] grayscale opacity-90"
                    }`}
                  >
                    <Image
                      src={cargo.imagem}
                      alt={cargo.nome}
                      width={80}
                      height={80}
                      className={`object-contain ${cargo.scale || ""} ${cargo.offsetY || ""}`}
                      priority
                    />
                  </div>

                  <div className="flex flex-col px-5 py-5 pt-3 text-center w-full h-full">
                    <div className="flex flex-col text-center gap-2 flex-1">
                      <h1 className="font-semibold text-[22px] text-[#19274b]">
                        {cargo.nome}
                      </h1>
                      <p className="text-[15px] text-[#19274b]">
                        {cargo.descricao}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCriarFuncionario(cargo.tipo)}
                      disabled={!hasRolePassword}
                      className={`mt-4 text-sm font-semibold py-2 rounded-md transition-all
    ${
      hasRolePassword
        ? "bg-(--color-primary) hover:bg-(--color-secondary) cursor-pointer text-white"
        : "bg-[#E5E5E5] cursor-not-allowed text-[#676767]"
    }
  `}
                    >
                      Criar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-baseline lg:flex-row lg:justify-between text-start gap-2 mt-8">
              <div>
                <h1 className="font-semibold text-[27px] text-[#19274b]">
                  Funcionários cadastrados!
                </h1>
                <p className=" text-[16px] text-[#19274b]">
                  Visualize e gerencie as contas da sua equipe
                </p>
              </div>

              <div className="mt-4 flex flex-col items-start lg:flex-row gap-5">
                <div className="relative w-[280px]">
                  <input
                    type="text"
                    placeholder="Buscar funcionário..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 rounded-lg border border-gray-200 px-4 pr-10 text-sm text-[#19274b] outline-none focus:border-[#1b325f]"
                  />

                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {cargos.map((cargo) => (
                    <div
                      key={cargo.tipo}
                      onClick={() =>
                        setCargoFiltro((prev) =>
                          prev === cargo.tipo ? null : cargo.tipo,
                        )
                      }
                      className={`relative group w-9 h-9 flex items-center justify-center rounded-full shadow-sm cursor-pointer bg-(--color-tertiary)
        ${cargoFiltro === cargo.tipo ? "bg-[#0055ff]" : "bg-[#e0e0e0] grayscale opacity-70"}"
      `}
                    >
                      <Image
                        src={cargo.imagem}
                        width={80}
                        height={80}
                        className={`object-contain `}
                        alt={cargo.nome}
                      />

                      <span className="absolute top-10 hidden group-hover:flex px-2 py-1 rounded-md text-xs bg-white text-(--color-primary) font-semibold whitespace-nowrap shadow-md">
                        {cargo.nome}
                      </span>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            <div
              className={`mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3`}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-30 w-full col-span-full gap-3">
                  <LoaderCircle className="w-10 h-10 text-(--color-primary) animate-spin" />

                  <p className="text-gray-500">Carregando funcionários...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="rounded-2xl bg-white flex flex-col items-center shadow-sm hover:shadow-md transition-all col-span-4">
                  <div className="relative w-30 h-16">
                    <Image
                      src="/sem_funcionarios2.png"
                      alt="Banner do restaurante"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="flex flex-col px-5 py-5 pt-3 text-center w-full">
                    <div className="flex flex-col text-center gap-2">
                      <h1 className="font-semibold text-[22px] text-[#19274b]">
                        Nenhum funcionário cadastrado
                      </h1>
                      <p className=" text-[15px] text-[#19274b]">
                        Comece criando as contas da sua equipe
                      </p>
                    </div>
                  </div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="rounded-2xl bg-white flex flex-col items-center shadow-sm hover:shadow-md transition-all col-span-4">
                  <div className="relative w-30 h-16">
                    <Image
                      src="/sem_funcionarios2.png"
                      alt="Banner do restaurante"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>

                  <div className="flex flex-col px-5 py-5 pt-3 text-center w-full">
                    <div className="flex flex-col text-center gap-2">
                      <h1 className="font-semibold text-[22px] text-[#19274b]">
                        Nenhum resultado encontrado
                      </h1>
                      <p className=" text-[15px] text-[#19274b]">
                        Tente mudar o filtro ou limpar a busca
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                visibleEmployees.map((emp) => (
                  <EmployeeCard
                    key={emp.id}
                    emp={emp}
                    cargos={cargos}
                    setPinModal={setPinModal}
                    setEditingEmployee={setEditingEmployee}
                    setConfirmDeleteId={setConfirmDeleteId}
                    confirmDeleteId={confirmDeleteId}
                    deletarFuncionario={deletarFuncionario}
                    setNome={setNome}
                    setCpf={setCpf}
                    setCargosSelecionados={setCargosSelecionados}
                    abrirModal={abrirModal}
                    getInitials={getInitials}
                  />
                ))
              )}
            </div>
            {filteredEmployees.length > 0 && (
              <div className="flex flex-col md:flex-row items-center mt-10 text-sm text-gray-600">
                <div className="flex-1 mb-5">
                  <p>
                    Mostrando {firstEmployee + 1}–
                    {Math.min(lastEmployee, employees.length)} de{" "}
                    {employees.length}
                  </p>
                </div>

                <div className="flex flex-row items-center gap-2">
                  <button
                    onClick={() => setPage((p: number) => Math.max(p - 1, 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer bg-white"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center">
                    {[...Array(endPage - adjustedStartPage + 1)].map(
                      (_, i: number) => {
                        const pageNumber = adjustedStartPage + i;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`px-3 py-1.5 border border-gray-300 cursor-pointer ${
                              page === pageNumber
                                ? "bg-(--color-primary) text-white"
                                : "hover:bg-gray-100 bg-white"
                            } ${
                              i === 0
                                ? "rounded-l-[3px]"
                                : i === endPage - adjustedStartPage
                                  ? "rounded-r-[3px] border-l-0 "
                                  : "rounded-none border-l-0 "
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setPage((p: number) => Math.min(p + 1, totalPages))
                    }
                    className="px-3 py-1.5 border border-gray-300 rounded-[3px] hover:bg-gray-100 cursor-pointer bg-white"
                  >
                    Próximo
                  </button>
                </div>

                <div className="flex-1"></div>
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div
            ref={formRef}
            className={`layout-aside ${openModal ? "is-open" : ""}`}
          >
            <form
              onSubmit={criarFuncionario}
              className="bg-white rounded-2xl shadow-sm p-10 py-5 h-fit transition-all border border-gray-200 flex flex-col"
            >
              <h1 className="font-semibold text-[22px] text-[#19274b]">
                {editingEmployee ? "Editar funcionário" : "Novo funcionário"}
              </h1>

              <span className="block border-b border-gray-200 my-4"></span>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <h1 className="font-semibold text-[18px] text-[#19274b]">
                    Dados básicos
                  </h1>

                  <AnimatedAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() =>
                      setAlert((prev) => ({ ...prev, message: null }))
                    }
                  />

                  <div className="flex flex-col gap-1">
                    <label>Nome</label>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      name="nome"
                      type="text"
                      placeholder="Ex: João Vitor"
                      maxLength={100}
                      className="border border-gray-300 py-2 px-4 rounded-md outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label>CPF</label>
                    <input
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      name="cpf"
                      type="text"
                      placeholder="Ex: 123.456.789-00"
                      maxLength={11}
                      className="border border-gray-300 py-2 px-4 rounded-md outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 ">
                  <h1 className="font-semibold text-[18px] text-[#19274b]">
                    Cargo
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                    {cargos.map((cargo) => (
                      <button
                        type="button"
                        key={cargo.tipo}
                        onClick={() => toggleCargo(cargo.tipo)}
                        className={`relative flex gap-3 border rounded-md p-3 cursor-pointer items-center transition-all ${cargosSelecionados.includes(cargo.tipo) ? "bg-[#EAF2FD] border-[#a7c3e2]" : "bg-gray-200 border-gray-300 opacity-60"}`}
                      >
                        <div className="flex items-center gap-2 text-(--color-primary) absolute right-2 top-2">
                          <SquareMousePointer size={15} />
                        </div>

                        <div
                          className={`relative w-9 h-9 min-w-9 min-h-9 mt-1 rounded-full flex items-center justify-center shadow-sm overflow-hidden transition-all ${!cargosSelecionados.includes(cargo.tipo) ? "bg-[#c8c9cb]" : "bg-[#c9dbff]"}`}
                        >
                          <Image
                            src={cargo.imagem}
                            alt={cargo.nome}
                            width={80}
                            height={80}
                            className={`
    object-contain
    ${cargo.scale_form || ""} 
    ${cargo.offsetY || ""}
    ${!cargosSelecionados.includes(cargo.tipo) ? "grayscale opacity-70" : ""}
  `}
                            priority
                          />
                        </div>

                        <div className="flex flex-col flex-start text-start">
                          <h1 className="font-semibold text-[16px] text-[#19274b]">
                            {cargo?.nome}
                          </h1>
                          <p className="text-[12px] text-[#19274b]">
                            {cargo?.descricao}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-auto pt-6">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bg-(--color-primary) text-white text-sm px-5 py-2 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
                >
                  {editingEmployee ? "Salvar alterações" : "Criar funcionário"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {pinModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 w-[400px]">
            <h2 className="text-xl font-semibold text-[#19274b]">
              Gerenciar PIN
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Gere ou redefina o PIN deste funcionário.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              {!pinModal.pin ? (
                !pinModal.hasPin ? (
                  <button
                    onClick={gerarPinModal}
                    className="w-full bg-(--color-primary) text-white py-3 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
                  >
                    Gerar PIN
                  </button>
                ) : (
                  <>
                    <div className="text-center text-sm text-gray-500">
                      Este funcionário já possui um PIN ativo.
                      <br />
                      Caso tenha esquecido, você pode redefinir.
                    </div>

                    <button
                      onClick={gerarPinModal}
                      className="w-full bg-(--color-primary) text-white py-3 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
                    >
                      Redefinir PIN
                    </button>
                  </>
                )
              ) : (
                <>
                  <div className="bg-(--color-tertiary) text-(--color-primary) font-bold text-2xl tracking-widest px-6 py-3 rounded-xl text-center">
                    {pinModal.pin}
                  </div>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(pinModal.pin || "")
                    }
                    className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
                  >
                    Copiar PIN
                  </button>

                  <button
                    onClick={gerarPinModal}
                    className="w-full bg-(--color-primary) text-white py-2 rounded-md hover:bg-(--color-secondary) transition cursor-pointer"
                  >
                    Redefinir PIN
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  setPinModal({
                    open: false,
                    pin: null,
                    employeeId: null,
                    hasPin: false,
                  })
                }
                className="w-full mt-2 text-gray-500 text-sm hover:underline cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {credentialsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-[#19274b]">
                {hasRolePassword
                  ? "Redefinir senha dos cargos"
                  : "Definir senha dos cargos"}
              </h2>

              <p className="text-sm text-gray-500">
                {hasRolePassword
                  ? "Você pode redefinir a senha global dos cargos"
                  : "Defina uma senha única para todos os cargos"}
              </p>
            </div>

            <form onSubmit={salvarSenhaCargos} className="flex flex-col gap-4">
              <AnimatedAlert
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert((prev) => ({ ...prev, message: null }))}
              />

              <div className="flex flex-col gap-1">
                <label>{hasRolePassword ? "Nova senha" : "Senha"}</label>
                <input
                  value={rolePassword}
                  onChange={(e) => setRolePassword(e.target.value)}
                  type="password"
                  placeholder="Ex: Abc@123"
                  className="border border-gray-300 py-2 px-4 rounded-md outline-none"
                />
              </div>

              {hasRolePassword && (
                <div className="flex flex-col gap-1">
                  <label>Confirmar senha</label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Confirme a senha"
                    maxLength={30}
                    className="border border-gray-300 py-2 px-4 rounded-md outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setCredentialsModal({ open: false })}
                  className="w-full border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full py-2 rounded-md text-white bg-(--color-primary) hover:bg-(--color-secondary) transition cursor-pointer"
                >
                  {hasRolePassword ? "Redefinir senha" : "Salvar senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
