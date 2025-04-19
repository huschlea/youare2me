import { Routes, Route } from "react-router-dom";
import NewTributeForm from "./components/NewTributeForm";
import ShareInvitePage from "./pages/ShareInvitePage";
import InvitesSentPage from "@/pages/InvitesSentPage"; // already imported ✅

export default function App() {
  return (
    <Routes>
      {/* Home → create a tribute */}
      <Route path="/" element={<NewTributeForm />} />
      {/* Tribute saved → invite contributors */}
      <Route path="/invite/:id" element={<ShareInvitePage />} />
      {/* Invites sent confirmation */}
      <Route path="/invite/:id/sent" element={<InvitesSentPage />} />{" "}
      {/* NEW */}
    </Routes>
  );
}
