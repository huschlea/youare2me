import { Contact } from "@/hooks/useContactsParser";

interface Props {
  contact: Contact;
}

export default function ContactPreviewItem({ contact }: Props) {
  const { raw, type, valid } = contact;
  const color = valid ? "text-green-600" : "text-red-600";
  const icon = valid ? "✓" : "✕";

  return (
    <li className="flex items-center gap-2">
      <span className={`${color}`}>{icon}</span>
      <span className="font-mono">{raw}</span>
      <span className="text-xs text-gray-500">({type})</span>
    </li>
  );
}
