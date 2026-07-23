import { UserRound, Armchair } from "lucide-react";
import {} from "../../../../utils/layout/tableContentRotation";
type TableOverlayProps = {
  type: "mesa_quadrada" | "mesa_retangular" | "mesa_redonda" | "mesa_l";

  tableNumber?: number;
  capacity?: number;
  status?: "livre" | "reservada" | "ocupada" | "indisponivel";

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

  isPreview,

  isVertical,
  isHorizontalFlipped,
  isVerticalFlipped,
  lCorner,
}: TableOverlayProps) {

  if (type === "mesa_redonda") {
    const overlayVisibility = isPreview
      ? "opacity-0 scale-90"
      : "opacity-100 scale-100";

    return (
      <div className="relative w-full h-full flex rounded-full">
        <div
          className={`absolute top-3 left-1/2 right-1/2 flex gap-1 items-center justify-center`}
        >
          <div
            className={`inset-0 w-fit max-w-6 h-4 rounded-sm flex items-center justify-center px-1.5 text-[10px] text-white ${
              status === "indisponivel"
                ? "bg-gray-700"
                : "bg-(--color-secondary)"
            }`}
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
  className={`absolute left-1/2 -translate-x-1/2 flex items-center justify-center ${
    status === "livre" ? "bottom-1" : "bottom-5"
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
</div>
      </div>
    );
  }

  if (type === "mesa_l") {
    return (
      <div className="relative w-full h-full flex">
        {/* NUMERO DA MESA*/}
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

${status === "indisponivel" ? "bg-gray-700" : "bg-(--color-secondary)"}

      `}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

        {/* CAPACIDADE */}
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

        {/* STATUS */}
        <div
          className={`absolute flex items-center justify-center

${
  lCorner === "top-left"
    ? "bottom-0.5 left-1.5"

    : lCorner === "top-right"
      ? status === "livre"
        ? "bottom-24.75 left-26 -rotate-90"
        : status === "reservada"
          ? "bottom-21.5 left-22.5 -rotate-90"
          : status === "ocupada"
            ? "bottom-22.5 left-23.5 -rotate-90"
            : "bottom-20.5 left-22 -rotate-90"

      : lCorner === "bottom-right"
        ? status === "livre"
          ? "bottom-26.25 left-24 rotate-180"
          : status === "reservada"
            ? "bottom-26.5 left-17 rotate-180"
            : status === "ocupada"
              ? "bottom-26.5 left-19 rotate-180"
              : "bottom-26.5 left-15.5 rotate-180"

        : status === "livre"
          ? "top-25 right-25.5 rotate-90"
          : status === "reservada"
            ? "top-21 right-22.25 rotate-90"
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
              className={`bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm flex items-center justify-center text-white text-[10px] ${status === "indisponivel" ? "bg-gray-700" : "bg-(--color-secondary)"}`}
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
  className={`absolute flex items-center justify-center -rotate-90
    ${
      status === "livre"
        ? "bottom-1.75 left-25.5"
        : status === "reservada"
          ? "bottom-5.25 left-22"
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
          className={`absolute inset-0 bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm top-1 left-1 flex items-center justify-center text-white text-[10px] ${status === "indisponivel" ? "bg-gray-700" : "bg-(--color-secondary)"}`}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

        <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
          <Armchair className="w-3 h-3" />
          <p className="text-[10px] leading-none text-center">{capacity}</p>
        </div>

        <div className="absolute bottom-0 left-1 flex items-center justify-center">
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
        </div>
      </div>
    );
  }
  if (type === "mesa_quadrada") {
    return (
      <div className="relative w-full h-full flex">
        <div
          className={`absolute inset-0 bg-(--color-secondary) w-fit max-w-6 px-1.5 h-4 rounded-sm top-1 left-1 flex items-center justify-center text-white text-[10px] ${status === "indisponivel" ? "bg-gray-700" : "bg-(--color-secondary)"}`}
        >
          <p className="text-[10px] leading-none text-center">{tableNumber}</p>
        </div>

        <div className="absolute top-1.5 right-1 flex gap-0.5 items-center justify-center">
          <Armchair className="w-3 h-3" />
          <p className="text-[10px] leading-none text-center">{capacity}</p>
        </div>

        <div className="absolute bottom-0 left-1 flex items-center justify-center">
          <p className="text-[10px] mt-0.5">
            {status === "livre"
              ? "Livre"
              : status === "reservada"
                ? "Reservada"
                : status === "ocupada"
                  ? "Ocupada"
                  : "Indisponível"}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
