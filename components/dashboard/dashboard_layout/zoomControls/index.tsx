import { CircleQuestionMark, Plus, Minus, Keyboard } from "lucide-react";

type Props = {
  zoom: number;
  zoomInput: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onInputChange: (val: string) => void;
  onInputBlur: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  gridEnabled: boolean;
  onToggleGrid: () => void;
};

export default function ZoomControls({
  zoom,
  zoomInput,
  onZoomIn,
  onZoomOut,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
  gridEnabled,
  onToggleGrid,
}: Props) {
  return (
    <div className="flex items-center w-full gap-3">
      <div className="relative group flex items-center">
        <div
          className="
      border border-gray-200
      bg-white
      rounded-md
      transition-all
      h-9
      w-9
      cursor-pointer
      items-center
      justify-center
      flex
      hover:bg-gray-50
    "
        >
          <Keyboard className="w-5 h-5 text-gray-500" />
        </div>

        <div
          className="
      absolute
      right-full
      mr-3
      top-1/2
      -translate-y-1/2

      opacity-0
      invisible
      group-hover:opacity-100
      group-hover:visible

      transition-all
      duration-200

      bg-white
      border
      border-gray-200
      shadow-xl
      rounded-xl
      p-4
      w-70
      
      z-50
    "
        >
          <div
            className="
        absolute
        top-1/2
        -right-1.75
        -translate-y-1/2
        w-3
        h-3
        bg-white
        border-r
        border-b
        border-gray-200
        rotate-[-45deg]
      "
          />

          {/* <h3 className="text-md text-gray-600 mb-4">Estados</h3>

          <ul className="flex flex-col gap-3 items-start">
            <li className="flex items-center gap-2">
              <div className="border-2 border-[#6388b2] bg-[#EBF5FF] w-3.5 h-3.5 rounded-full"></div>
              <p className="text-[15px] text-gray-500">Livre</p>
            </li>
            <li className="flex items-center gap-2">
              <div className="border-2 border-[#e6b766] bg-[#f8eddc] w-3.5 h-3.5 rounded-full"></div>
              <p className="text-[15px] text-gray-500">Reservada</p>
            </li>
            <li className="flex items-center gap-2">
              <div className="border-2 border-[#A55B5F] bg-[#F7CBD1] w-3.5 h-3.5 rounded-full"></div>
              <p className="text-[15px] text-gray-500">Ocupada</p>
            </li>
            <li className="flex items-center gap-2">
              <div className="border-2 border-[#6D7387] bg-gray-100 w-3.5 h-3.5 rounded-full"></div>
              <p className="text-[15px] text-gray-500">Indisponível</p>
            </li>
          </ul> */}

<h3 className="text-md text-gray-600 mb-4">Atalhos</h3>

          <ul className="flex flex-col gap-2.5 items-start">
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">R</span>
              <p className="text-[13px] text-gray-500">Rotacionar selecionado</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">F</span>
              <p className="text-[13px] text-gray-500">Virar porta</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Delete</span>
              <p className="text-[13px] text-gray-500">Excluir selecionado</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Ctrl+C</span>
              <p className="text-[13px] text-gray-500">Copiar</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Ctrl+V</span>
              <p className="text-[13px] text-gray-500">Colar</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Ctrl+Z</span>
              <p className="text-[13px] text-gray-500">Desfazer</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Ctrl+Y</span>
              <p className="text-[13px] text-gray-500">Refazer</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Ctrl+S</span>
              <p className="text-[13px] text-gray-500">Salvar layout</p>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold text-[14px] text-[#19274b]">Esc</span>
              <p className="text-[13px] text-gray-500">Cancelar ação</p>
            </li>
          </ul>

        </div>
      </div>

      <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
        <button
          onClick={onZoomOut}
          className="px-2.25 py-2.25 hover:bg-gray-100 cursor-pointer"
        >
          <Minus className="w-4 h-4 text-[#19274b]" />
        </button>
        <input
          type="text"
          value={zoomInput + "%"}
          onChange={(e) => {
            const raw = e.target.value.replace("%", "");
            if (!/^\d*$/.test(raw)) return;
            onInputChange(raw);
          }}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          className="w-17.5 text-center text-sm outline-none"
        />
        <button
          onClick={onZoomIn}
          className="px-2.25 py-2.25 hover:bg-gray-100 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#19274b]" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">

        <button
          type="button"
          onClick={onToggleGrid}
          aria-pressed={gridEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
            gridEnabled ? "bg-(--color-primary)" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
              gridEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>

        <span className="text-sm text-gray-600">Alinhamento inteligente</span>


      </div>
    </div>
  );
}
