// src/App.tsx
import { Routes, Route } from "react-router-dom";

import NewTributeForm from "@/components/NewTributeForm";
import ShareInvitePage from "@/pages/ShareInvitePage";
import InvitesSentPage from "@/pages/InvitesSentPage";
import PreviewPage from "@/pages/PreviewPage"; // 👈 new import

export default function App() {
  return (
    <Routes>
      {/* Home → create a tribute */}
      <Route path="/" element={<NewTributeForm />} />
      {/* Tribute saved → invite contributors */}
      <Route path="/invite/:id" element={<ShareInvitePage />} />
      {/* Invites-sent progress screen */}
      <Route path="/invite/:id/sent" element={<InvitesSentPage />} />
      {/* Live preview & poster editor */}
      <Route path="/preview/:id" element={<PreviewPage />} />{" "}
      {/* 👈 new route */}
    </Routes>
  );
}
