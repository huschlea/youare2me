import { ReactNode } from "react";

export default function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-96 rounded-lg bg-white p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
