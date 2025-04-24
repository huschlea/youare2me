import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  onSuccess: (
    session: Awaited<
      ReturnType<typeof supabase.auth.getSession>
    >["data"]["session"]
  ) => void;
  onClose: () => void;
}

export default function AuthModal({ onSuccess, onClose }: Props) {
  const [phase, setPhase] = useState<"EMAIL" | "OTP">("EMAIL");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 1️⃣ request OTP email */
  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.href, // so magic-link still works if they click it
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    setPhase("OTP");
  };

  /* 2️⃣ verify 6-digit code */
  const verifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error || !data.session)
      return setError(error?.message ?? "Invalid code");
    onSuccess(data.session); // bubble up
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-xl bg-white p-6 space-y-4">
        {phase === "EMAIL" ? (
          <>
            <h2 className="text-lg font-bold text-center">Sign in to save</h2>
            <input
              type="email"
              className="w-full border rounded p-2"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={sendOtp}
              disabled={!email || loading}
              className="w-full bg-indigo-600 text-white py-2 rounded disabled:bg-indigo-300"
            >
              {loading ? "Sending…" : "Send 6-digit Code"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-center">Check your inbox</h2>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              className="w-full border rounded p-2 tracking-widest text-center"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <button
              onClick={verifyOtp}
              disabled={code.length !== 6 || loading}
              className="w-full bg-emerald-600 text-white py-2 rounded disabled:bg-emerald-300"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
          </>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <button
          onClick={onClose}
          className="block mx-auto mt-2 text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
