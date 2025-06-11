import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function RoleBasedStart() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [auto, setAuto] = useState(false);
  const navigate = useNavigate();

  // Automatischer Login (whoami)
  useEffect(() => {
    if (auto) {
      setLoading(true);
      fetch("/api/whoami")
        .then((res) => res.json())
        .then((data) => setRole(data.role || "unknown"))
        .catch(() => setRole("unknown"))
        .finally(() => setLoading(false));
    }
  }, [auto]);

  // Weiterleitung nach Rolle
  if (role === "instructor") return <Navigate to="/teacher" replace />;
  if (role === "learner") return <Navigate to="/student" replace />;
  if (role && role !== "unknown") return <Navigate to="/" replace />;

  return (
    <div
      className="flex flex-col items-center gap-6 py-12"
      style={{ minHeight: "100vh" }}
    >
      <h2 className="text-2xl font-bold mb-4">Willkommen bei SchoolXR</h2>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          className="bg-green-600 hover:bg-green-800 text-white rounded-lg px-6 py-3 font-semibold"
          onClick={() => navigate("/instructor")}
        >
          Als Lehrkraft starten
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold"
          onClick={() => navigate("/learner")}
        >
          Als Schüler:in starten
        </button>

        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-6 py-3 font-semibold"
          onClick={() => setAuto(true)}
          disabled={loading}
        >
          Automatisch anmelden (whoami)
        </button>
      </div>
      {loading && <div className="mt-4 text-gray-500">Lade...</div>}
    </div>
  );
}

export default RoleBasedStart;
