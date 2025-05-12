// src/components/InviteProgressPanel.tsx
import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import ChipRow from "./ChipRow";
import EditMessageModal from "@/components/EditMessageModal";
import { Invite } from "@/types/invite";
import { updatePositions } from "@/utils/updatePositions";
import { useInviteStatuses } from "@/hooks/useInviteStatuses";
import { supabase } from "@/lib/supabaseClient"; // ← used by ManualEntryForm

type Props = { tributeId: string };

export default function InviteProgressPanel({ tributeId }: Props) {
  const invites = useInviteStatuses(tributeId);
  const sensors = useSensors(useSensor(PointerSensor));

  /** order = populated (message exists) first, then awaiting */
  const [order, setOrder] = useState<string[]>([]);

  /* rebuild order whenever invites change */
  useEffect(() => {
    if (!invites) return;

    const populated = invites
      .filter((i) => i.message?.trim()) // hidden rows stay here
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((i) => i.id);

    const awaiting = invites.filter((i) => !i.message?.trim()).map((i) => i.id);

    setOrder([...populated, ...awaiting]);
  }, [invites]);

  const [editing, setEditing] = useState<Invite | null>(null);

  /* ---- drag only within populated rows ---- */
  function handleDragEnd(evt: DragEndEvent) {
    if (!invites) return;
    const { active, over } = evt;
    if (!over || active.id === over.id) return;

    const rowsById = Object.fromEntries(invites.map((r) => [r.id, r]));
    const populatedIds = order.filter((id) => rowsById[id].message?.trim());
    const awaitingIds = order.filter((id) => !rowsById[id].message?.trim());

    if (!populatedIds.includes(active.id as string)) return; // ignore awaiting drags

    /* reorder populated group */
    const nextPopulated = arrayMove(
      populatedIds,
      populatedIds.indexOf(active.id as string),
      populatedIds.indexOf(over.id as string)
    );

    const fullOrder = [...nextPopulated, ...awaitingIds];

    /* 🌟 optimistic ­— update local positions so poster redraws instantly */
    fullOrder.forEach((id, idx) => {
      rowsById[id].position = idx;
    });

    setOrder(fullOrder);
    updatePositions(tributeId, fullOrder).catch(console.error);
  }
  /* ----------------------------------------- */

  if (!invites) return <p className="p-4 text-neutral-400">Loading…</p>;

  const rowsById = Object.fromEntries(invites.map((i) => [i.id, i]));
  const populatedIds = order.filter((id) => rowsById[id].message?.trim());
  const awaitingIds = order.filter((id) => !rowsById[id].message?.trim());

  return (
    <>
      {/* POPULATED (draggable) */}
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={populatedIds}
          strategy={verticalListSortingStrategy}
        >
          {populatedIds.map((id) => (
            <SortableChipRow
              key={id}
              id={id}
              invite={rowsById[id]}
              onEdit={() => setEditing(rowsById[id])}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* divider */}
      {awaitingIds.length > 0 && (
        <hr className="my-2 border-t border-neutral-300" />
      )}

      {/* AWAITING (static) */}
      {awaitingIds.map((id) => (
        <ChipRow
          key={id}
          invite={rowsById[id]}
          onEdit={() => setEditing(rowsById[id])}
        />
      ))}

      {/* manual entry + modal */}
      <ManualEntryForm tributeId={tributeId} />
      <EditMessageModal
        open={Boolean(editing)}
        invite={editing}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

/* ---------- sortable wrapper ---------- */
function SortableChipRow({
  id,
  invite,
  onEdit,
}: {
  id: string;
  invite: Invite;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px,${transform.y}px,0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ChipRow
        invite={invite}
        onEdit={onEdit}
        listeners={listeners}
        attributes={attributes}
      />
    </div>
  );
}

/* ---------- ManualEntryForm ---------- */
function ManualEntryForm({ tributeId }: { tributeId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave() {
    if (!name.trim() || !message.trim()) return;

    const sentinel = `manual+${crypto.randomUUID()}@example.com`;
    await supabase.from("invites").insert({
      tribute_id: tributeId,
      display_name: name.trim(),
      contact: sentinel,
      contact_type: "email",
      message: message.trim(),
      role: "contributor",
      sent: true,
      position: 9999,
    });

    setOpen(false);
    setName("");
    setMessage("");
  }

  return open ? (
    <div className="mt-4 space-y-2 rounded bg-gray-50 p-3 shadow-inner">
      <input
        className="w-full rounded border px-2 py-1 text-sm"
        placeholder="Contributor name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        className="w-full resize-none rounded border px-2 py-1 text-sm"
        placeholder='Sentence completion (e.g. "is always there for me")'
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <button
          className="text-xs text-gray-600 hover:underline"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
        <button
          className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="mt-4 w-full rounded bg-white/10 py-1 text-center text-xs font-medium text-indigo-600 hover:bg-white/20"
    >
      + Add manual entry
    </button>
  );
}
