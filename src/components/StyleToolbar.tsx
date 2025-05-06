// src/components/StyleToolbar.tsx
import { setAccentColor } from "@/utils/setAccentColor";

const swatches = [
  "#0f766e",
  "#9333ea",
  "#dc2626",
  "#2563eb",
  "#d97706",
  "#16a34a",
];

export default function StyleToolbar({
  tributeId,
  current,
}: {
  tributeId: string;
  current: string;
}) {
  return (
    <div className="flex gap-2 p-4 border-t">
      {swatches.map((hex) => (
        <button
          key={hex}
          onClick={() => setAccentColor(tributeId, hex)}
          className="h-6 w-6 rounded-full"
          style={{
            backgroundColor: hex,
            outline: hex === current ? "2px solid black" : "none",
          }}
        />
      ))}
    </div>
  );
}
