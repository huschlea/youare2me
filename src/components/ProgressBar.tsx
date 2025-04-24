import React from "react";

export const ProgressBar: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
    <div
      className="h-full bg-emerald-600 transition-all duration-300"
      style={{ width: `${pct}%` }}
    />
  </div>
);
