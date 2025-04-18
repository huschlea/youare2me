import { Routes, Route } from "react-router-dom";
import NewTributeForm from "./components/NewTributeForm";
import ShareInvitePage from "./pages/ShareInvitePage"; // we just created this

export default function App() {
  return (
    <Routes>
      {/* Home → create a tribute */}
      <Route path="/" element={<NewTributeForm />} />

      {/* Success screen → shows after DB insert */}
      <Route path="/invite/:id" element={<ShareInvitePage />} />
    </Routes>
  );
}
