// src/components/AllSentBanner.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "lucide-react";

import { useInviteStatuses } from "@/hooks/useInviteStatuses";
import { useSession } from "@/hooks/useSession"; // ⬅️ local hook
import AuthModal from "@/components/AuthModal";

interface Props {
  tributeId: string;
}

export default function AllSentBanner({ tributeId }: Props) {
  const session = useSession(); // null if not authenticated
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const rows = useInviteStatuses(tributeId);
  const allSent = rows.length > 0 && rows.every((r) => r.sent);

  if (!allSent) return null;

  const goPreview = () => navigate(`/preview/${tributeId}`);

  function handleClick() {
    if (session) {
      goPreview();
    } else {
      setShowAuth(true);
    }
  }

  return (
    <>
      <div
        onClick={handleClick}
        className="flex cursor-pointer items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800 shadow hover:bg-emerald-100"
      >
        <CheckCircleIcon className="h-5 w-5 shrink-0" />
        <span className="font-medium">
          All invites sent! Tap to preview &amp; customize →
        </span>
      </div>

      {showAuth && (
        <AuthModal onSuccess={goPreview} onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}
