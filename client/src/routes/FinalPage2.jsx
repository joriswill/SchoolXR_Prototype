import { useNavigate, useLocation } from "react-router-dom";
import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { Textarea } from "flowbite-react";
import InfoBanner from "../components/UI/Banner.jsx";

function FinalPage() {
  const location = useLocation();
  const modelViewerRef = useRef();
  const modelUrl = location.state?.modelUrl;
  const navigate = useNavigate();

  const defaultModel = {
    glb: "/main/assets/pilea.glb",
    usdz: "/main/assets/pilea.usdz",
  };

  const cleanModelId = (url) => url?.split("/").pop().split("?")[0];
  const modelId = cleanModelId(
    modelUrl?.glb || modelUrl?.gltf || defaultModel.glb
  );
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const collectionName = location.state?.collectionName;

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const res = await fetch(
          `/api/annotations/by-collection/${encodeURIComponent(collectionName)}`
        );
        const data = await res.json();
        setHotspots(data || []);
      } catch (err) {
        console.error("Fehler beim Laden der Annotationen:", err);
      }
    };

    if (collectionName) fetchHotspots();
  }, [collectionName]);

  return (
    <div
      className="relative w-full flex justify-center"
      style={{ minHeight: "100vh" }}
    >
      {/* {hotspots.map((hotspot, index) => (
        <button
          key={index}
          className={`hotspot${
            selectedHotspot === hotspot ? " hotspot-selected" : ""
          }`}
          slot={`hotspot-${index}`}
          data-position={hotspot.position.join(" ")}
          data-normal={hotspot.normal.join(" ")}
          data-visibility-attribute="visible"
          onClick={() => setSelectedHotspot(hotspot)}
        >
          <div className="hotspot-title">{hotspot.title}</div>
        </button>
      ))} */}

      {hotspots.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "0rem",

            background: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "1rem",
            border: "1px solid #e5e7eb",
            width: "20rem",
            zIndex: 40,
          }}
        >
          <div className="font-bold mb-1">Beispiel-Hotspot</div>
          <div className="text-sm text-gray-700 mb-3">
            Es wurden keine Hotspots gefunden. Dies ist ein Platzhalter mit
            Beispielinhalt.
          </div>
          <div className="font-bold text-blue-700 mt-5">
            <div className="mb-2">Beispiel-Aufgabe:</div>
            <Textarea
              style={{ backgroundColor: "#f0f4ff" }}
              placeholder="Was könnte an dieser Stelle erscheinen?"
              rows={5}
            />
          </div>
        </div>
      )}
      <InfoBanner text="ℹ Überprüfen Sie das Modell und die Hotspots. Klicken Sie auf einen Hotspot, um Details und Aufgaben anzuzeigen. Nutzen Sie die Pfeile unten rechts, um zurück zur Bearbeitung zu gehen oder das Modell fertig zu stellen." />
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl?.glb || modelUrl?.gltf || defaultModel.glb}
        ios-src={modelUrl?.usdz || defaultModel.usdz}
        auto-rotate
        camera-controls
        disable-zoom
        shadow-intensity="1"
        exposure="1"
        interaction-prompt="none"
        style={{ width: "90vw", height: "70vh", pointerEvents: "none" }}
      >
        {hotspots.map((hotspot, index) => (
          <button
            key={index}
            className={`hotspot${
              selectedHotspot === hotspot ? " hotspot-selected" : ""
            }`}
            slot={`hotspot-${index}`}
            data-position={hotspot.position.join(" ")}
            data-normal={hotspot.normal.join(" ")}
            data-visibility-attribute="visible"
            onClick={() => setSelectedHotspot(hotspot)}
          >
            <div className="hotspot-title">{hotspot.title}</div>
          </button>
        ))}
      </model-viewer>

      {selectedHotspot && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            right: "2rem", // weiter rechts (z.B. 2rem Abstand vom rechten Rand)
            background: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            padding: "1rem",
            border: "1px solid #e5e7eb",
            width: "20rem",
            zIndex: 40,
          }}
        >
          <div className="font-bold mb-1">{selectedHotspot.title}</div>
          <div className="text-sm text-gray-700">
            {selectedHotspot.description}
          </div>
          {selectedHotspot.task && (
            <div className="font-bold text-blue-700 mt-5">
              <div className="mb-2">{selectedHotspot.task}</div>
              <Textarea
                style={{ backgroundColor: "#f0f4ff" }}
                id="comment"
                placeholder="Antwort"
                required
                rows={6}
              />
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        <button
          className="bg-white hover:bg-gray-200 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
          onClick={() =>
            navigate("/edit", { state: { modelUrl: modelUrl || defaultModel } })
          }
        >
          <HiArrowLeft color="grey" />
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
          onClick={() => navigate("/")}
        >
          <HiArrowRight color="white" />
        </button>
      </div>

      <style>{`
        .hotspot {
          background: white;
          border-radius: 8px;
          padding: 6px 10px;
          border: 1px solid black;
          font-size: 12px;
          max-width: 220px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: background 0.2s, color 0.2s, border 0.2s;
        }
        .hotspot-selected {
          background: #2563eb;
          color: white;
          border: 1px solid #2563eb;
        }
        .hotspot-title {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

export default FinalPage;
