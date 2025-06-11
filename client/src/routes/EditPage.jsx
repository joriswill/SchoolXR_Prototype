import { useNavigate, useLocation } from "react-router-dom";
import "@google/model-viewer";
import { useEffect, useRef, useState } from "react";
import { HiArrowLeft, HiArrowRight, HiPencil } from "react-icons/hi";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  TextInput,
  Textarea,
} from "flowbite-react";
import InfoBanner from "../components/UI/Banner";

function EditPage() {
  const location = useLocation();
  const modelViewerRef = useRef(null);
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

  const [modalOpen, setModalOpen] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [task, setTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [unsavedHotspots, setUnsavedHotspots] = useState([]);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [originalCollectionName, setOriginalCollectionName] = useState("");
  const [availableCollections, setAvailableCollections] = useState([]);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    let mouseDownTime = 0;

    const handleMouseDown = () => {
      mouseDownTime = Date.now();
    };

    const handleMouseUp = async (event) => {
      const clickDuration = Date.now() - mouseDownTime;
      if (clickDuration >= 300) return; // zu lang – kein Modal

      const hit = await viewer.positionAndNormalFromPoint(
        event.clientX,
        event.clientY
      );
      if (!hit) return;

      setPendingHotspot({
        posArray: [
          hit.position.x.toFixed(4),
          hit.position.y.toFixed(4),
          hit.position.z.toFixed(4),
        ],
        normArray: [
          hit.normal.x.toFixed(4),
          hit.normal.y.toFixed(4),
          hit.normal.z.toFixed(4),
        ],
      });

      setTitle("");
      setDescription("");
      setTask("");
      setEditIndex(null);
      setModalOpen(true);
    };

    viewer.addEventListener("mousedown", handleMouseDown);
    viewer.addEventListener("mouseup", handleMouseUp);

    const fetchCollections = async () => {
      try {
        // Nur Collections für das aktuelle Modell laden!
        const res = await fetch(
          `/api/annotations/collections/model/${modelId}`
        );
        const data = await res.json();
        setAvailableCollections(data.map((c) => c._id));
      } catch (err) {
        console.error("Fehler beim Laden der Collections:", err);
      }
    };
    fetchCollections();

    return () => {
      viewer.removeEventListener("mousedown", handleMouseDown);
      viewer.removeEventListener("mouseup", handleMouseUp);
    };
  }, [modelUrl]);

  const loadCollection = async (name) => {
    setCollectionName(name);
    setOriginalCollectionName(name);
    try {
      const res = await fetch(`/api/annotations/by-collection/${name}`);
      const data = await res.json();
      setUnsavedHotspots(data);

      const viewer = modelViewerRef.current;
      if (!viewer) return;

      Array.from(viewer.children).forEach((child) => {
        if (child.classList.contains("hotspot")) viewer.removeChild(child);
      });

      data.forEach((hotspot) => {
        const id = `hotspot-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 5)}`;
        const container = document.createElement("div");
        container.className = "hotspot";
        container.slot = id;

        const titleEl = document.createElement("div");
        titleEl.className = "hotspot-title";
        titleEl.innerText = hotspot.title;
        container.appendChild(titleEl);

        container.setAttribute("data-position", hotspot.position.join(" "));
        container.setAttribute("data-normal", hotspot.normal.join(" "));
        viewer.appendChild(container);
      });
    } catch (err) {
      console.error("Fehler beim Laden der Annotationen:", err);
    }
  };

  const handleEditHotspot = (index) => {
    const hs = unsavedHotspots[index];
    setEditIndex(index);
    setTitle(hs.title);
    setDescription(hs.description);
    setTask(hs.task);
    setPendingHotspot({
      posArray: hs.position,
      normArray: hs.normal,
    });
    setModalOpen(true);
  };

  const handleSaveHotspot = () => {
    if (!pendingHotspot || !title) return;

    const updatedHotspot = {
      modelId,
      title,
      description,
      task,
      position: pendingHotspot.posArray,
      normal: pendingHotspot.normArray,
    };

    if (editIndex !== null) {
      const updated = [...unsavedHotspots];
      updated[editIndex] = updatedHotspot;
      setUnsavedHotspots(updated);
    } else {
      const viewer = modelViewerRef.current;
      const id = `hotspot-${Date.now()}`;

      const container = document.createElement("div");
      container.className = "hotspot";
      container.slot = id;

      const titleEl = document.createElement("div");
      titleEl.className = "hotspot-title";
      titleEl.innerText = title;
      container.appendChild(titleEl);

      container.setAttribute(
        "data-position",
        pendingHotspot.posArray.join(" ")
      );
      container.setAttribute("data-normal", pendingHotspot.normArray.join(" "));
      viewer.appendChild(container);

      setUnsavedHotspots((prev) => [...prev, updatedHotspot]);
    }

    setModalOpen(false);
    setPendingHotspot(null);
    setTitle("");
    setDescription("");
    setTask("");
    setEditIndex(null);
  };

  const handleSaveAllAndNext = () => {
    if (unsavedHotspots.length === 0) {
      navigate("/final", { state: { modelUrl, collectionName } });
      return;
    }
    setCollectionModalOpen(true);
  };

  const confirmSaveCollection = async () => {
    if (!collectionName.trim()) return;

    try {
      await fetch("/api/annotations/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionName, annotations: unsavedHotspots }),
      });
      navigate("/final", { state: { modelUrl, collectionName } });
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      alert("Fehler beim Speichern der Annotationen!");
    }
  };

  return (
    <div
      className="flex justify-center items-start flex-row w-full relative"
      style={{ minHeight: "100vh"}}
    >
  <InfoBanner
  style={{
    zIndex: 9999,
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
  }}
  text="ℹ Klicken Sie auf das Modell, um einen Punkt hinzuzufügen. Dort können Sie eine Notiz oder Aufgabe eintragen."
/>
      <div className="flex flex-col">
        <model-viewer
          ref={modelViewerRef}
          id="model-viewer"
          src={modelUrl?.glb || modelUrl?.gltf || defaultModel.glb}
          ios-src={modelUrl?.usdz || defaultModel.usdz}
          alt="Modell"
          auto-rotate
          camera-controls
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="none"
          style={{ width: "90vw", height: "70vh", pointerEvents: "auto" }}
        ></model-viewer>
      </div>

      <div className="mt-4 flex flex-col gap-4 w-full px-4 md:absolute md:top-4 md:right-0 md:w-[20rem] md:px-0 z-40">
        {unsavedHotspots.length === 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              width: "20rem",
             
            }}
          >
            <div className="font-bold mb-1">Noch keine Annotationen</div>
            <div className="text-sm mb-1">
              Klicken Sie auf das Modell, um einen neuen Punkt zu setzen.
            </div>
            <div className="text-xs text-gray-400 italic">
              Hinweis: Hotspots erscheinen hier nach dem Speichern.
            </div>
          </div>
        )}

        {unsavedHotspots.map((hotspot, idx) => (
          <div
            key={idx}
            style={{
              background: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "1rem",
              border: "1px solid #e5e7eb",
              width: "20rem",
              zIndex: 40,
              marginBottom: "0.5rem",
            }}
          >
            <div className="font-bold mb-1">{hotspot.title}</div>
            <div className="text-sm text-gray-700 mb-1">
              {hotspot.description}
            </div>
            {hotspot.task && (
              <div className="text-xs text-blue-700 italic mb-1">
                Aufgabe: {hotspot.task}
              </div>
            )}
            <div className="text-xs text-gray-400">
              Pos: {hotspot.position.join(", ")}
            </div>

            <div
              onClick={() => handleEditHotspot(idx)}
              className="text-xs text-gray-400 flex items-center gap-1 mt-2 cursor-pointer hover:text-blue-600"
            >
              Bearbeiten
              <HiPencil />
            </div>
          </div>
        ))}
      </div>

      <Modal
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        size="md"
        popup
      >
        <ModalHeader>
          {editIndex !== null ? "Hotspot bearbeiten" : "Hotspot hinzufügen"}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Titel
              </label>
              <TextInput
                placeholder="z.B. 'Pilea Pflanze'"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Beschreibung
              </label>
              <Textarea
                placeholder="Optional: z.B. 'Dies ist eine Pilea Pflanze'"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Aufgabe
              </label>
              <Textarea
                placeholder="Optional: z.B. 'Beschreibe die Pflanze'"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setModalOpen(false)}>
            Abbrechen
          </Button>
          <Button color="red" onClick={() => setCollectionModalOpen(false)}>
            Löschen
          </Button>
          <Button color="blue" onClick={handleSaveHotspot} disabled={!title}>
            {editIndex !== null ? "Aktualisieren" : "Speichern"}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        show={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
        size="md"
        popup
      >
        <ModalHeader>Sammlungsname eingeben</ModalHeader>
        <ModalBody>
          <TextInput
            label="Name der Sammlung"
            placeholder="z.B. 'Version 1' oder 'Lektion Pflanzen'"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            required
          />
        </ModalBody>
        <ModalFooter>
          <Button color="gray" onClick={() => setCollectionModalOpen(false)}>
            Abbrechen
          </Button>

          <Button
            color="blue"
            onClick={confirmSaveCollection}
            disabled={!collectionName.trim()}
          >
            Speichern & Weiter
          </Button>
        </ModalFooter>
      </Modal>

      <div className="fixed bottom-6 left-6 z-50">
        {availableCollections.length > 0 && (
          <div className="bg-white shadow p-2 rounded w-80">
            {" "}
            {/* w-80 für mehr Breite */}
            <label className="block mb-1 text-sm text-gray-700">
              Gespeicherte Sammlungen:
            </label>
            <select
              value={collectionName}
              onChange={(e) => loadCollection(e.target.value)}
              className="border border-gray-300 rounded p-1 text-sm w-full" // w-full für Dropdown
            >
              <option value="">Wähle eine Sammlung</option>
              {availableCollections.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        <button
          className="bg-white hover:bg-gray-200 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
          onClick={() =>
            navigate("/select", {
              state: { modelUrl: modelUrl || defaultModel },
            })
          }
        >
          <HiArrowLeft color="grey" />
        </button>
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl ${
            !modelUrl ? "opacity-20 cursor-not-allowed" : ""
          }`}
          onClick={handleSaveAllAndNext}
          disabled={!modelUrl}
        >
          <HiArrowRight color="white" />
        </button>
      </div>

      <style>
        {`
        .hotspot {
          background: white;
          border-radius: 8px;
          padding: 6px 10px;
          border: 1px solid black;
          font-size: 12px;
          max-width: 200px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .hotspot-title {
          font-weight: bold;
          margin-bottom: 4px;
        }
        .hotspot-description {
          font-size: 11px;
          color: #333;
        }
      `}
      </style>
    </div>
  );
}

export default EditPage;
