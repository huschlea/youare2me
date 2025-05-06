// src/components/StatusChip.tsx
import React from "react";

interface StatusChipProps {
  /** Friendly name the contributor typed (may be null/undefined). */
  displayName?: string | null;
  /** Raw e-mail or phone; always present. */
  contact: string;
  sent?: boolean;
  attempts?: number;
  invalid?: boolean;
  /** Shows a × icon when provided. */
  onClose?: () => void;
}

/**
 * Pill that reflects invite state.
 * Label logic: displayName → contact  (never blank).
 */
const StatusChip: React.FC<StatusChipProps> = ({
  displayName,
  contact,
  sent = false,
  attempts = 0,
  invalid = false,
  onClose,
}) => {
  const label = displayName?.trim() || contact;

  const colorClass = invalid
    ? "bg-red-500 text-white"
    : sent
      ? "bg-emerald-600 text-white"
      : attempts > 0
        ? "bg-amber-500 text-white"
        : "bg-gray-300 text-gray-800";

  return (
    <span
      title={invalid ? "Invalid contact" : label}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
    >
      {label}
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
