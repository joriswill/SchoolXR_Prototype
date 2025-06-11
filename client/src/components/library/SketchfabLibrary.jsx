import React, { useState, useEffect } from "react";
import { Button, Spinner, Card } from "flowbite-react";
import JSZip from "jszip";
import { HiUpload } from "react-icons/hi";
import UploadModal from "./UploadModal"; // Stelle sicher, dass der Pfad stimmt!
import SearchBar from "./SearchBar"; // Make sure this import path is correct

const SKETCHFAB_API_KEY = import.meta.env.VITE_SKETCHFAB_API_KEY;
const PAGE_SIZE = 24;

const SketchfabLibrary = ({ onModelSelect }) => {
  const [query, setQuery] = useState("biology");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [formatsMap, setFormatsMap] = useState({});
  const [showUpload, setShowUpload] = useState(false); // Upload modal state

  const fetchFormats = async (uid) => {
    if (formatsMap[uid]) return formatsMap[uid];

    try {
      const res = await fetch(
        `https://api.sketchfab.com/v3/models/${uid}/download`,
        {
          headers: { Authorization: `Token ${SKETCHFAB_API_KEY}` },
        }
      );

      if (!res.ok) return {};
      const data = await res.json();

      const formats = {
        glb: data.glb?.url || data.gltf?.url || data.zip?.url || null,
        usdz: data.usdz?.url || null,
        fbx: data.fbx?.url || null,
        obj: data.obj?.url || null,
      };

      setFormatsMap((prev) => ({ ...prev, [uid]: formats }));
      return formats;
    } catch {
      return {};
    }
  };

  const searchSketchfab = async (reset = false) => {
    const endpoint = reset
      ? `https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(
          query
        )}&downloadable=true&count=${PAGE_SIZE}`
      : nextUrl;

    if (!endpoint) return;

    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Token ${SKETCHFAB_API_KEY}` },
      });

      const data = await res.json();
      const newModels = data.results || [];

      setResults((prev) => (reset ? newModels : [...prev, ...newModels]));
      setNextUrl(data.next || null);
      setHasMore(!!data.next);
    } catch (err) {
      console.error("Fehler beim Laden der Modelle:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchSketchfab(true);
    // eslint-disable-next-line
  }, []);

  const handleSelectModel = async (model) => {
    const formats = await fetchFormats(model.uid);
    if (!formats) return;

    if (formats.glb) {
      onModelSelect({ glb: formats.glb, usdz: formats.usdz });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (formats.gltf || formats.zip) {
      try {
        const zipUrl = formats.gltf || formats.zip;
        const resp = await fetch(zipUrl);
        const blob = await resp.blob();
        const zip = await JSZip.loadAsync(blob);
        const gltfFile = Object.keys(zip.files).find((f) =>
          f.endsWith(".gltf")
        );
        if (!gltfFile) return;

        const gltfText = await zip.files[gltfFile].async("string");
        const gltfJson = JSON.parse(gltfText);

        if (gltfJson.images) {
          for (let img of gltfJson.images) {
            const imgFile = zip.files[img.uri];
            if (imgFile) {
              const imgBlob = await imgFile.async("blob");
              img.uri = URL.createObjectURL(imgBlob);
            }
          }
        }

        const newGltfBlob = new Blob([JSON.stringify(gltfJson)], {
          type: "model/gltf+json",
        });
        const newGltfUrl = URL.createObjectURL(newGltfBlob);

        onModelSelect({ gltf: newGltfUrl, glb: null, usdz: null });
      } catch (e) {
        alert("Fehler beim Entpacken der ZIP: " + e.message);
      }
    } else {
      alert("Kein .glb oder .gltf (ZIP) verfügbar.");
    }
  };

  // New handler for SearchBar
  const handleSearch = () => {
    searchSketchfab(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Modellbibliothek
      </h2>
      <p className="mb-3">
        Diese Bibliothek basiert auf den Daten von{" "}
        <a
          className=" text-blue-600 hover:underline"
          href="https://sketchfab.com"
        >
          Sketchfab
        </a>
        . Hier kannst du nach 3D-Modellen suchen, die du in deiner Anwendung
        verwenden kannst. Klicke auf "Hochladen", um deine eigenen Modelle
        hinzuzufügen oder um Modelle aus der Bibliothek anzuzeigen.
      </p>
      <div className="mb-6 flex items-center gap-2">
        <div className="w-full">
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearch}
          />
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 h-[56px]"
        >
          <HiUpload className="w-5 h-5" />
          Hochladen
        </button>
      </div>

      <UploadModal show={showUpload} onClose={() => setShowUpload(false)} />

      {loading && results.length === 0 && (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {results.map((model) => (
          <Card
            key={model.uid}
            imgAlt={model.name}
            imgSrc={model.thumbnails.images?.[0]?.url}
            className="hover:shadow-lg transition-all duration-200"
          >
            <div>
              <h5 className="text-md font-semibold tracking-tight text-gray-200 truncate">
                {model.name}
              </h5>
              <p className="text-sm text-gray-500">
                von {model.user.displayName}
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                size="xs"
                color="blue"
                onClick={() => handleSelectModel(model)}
              >
                Modell anzeigen
              </Button>
              <a
                href={`https://sketchfab.com/models/${model.uid}/embed`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-800 hover:underline"
              >
                Vorschau auf Sketchfab
              </a>
            </div>
          </Card>
        ))}
      </div>

      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <Button color="gray" onClick={() => searchSketchfab(false)}>
            Mehr laden
          </Button>
        </div>
      )}

      {loading && results.length > 0 && (
        <div className="flex justify-center mt-4">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default SketchfabLibrary;
