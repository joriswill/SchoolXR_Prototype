import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "@google/model-viewer";
import {
  HiArrowLeft,
  HiArrowRight,
  HiCube,
  HiTemplate,
  HiDownload,
} from "react-icons/hi";
import { Tabs, TabItem } from "flowbite-react";
import SketchfabLibrary from "../components/library/SketchfabLibrary.jsx";
import S3ModelLibrary from "../components/library/S3ModelLibrary.jsx";

function SelectPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultModel = {
    glb: "/assets/pilea.glb",
    usdz: "/assets/pilea.usdz",
  };

  const [modelUrl, setModelUrl] = useState(location.state?.modelUrl || null);

  const handleContinue = () => {
    navigate("/edit", {
      state: { modelUrl: modelUrl || defaultModel },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <model-viewer
        src={modelUrl?.glb || modelUrl?.gltf || defaultModel.glb}
        ios-src={modelUrl?.usdz || defaultModel.usdz}
        auto-rotate
        camera-controls
        ar
        shadow-intensity="1"
        style={{ width: "100vw", height: "65vh" }}
      ></model-viewer>

      <Tabs
        aria-label="Modellquellen"
        style={{ minWidth: "75vw" }}
        variant="underline"
        className="tabsContainer"
      >
        <TabItem
          active
          title={
            <span className="flex items-center gap-2 text-black ">
              <HiCube />
              <span>Sketchfab</span>
            </span>
          }
        >
          <SketchfabLibrary onModelSelect={setModelUrl} />
        </TabItem>

        <TabItem
          title={
            <span className="flex items-center gap-2 text-black">
              <HiDownload />
              <span>Eigene</span>
            </span>
          }
        >
          <S3ModelLibrary onModelSelect={setModelUrl} />
        </TabItem>

        <TabItem
          title={
            <span className="flex items-center gap-2 text-black">
              <HiTemplate />
              <span>Vorlagen</span>
            </span>
          }
        >
          <SketchfabLibrary onModelSelect={setModelUrl} />
        </TabItem>
      </Tabs>

      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        <button
          className="bg-white hover:bg-gray-200 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
          onClick={() => navigate("/")}
        >
          <HiArrowLeft color="grey" />
        </button>
        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl ${
            !modelUrl ? "opacity-20 cursor-not-allowed" : ""
          }`}
          onClick={handleContinue}
          disabled={!modelUrl}
        >
          <HiArrowRight color="white" />
        </button>
      </div>
    </div>
  );
}

export default SelectPage;
