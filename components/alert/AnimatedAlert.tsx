"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

interface AnimatedAlertProps {
  message: string | null;
  type?: "error" | "success" | "warning";
  duration?: number;
  onClose?: () => void;
}

export default function AnimatedAlert({
  message,
  type = "error",
  duration = 4000,
  onClose,
}: AnimatedAlertProps) {
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!message) return;

    setDisplayedMessage(message);
    setIsClosing(false);

    const timer = setTimeout(() => {
      setIsClosing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  useEffect(() => {
  if (!isClosing) return;

  const timer = setTimeout(() => {
    setDisplayedMessage(null);
    setIsClosing(false);
    onClose?.();
  }, 400);

  return () => clearTimeout(timer);
}, [isClosing, onClose]);


  const isOpen = !!displayedMessage && !isClosing;

  const styles = {
    error: {
      box: "border-red-300 bg-red-50 text-red-700",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    success: {
      box: "border-green-300 bg-green-50 text-green-700",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    warning: {
      box: "border-yellow-300 bg-yellow-50 text-yellow-700",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
  };

  return (
    <div
      className={`
        grid transition-all duration-400 ease-in-out
        ${isOpen ? "grid-rows-[1fr] opacity-100 mb-6" : "grid-rows-[0fr] opacity-0 mb-0"}
      `}
    >
      <div className="overflow-hidden">
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm text-start ${styles[type].box}`}
        >
          {styles[type].icon}
          <span>{displayedMessage}</span>
        </div>
      </div>
    </div>
  );
}
