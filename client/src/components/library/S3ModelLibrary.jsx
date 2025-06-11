import React, { useState, useEffect } from "react";
import { Button, Spinner, Card } from "flowbite-react";
import "@google/model-viewer";
import { HiUpload } from "react-icons/hi";
import SearchBar from "./SearchBar";
import UploadModal from "./UploadModal";

const S3ModelLibrary = ({ onModelSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allModels, setAllModels] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "https://webxr-3d-models.s3.eu-north-1.amazonaws.com/models/models.json"
        );
        const data = await res.json();
        setAllModels(data);
        setResults(data);
      } catch (err) {
        console.error("Fehler beim Laden der Modelle:", err);
      }
      setLoading(false);
    };

    fetchModels();
  }, []);

  const handleSearch = () => {
    const filtered = allModels.filter((model) =>
      model.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  const renderFormats = (model) => (
    <div className="flex gap-1 flex-wrap mt-2">
      {model.glb && (
        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded">
          GLB
        </span>
      )}
      {model.usdz && (
        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded">
          USDZ
        </span>
      )}
      {!model.glb && !model.usdz && (
        <span className="text-xs text-gray-400">Keine Formate verfügbar</span>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Eigene Modelle</h2>
      <p className="mb-3">
        Hier werden deine hochgeladenen Modelle gespeichert.
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

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner size="xl" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-8">
        {results.map((model) => (
          <Card
            key={model.id}
            imgAlt={model.name}
            className="hover:shadow-lg transition-all duration-200 flex flex-col justify-between aspect-square"
          >
            <div>
              <h5 className="text-md font-semibold tracking-tight text-white truncate">
                {model.name}
              </h5>
            </div>
            <div className="flex-1 flex items-center justify-center my-2">
              {model.glb && (
                <model-viewer
                  src={model.glb}
                  ios-src={model.usdz}
                  alt={model.name}
                  auto-rotate
                  style={{
                    width: "100%",
                    height: "100px",
                    background: "#FFFFF",
                  }}
                  shadow-intensity="1"
                  exposure="1"
                ></model-viewer>
              )}
            </div>

            {renderFormats(model)}

            <Button
              size="xs"
              color="blue"
              onClick={() =>
                onModelSelect({ glb: model.glb, usdz: model.usdz })
              }
              disabled={!model.glb}
              title={
                model.glb
                  ? "Im Model Viewer anzeigen"
                  : "Kein .glb-Format verfügbar"
              }
            >
              Öffnen
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default S3ModelLibrary;
