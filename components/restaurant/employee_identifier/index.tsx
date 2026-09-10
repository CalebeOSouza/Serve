"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, UserRound, KeyRound } from "lucide-react";
import AnimatedAlert from "@/components/alert/AnimatedAlert";

type EmployeeRole = "gerente" | "cozinha" | "caixa" | "garcom";

interface EmployeeIdentifierProps {
  restaurantId: string;
  role: EmployeeRole;
  onIdentified?: (employee: {
    id: number;
    name: string;
  }) => void;
  children: React.ReactNode;
}

export default function EmployeeIdentifier({
  restaurantId,
  role,
  onIdentified,
  children,
}: EmployeeIdentifierProps) {
  const [identified, setIdentified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string | null;
    type: "error" | "success" | "warning";
  }>({
    message: null,
    type: "error",
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkEmployeeSession() {
      try {
        const response = await fetch(
          `/api/restaurant/employees/identify?restaurantId=${restaurantId}&role=${role}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (response.ok && data.employee) {
          setIdentified(true);
          onIdentified?.(data.employee);
        }
      } catch {
        setIdentified(false);
      } finally {
        setChecking(false);
      }
    }

    if (restaurantId && role) {
      checkEmployeeSession();
    }
  }, [restaurantId, role, onIdentified]);

  useEffect(() => {
    if (!identified && !checking) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [identified, checking]);

  async function identifyEmployee(e: React.FormEvent) {
    e.preventDefault();

    if (!pin.trim()) {
      setAlert({
        message: "Digite o PIN do funcionário.",
        type: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      setAlert({
        message: null,
        type: "error",
      });

      const response = await fetch("/api/restaurant/employees/identify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
          role,
          pin: pin.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlert({
          message: data.error || "PIN inválido.",
          type: "error",
        });
        return;
      }

      setIdentified(true);

      onIdentified?.({
        id: data.employee.id,
        name: data.employee.name,
      });
    } catch {
      setAlert({
        message: "Não foi possível identificar o funcionário.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoaderCircle className="w-8 h-8 text-(--color-primary) animate-spin" />
      </div>
    );
  }

  if (identified) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="pointer-events-none select-none blur-[4px] transition-all duration-300">
        {children}
      </div>

      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 backdrop-blur-[3px] px-5">
        <div className="w-full max-w-[420px] bg-white rounded-lg shadow-2xl border border-gray-200 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-(--color-tertiary) flex items-center justify-center mb-5">
              <UserRound className="w-8 h-8 text-(--color-primary)" />
            </div>

            <h1 className="text-[24px] font-semibold text-[#19274b]">
              Identifique-se
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-[320px]">
              Digite o PIN do funcionário para acessar o sistema.
            </p>
          </div>

          <form
            onSubmit={identifyEmployee}
            className="flex flex-col gap-4 mt-7"
          >
            <AnimatedAlert
              message={alert.message}
              type={alert.type}
              onClose={() =>
                setAlert((prev) => ({
                  ...prev,
                  message: null,
                }))
              }
            />

            <div className="flex flex-col gap-2">
              <label
                htmlFor="employee-pin"
                className="text-sm font-medium text-[#19274b]"
              >
                PIN do funcionário
              </label>

              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  ref={inputRef}
                  id="employee-pin"
                  type="text"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6),
                    )
                  }
                  placeholder="Ex: FXE808"
                  maxLength={6}
                  autoComplete="off"
                  disabled={loading}
                  className="w-full h-12 rounded-lg border border-gray-300 pl-12 pr-4 text-center text-lg font-semibold tracking-[0.25em] text-[#19274b] outline-none transition-all focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full h-12 rounded-lg bg-(--color-primary) text-white font-semibold transition-all hover:bg-(--color-secondary) disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}