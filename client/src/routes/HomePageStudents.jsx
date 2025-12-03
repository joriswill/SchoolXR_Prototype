import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

function HomePageStudents() {
  const navigate = useNavigate();

  // collections: array of { _id: string, count: number }
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/annotations/collections/all");
        const data = await res.json();
        // Expecting [{ _id: 'name', count: N }, ...]
        setCollections(data || []);
      } catch (err) {
        console.error("Fehler beim Laden der Collections:", err);
        setError("Sammlungen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, []);

  return (
    <div className="flex flex-col items-center mt-16" style={{ minHeight: "100vh" }}>
      <h1 className="text-3xl mb-6">Schüler:innen Startseite</h1>

      <div className="w-full max-w-xl px-4">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-4">Verfügbare Sammlungen</h2>

          {loading && <div className="text-gray-500">Lade...</div>}
          {error && <div className="text-red-600 mb-4">{error}</div>}

          {!loading && collections.length === 0 && (
            <div className="text-sm text-gray-600">Keine Sammlungen gefunden.</div>
          )}

          <ul className="divide-y mt-2">
            {collections.map((c) => (
              <li key={c._id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c._id}</div>
                  <div className="text-sm text-gray-600">(Anzahl an Markierungen: {c.count || 0})</div>
                </div>
                <div>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => navigate("/final", { state: { collectionName: c._id } })}
                  >
                    Starten
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HomePageStudents;
