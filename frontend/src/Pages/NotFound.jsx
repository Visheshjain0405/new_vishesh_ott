import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="text-center px-6">
        <h1 className="text-6xl font-black text-white mb-2">404</h1>
        <p className="text-zinc-400 mb-6">The page you’re looking for doesn’t exist.</p>
        <Link
          to="/homepage"
          className="px-5 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
