"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, LogOut, LoaderCircle } from "lucide-react";

type EmployeeProfileMenuProps = {
  role: "gerente" | "cozinha" | "caixa" | "garcom";
};

type Employee = {
  id: number;
  name: string;
  role: string;
  active: number | boolean;
};

const roleLabels: Record<EmployeeProfileMenuProps["role"], string> = {
  gerente: "Gerente",
  cozinha: "Cozinha",
  caixa: "Caixa",
  garcom: "Garçom",
};

export default function EmployeeProfileMenu({
  role,
}: EmployeeProfileMenuProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    async function loadEmployee() {
      try {
        const response = await fetch(
          `/api/restaurant/employees/me?role=${encodeURIComponent(role)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setEmployee(data);
      } catch (error) {
        console.error("Erro ao carregar funcionário:", error);
      }
    }

    loadEmployee();
  }, [role]);

  function getInitials(name?: string) {
    if (!name) return "--";

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return "--";

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function getFirstName(name?: string) {
    if (!name) return "Carregando...";

    return name.trim().split(/\s+/)[0] || "Funcionário";
  }

  function toggleMenu() {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    const menuWidth = 180;
    const menuHeight = 48;
    const gap = 8;

    setMenuPosition({
      top: rect.top - menuHeight - gap,
      left: rect.right - menuWidth,
    });

    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();

      const menuWidth = 180;
      const menuHeight = 48;
      const gap = 12;

      setMenuPosition({
        top: rect.top - menuHeight - gap - 10,
        left: rect.right - menuWidth + 40,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/restaurant/employees/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível encerrar a sessão.");
      }

      window.location.reload();
    } catch (error) {
      console.error("Erro ao encerrar sessão:", error);
      setLoggingOut(false);
    }
  }

  const initials = getInitials(employee?.name);
  const firstName = getFirstName(employee?.name);
  const roleLabel = roleLabels[role];

  return (
    <div className="w-full px-4 pb-4">
      <div className="flex w-full items-center gap-3 rounded-lg border border-[#E8EAF0] bg-white px-3 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b325f] text-[14px] font-medium text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1 items-start text-left">
          <p className="w-fit max-w-full cursor-default text-[15px] font-semibold leading-[18px] text-[#17233D]">
            {firstName}
          </p>

          <p className="mt-[3px] text-[13px] leading-[16px] text-[#8791A8]">
            {roleLabel}
          </p>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          aria-label="Opções do funcionário"
          className="m-0 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md p-0 text-[#253E6F]"
        >
          <MoreVertical size={19} />
        </button>

        {open && (
          <div
            className="fixed w-45 rounded-lg overflow-hidden bg-white shadow-[0_6px_24px_rgba(27,50,95,0.14)] border border-[#E8EAF0] "
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center cursor-pointer gap-2.5 w-45 px-3 py-2.5 text-left text-[13px] font-medium text-[#374151] hover:bg-[#F7F8FA]"
            >
              <LogOut size={16} className="shrink-0" />

              <span>Encerrar sessão</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
