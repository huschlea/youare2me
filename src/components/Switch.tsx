import * as React from "react";

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
  /** Optional additional classes */
  className?: string;
}

/**
 * Accessible tailwind-styled toggle.
 * Keeps zero business logic inside—just UI.
 */
export default function Switch({
  checked,
  disabled = false,
  onCheckedChange,
  className = "",
}: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${checked ? "bg-indigo-600" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}
