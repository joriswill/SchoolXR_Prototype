import { useNavigate, useLocation } from "react-router-dom";
import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
// Oben in deiner Datei ergänzen (falls noch nicht vorhanden):
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "flowbite-react";
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
  const [highlightedHotspot, setHighlightedHotspot] = useState(null);
  const [correctHotspotIndex, setCorrectHotspotIndex] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  const handleHotspotClick = (hotspot, index) => {
    if (index === correctHotspotIndex) {
      setSelectedHotspot(hotspot);
      setHighlightedHotspot({ title: hotspot.title, color: "green" });
      setCorrectHotspotIndex(correctHotspotIndex + 1);
    } else {
      setHighlightedHotspot({ title: hotspot.title, color: "red" });
      setTimeout(() => setHighlightedHotspot(null), 1000);
    }
  };

  const handleAnswerSubmit = () => {
    if (correctHotspotIndex === hotspots.length) {
      setShowCompletionModal(true);
    }
  };

  return (
    <div
      className="relative w-full flex justify-center"
      style={{ minHeight: "100vh" }}
    >
      <InfoBanner text="ℹ Überprüfen Sie das Modell und die Hotspots. Klicken Sie auf den richtigen Hotspot, um Details und Aufgaben anzuzeigen." />

      <model-viewer
        ref={modelViewerRef}
        src={modelUrl?.glb || modelUrl?.gltf || defaultModel.glb}
        ios-src={modelUrl?.usdz || defaultModel.usdz}
        auto-rotate
        camera-controls
        shadow-intensity="1"
        exposure="1"
        interaction-prompt="none"
        style={{ width: "90vw", height: "70vh" }}
      >
        {hotspots.map((hotspot, index) => {
          let className = "hotspot-circle";
          let showTitle = false;

          if (highlightedHotspot?.title === hotspot.title) {
            className += ` hotspot-${highlightedHotspot.color}`;
          } else if (index < correctHotspotIndex) {
            className += " hotspot-green";
            showTitle = true;
          }

          return (
            <button
              key={index}
              className={className}
              slot={`hotspot-${index}`}
              data-position={hotspot.position.join(" ")}
              data-normal={hotspot.normal.join(" ")}
              data-visibility-attribute="visible"
              onClick={() => handleHotspotClick(hotspot, index)}
              aria-label={`Hotspot ${index + 1}`}
            >
              {showTitle && (
                <div className="hotspot-title">{hotspot.title}</div>
              )}
            </button>
          );
        })}
      </model-viewer>

      {/* Checkliste */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "2rem",
          background: "white",
          borderRadius: "0.5rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "1rem",
          border: "1px solid #e5e7eb",
          width: "20rem",
          zIndex: 40,
        }}
      >
        <div className="font-bold mb-2">Checkliste</div>
        <p className="text-sm text-gray-700 mb-4">
          Klicken Sie auf die Hotspots, um Details und Aufgaben anzuzeigen.
        </p>
        <ul className="space-y-2">
          {hotspots.map((hotspot, idx) => {
            const isFirstUnchecked = idx === correctHotspotIndex;
            const isChecked = idx < correctHotspotIndex;
            return (
              <li
                key={idx}
                className={`flex items-center gap-2 ${
                  isFirstUnchecked && !isChecked
                    ? "border border-blue-400 rounded px-2 py-1"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  readOnly
                  className="accent-blue-600"
                />
                <span>{hotspot.title}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Details zu ausgewähltem Hotspot */}
      {selectedHotspot && (
        <div
          style={{
            position: "absolute",
            top: "1rem",
            left: "2rem",
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
                placeholder="Antwort"
                required
                rows={6}
              />

              <div className="mt-4 flex justify-end">
                <Button color="gray" onClick={handleAnswerSubmit}>
                  Beantworten
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fertigstellungs-Modal */}
      {showCompletionModal && (
        <Modal
          show={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          size="md"
        >
          <ModalHeader>✅ Alle Aufgaben erledigt!</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              Du hast alle Hotspots erfolgreich bearbeitet und die Aufgaben
              abgeschlossen. Gut gemacht! 👍
            </p>
            <br />
            <p className="text-sm text-white">
              Du kannst jetzt die Anwendung beenden oder das Modell weiter
              erkunden.
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-end">
            <Button color="blue" onClick={() => setShowCompletionModal(false)}>
              Alles Klar!
            </Button>
          </ModalFooter>
        </Modal>
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
        .hotspot-circle::before {
          content: "";
          position: absolute;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background-color: white;
        }
        .hotspot-red::before {
          background-color: red;
        }
        .hotspot-green::before {
          background-color: green;
        }
        .hotspot-title {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}

export default FinalPage;
