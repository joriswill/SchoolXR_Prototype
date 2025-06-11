import { useState } from "react";
import "@google/model-viewer";
import "./App.css";
import S3ModelLibrary from "./components/library/S3ModelLibrary.jsx";
import Upload from "./components/library/Upload.jsx";
import AppBreadcrumb from "./components/AppBreadcrumb.jsx";
import { FaHome } from "react-icons/fa";
import Header from "./components/Header.jsx";

function App() {
  const [modelUrl, setModelUrl] = useState(null);

  const defaultModel = {
    glb: "assets/pilea.glb",
    usdz: "assets/pilea.usdz",
  };

  return (
    <>
      <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
        <model-viewer
          src={modelUrl ? modelUrl.glb : defaultModel.glb}
          ios-src={modelUrl ? modelUrl.usdz : defaultModel.usdz}
          alt="Ausgewähltes 3D-Modell"
          auto-rotate
          camera-controls
          style={{ width: "50vw", height: "400px" }}
        ></model-viewer>
      </div>

      <div style={{ width: "100%" }}>
        {/* <SketchfabLibrary onModelSelect={setModelUrl} /> */}
        <S3ModelLibrary onModelSelect={setModelUrl} />
        <Upload></Upload>
      </div>
    </>
  );
}

export default App;
