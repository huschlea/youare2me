import { Link, useParams } from "react-router-dom";

export default function InvitesSentPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Invites sent ✅</h1>
        <p className="text-gray-700">
          Friends &amp; family can now leave messages. You can always share the
          link:
        </p>
        <div className="bg-gray-100 rounded-md p-3 font-mono break-all">
          https://youare2me.dev/contribute/{id}
        </div>
        <Link to="/" className="text-indigo-600 hover:underline">
          Start another tribute
        </Link>
      </div>
    </main>
  );
}
