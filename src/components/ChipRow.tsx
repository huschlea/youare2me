// src/components/ChipRow.tsx
import { Invite } from "@/types/invite";
import { supabase } from "@/lib/supabaseClient";

import StatusChip from "@/components/StatusChip";
import {
  Bars3Icon,
  PencilSquareIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type { SyntheticListeners, DraggableAttributes } from "@dnd-kit/core"; // ← NEW: precise types

type Props = {
  invite: Invite;
  onEdit?: (id: string) => void;
  listeners?: SyntheticListeners; // ← replace any
  attributes?: DraggableAttributes; // ← replace any
};

export default function ChipRow({
  invite,
  onEdit,
  listeners,
  attributes,
}: Props) {
  const messageWritten = Boolean(invite.message);
  const { last_error } = invite;

  /* optimistic hide/show */
  async function toggleHidden() {
    invite.hidden = !invite.hidden;
    await supabase
      .from("invites")
      .update({ hidden: invite.hidden })
      .eq("id", invite.id);
  }

  return (
    <div className="flex w-full items-center gap-2 rounded-md bg-white/5 py-1 px-2">
      {/* drag handle */}
      {messageWritten && (
        <Bars3Icon
          {...listeners}
          {...attributes}
          className="h-4 w-4 shrink-0 cursor-grab text-neutral-400 active:cursor-grabbing"
        />
      )}

      {/* status dot */}
      <StatusChip
        status={messageWritten ? "written" : "pending"}
        className="shrink-0"
      />

      {/* contributor name */}
      <span className="flex-1 truncate text-sm">
        {invite.display_name || invite.contact}
      </span>

      {/* error tooltip */}
      {last_error && (
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs text-xs">
            {last_error}
          </TooltipContent>
        </Tooltip>
      )}

      {/* edit pencil */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(invite.id);
        }}
        className="rounded p-1 hover:bg-white/10"
        aria-label="Edit contribution"
      >
        <PencilSquareIcon className="h-4 w-4" />
      </button>

      {/* eye toggle OR hourglass */}
      {messageWritten ? (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleHidden();
          }}
          className="rounded p-1 hover:bg-white/10"
          aria-label={invite.hidden ? "Show contribution" : "Hide contribution"}
        >
          {invite.hidden ? (
            <EyeSlashIcon className="h-4 w-4 opacity-60" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      ) : (
        <ClockIcon className="h-4 w-4 text-neutral-400 opacity-60" />
      )}
    </div>
  );
}
