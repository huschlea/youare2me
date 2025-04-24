import React from "react";

interface Props {
  name: string;
  sent: boolean;
  attempts: number;
}

export const StatusChip: React.FC<Props> = ({ name, sent, attempts }) => {
  const color = sent
    ? "bg-emerald-600"
    : attempts > 0
      ? "bg-amber-500"
      : "bg-gray-300";

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {name}
    </div>
  );
};
