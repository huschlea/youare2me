// src/components/ChipRow.tsx
import { Invite } from "@/types/invite";
import StatusChip from "@/components/StatusChip";
import { PencilSquareIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

type Props = {
  invite: Invite;
  onEdit?: (id: string) => void;
  onResend?: (id: string) => void;
};

export default function ChipRow({ invite, onEdit, onResend }: Props) {
  const messageWritten = Boolean(invite.message);

  return (
    <div className="flex w-full items-center gap-2 rounded-md bg-white/5 py-1 px-2">
      {/* status: “written” if message exists, otherwise “pending” */}
      <StatusChip
        status={messageWritten ? "written" : "pending"}
        className="shrink-0"
      />

      {/* contributor name / email */}
      <span className="flex-1 truncate text-sm">
        {invite.display_name || invite.contact}
      </span>

      {/* subtle placeholder if message missing */}
      {!messageWritten && (
        <span className="text-xs italic text-neutral-400">
          — no message yet
        </span>
      )}

      {/* edit button */}
      <button
        onClick={() => onEdit?.(invite.id)}
        className="rounded p-1 hover:bg-white/10"
        aria-label="Edit contributor"
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>

      {/* resend button */}
      <button
        onClick={() => onResend?.(invite.id)}
        className="rounded p-1 hover:bg-white/10"
        aria-label="Resend invite"
      >
        <ArrowPathIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
