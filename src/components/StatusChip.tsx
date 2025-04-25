// src/components/StatusChip.tsx
import React from "react";

interface StatusChipProps {
  name: string;
  sent?: boolean;
  attempts?: number;
  invalid?: boolean;
  /** optional close handler (shows × if present) */
  onClose?: () => void;
}

const StatusChip: React.FC<StatusChipProps> = ({
  name,
  sent = false,
  attempts = 0,
  invalid = false,
  onClose,
}) => {
  const colorClass = invalid
    ? "bg-red-500 text-white"
    : sent
      ? "bg-emerald-600 text-white"
      : attempts > 0
        ? "bg-amber-500 text-white"
        : "bg-gray-300 text-gray-800";

  return (
    <span
      title={invalid ? "Invalid contact" : name}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
    >
      {name}
      {invalid && <span className="font-bold">!</span>}
      {onClose && (
        <button
          type="button"
          aria-label="Remove"
          onClick={onClose}
          className="ml-1 hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default StatusChip;
