import { PencilRuler, Undo2, Redo2, CircleQuestionMark } from "lucide-react";

type Props = {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
};

export default function ToolbarActions({ onUndo, onRedo, onSave }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          className="bg-white border border-gray-200 text-[#19274b] flex items-center justify-center p-2.5 py-2.5 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          className="bg-white border border-gray-200 text-[#19274b] flex items-center justify-center p-2.5 py-2.5 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center">
        <button
          onClick={onSave}
          className="flex items-center gap-4 bg-(--color-primary) text-white text-sm font-semibold px-5 py-2.5 rounded-md hover:bg-(--color-secondary) transition-all cursor-pointer"
        >
          <PencilRuler className="w-4 h-4 text-white" />
          Salvar layout
        </button>
      </div>
    </div>
  );
}
