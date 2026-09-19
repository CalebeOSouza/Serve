import { UserRound, Armchair, Clock, Clock3 } from "lucide-react";
import {} from "../../../../utils/layout/tableContentRotation";
type Props = {
  type: "mesa_quadrada" | "mesa_retangular" | "mesa_redonda" | "mesa_l";

  tableNumber?: number;
  capacity?: number;

  status?: "livre" | "reservada" | "ocupada" | "indisponivel";

  reservationTime?: string;

  isPreview?: boolean;

  isVertical?: boolean;
  isHorizontalFlipped?: boolean;
  isVerticalFlipped?: boolean;

  lCorner?: "top-left" | "top-right" | "bottom-right" | "bottom-left";
};

export function TableOverlay({
  type,
  tableNumber,
  capacity,
  status,
  reservationTime,
  isPreview,
  isVertical,
  isHorizontalFlipped,
  isVerticalFlipped,
  lCorner,
}: Props) {
  function getTableNumberColor(status?: Props["status"]) {
    switch (status) {
      case "indisponivel":
        return "bg-gray-700";

      case "reservada":
        return "bg-[#fc8417]";

      case "ocupada":
        return "bg-[#c93237]";

      default:
        return "bg-(--color-secondary)";
    }
  }

  if (type === "mesa_redonda") {

    return (
      <div className="relative w-full h-full flex rounded-full">
        <div
          className={`absolute top-3 left-1/2 right-1/2 flex gap-1 items-center justify-center`}
        >
          <div
            className={`inset-0 w-fit max-w-6 h-4 rounded-sm flex items-center justify-center px-1.5 text-[10px] text-white ${getTableNumberColor(status)}`}
          >
            <p className="text-[10px] leading-none text-center">
              {tableNumber}
            </p>
          </div>

          <div className="flex gap-0.5 items-center justify-center">
            <Armchair className="w-3 h-3" />
            <p className="text-[10px] leading-none mt-[1.7px] text-center">
              {capacity}
            </p>
          </div>
        </div>

        <div
          className={`absolute left-1/2 -translate-x-1/2 flex flex-col justify-center  ${
      status === "livre"
        ? "bottom-1"
        : status === "reservada"
          ? "bottom-1"
          : status === "ocupada"
            ? "bottom-2"
            : "bottom-4"
    }`}
        >
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
          {status === "reservada" && (
            <div className="flex items-center justify-center text-center gap-1 text-[10px]">
                  <Clock3 className="w-2.5 h-2.5" />
                  {reservationTime}
                </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "mesa_l") {
    return (
      <div className="relative w-full h-full flex">
        
        <div
          className={`absolute bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm flex items-center justify-center text-white text-[10px]
        
        ${
          lCorner === "top-left"
            ? "top-1 left-1"
            : lCorner === "top-right"
              ? "top-25.5 right-25.5 -rotate-90"
              : lCorner === "bottom-right"
                ? "top-26.25 right-13.75 rotate-180"
                : "bottom-25.25 left-25.5 rotate-90"
        }

${getTableNumberColor(status)}

      `}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

      
        <div
          className={`absolute flex gap-0.5 items-center justify-center
        
        ${
          lCorner === "top-left"
            ? "top-1.5 right-1"
            : lCorner === "top-right"
              ? "bottom-26 right-25.5 -rotate-90"
              : lCorner === "bottom-right"
                ? "top-27 right-24 rotate-180"
                : "bottom-15 left-25.5 rotate-90"
        }
      `}
        >
          <Armchair className="w-3 h-3" />
          <p className="text-[10px] leading-none text-center">{capacity}</p>
        </div>


        <div
          className={`absolute flex flex-col justify-center

${
  // Ponta em baixo e direita
  lCorner === "top-left"
    ? "bottom-0.5 left-1.5"
    // Ponta em baixo e esquerda
    : lCorner === "top-right"
      ? status === "livre"
        ? "bottom-24.75 left-26 -rotate-90"
        : status === "reservada"
          ? "bottom-20 left-20.5 -rotate-90"
          : status === "ocupada"
            ? "bottom-22.5 left-23.5 -rotate-90"
            : "bottom-20.5 left-22 -rotate-90"
            // Ponta em cima e esquerda
      : lCorner === "bottom-right"
        ? status === "livre"
          ? "bottom-26.25 left-24 rotate-180"
          : status === "reservada"
            ? "bottom-22.75 left-17 rotate-180"
            : status === "ocupada"
              ? "bottom-26.5 left-19 rotate-180"
              : "bottom-26.5 left-15.5 rotate-180"
              // Ponta em cima e direita
        : status === "livre"
          ? "top-25 right-25.5 rotate-90"
          : status === "reservada"
            ? "top-20 right-20.5 rotate-90"
            : status === "ocupada"
              ? "top-22 right-23.25 rotate-90"
              : "top-20 right-21.5 rotate-90"
}
`}
        >
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
         {status === "reservada" && (
  <div
    className={`flex items-center text-center gap-1 text-[10px] ${
      lCorner === "top-right" || lCorner === "bottom-left"
        ? "justify-end"
        : ""
    }`}
  >
    <Clock3 className="w-2.5 h-2.5" />
    {reservationTime}
  </div>
)}
        </div>
      </div>
    );
  }

  if (type === "mesa_retangular") {
    if (isVertical) {
      return (
        <div
          className={`relative w-full h-full flex ${
            isVerticalFlipped ? "scale-x-[-1] scale-y-[-1]" : ""
          }`}
        >
          <div className=" flex items-center justify-center absolute bottom-[6.55px] right-25.25 -rotate-90">
            <div
              className={`bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm flex items-center justify-center text-white text-[10px] ${getTableNumberColor(status)}`}
            >
              <p className="text-[10px] leading-none text-center">
                {tableNumber}
              </p>
            </div>
          </div>

          <div className="flex gap-0.5 items-center justify-center absolute bottom-13.25 right-25.5 -rotate-90 ">
            <Armchair className="w-3 h-3" />
            <p className="text-[10px] leading-none text-center">{capacity}</p>
          </div>

          <div
            className={`absolute flex flex-col justify-center -rotate-90
    ${
      status === "livre"
        ? "bottom-1.75 left-25.5"
        : status === "reservada"
          ? "bottom-3.25 left-20.5"
          : status === "ocupada"
            ? "bottom-4.25 left-23"
            : "bottom-6 left-21"
    }
  `}
          >
            <p className="text-[10px] mt-0.5">
              {status === "livre"
                ? "Livre"
                : status === "reservada"
                  ? "Reservada"
                  : status === "ocupada"
                    ? "Ocupada"
                    : "Indisponível"}
            </p>
            {status === "reservada" && (
              <div className="flex items-center text-center gap-1 text-[10px]">
                <Clock3 className="w-2.5 h-2.5" />
                {reservationTime}
              </div>
            
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`relative w-full h-full flex ${
          isHorizontalFlipped ? "scale-x-[-1] scale-y-[-1]" : ""
        }`}
      >
        <div
          className={`absolute inset-0 bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm top-1 left-1 flex items-center justify-center text-white text-[10px] ${getTableNumberColor(status)}`}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

        <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
          <Armchair className="w-3 h-3" />
          <p className="text-[10px] leading-none text-center">{capacity}</p>
        </div>

        <div className="absolute bottom-0 left-1 flex flex-col justify-center">
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
          {status === "reservada" && (
            <div className="flex items-center text-center gap-1 text-[10px]">
                  <Clock3 className="w-2.5 h-2.5" />
                  {reservationTime}
                </div>
          )}
        </div>
      </div>
    );
  }
  if (type === "mesa_quadrada") {
    return (
      <div className="relative w-full h-full flex">
        <div
          className={`absolute inset-0 bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm top-1 left-1 flex items-center justify-center text-white text-[10px] ${getTableNumberColor(status)}`}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

        <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
          <Armchair className="w-3 h-3" />
          <p className="text-[10px] leading-none text-center">{capacity}</p>
        </div>

        <div className="absolute bottom-0 left-1 flex flex-col justify-center">
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
          {status === "reservada" && (
           <div className="flex items-center text-center gap-1 text-[10px]">
                  <Clock3 className="w-2.5 h-2.5" />
                  {reservationTime}
                </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
