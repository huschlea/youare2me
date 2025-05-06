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
import { CSS } from "@dnd-kit/utilities";

import ChipRow from "./ChipRow";
import { Invite } from "@/types/invite";
import { updatePositions } from "@/utils/updatePositions";

/* ---------- props ---------- */
type Props = {
  tributeId: string;
  invites?: Invite[];
};

/* ---------- component ---------- */
export default function InviteProgressPanel({ tributeId, invites }: Props) {
  const sensors = useSensors(useSensor(PointerSensor));

  /* keep local order for smooth DnD */
  const [order, setOrder] = useState<string[]>(() =>
    (invites ?? []).map((i) => i.id)
  );
  useEffect(() => setOrder((invites ?? []).map((i) => i.id)), [invites]);

  function handleDragEnd(evt: DragEndEvent) {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;

    const oldIdx = order.indexOf(active.id as string);
    const newIdx = order.indexOf(over.id as string);
    const next = arrayMove(order, oldIdx, newIdx);

    setOrder(next); // optimistic UI
    updatePositions(tributeId, next).catch(console.error);
  }

  if (!invites) {
    return <p className="p-4 text-neutral-400">Loading…</p>;
  }

  /* quick lookup by id */
  const rowsById = Object.fromEntries(invites.map((i) => [i.id, i]));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {order.map((id) => (
          <SortableChipRow key={id} id={id} invite={rowsById[id]} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

/* ---------- sortable wrapper around ChipRow ---------- */
function SortableChipRow({ id, invite }: { id: string; invite: Invite }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ChipRow invite={invite} />
    </div>
  );
}
