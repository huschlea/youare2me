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

type Props = {
  tributeId: string;
  current: string;
  onChange?: (hex: string) => void; // ← accept the callback
};

export default function StyleToolbar({ tributeId, current, onChange }: Props) {
  return (
    <div className="flex gap-2 border-t p-4">
      {swatches.map((hex) => (
        <button
          key={hex}
          onClick={() => {
            /* instant UI feedback */
            onChange?.(hex); // ← call it
            /* persist to DB */
            setAccentColor(tributeId, hex).catch(console.error);
          }}
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
