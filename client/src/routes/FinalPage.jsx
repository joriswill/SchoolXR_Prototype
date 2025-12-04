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
		glb: "/assets/pilea.glb",
		usdz: "/assets/pilea.usdz",
	};

	//fallback if sketchfab uid is not available
	const extractArchiveId = (proxyUrl) => {
		if (!proxyUrl) return null;

		// 1. URL-Parameter 'url=' extrahieren
		const encoded = proxyUrl.split("url=")[1];
		if (!encoded) return null;

		// 2. Dekodieren
		let decoded;
		try {
			decoded = decodeURIComponent(encoded);
		} catch {
			return null;
		}

		// 3. Die ID nach "/archives/<ID>/" finden
		const match = decoded.match(/\/archives\/([^/]+)/);
		return match ? match[1] : null;
	};

	// Prefer Sketchfab UID when available (selected via SketchfabLibrary),
	// otherwise fall back to deriving an id from the model URL.
	const modelId = modelUrl?.sketchfabUid
		? modelUrl.sketchfabUid
		: extractArchiveId(modelUrl?.glb || modelUrl?.gltf || defaultModel.glb);

	const [hotspots, setHotspots] = useState([]);
	const [effectiveModelUrl, setEffectiveModelUrl] = useState(
		modelUrl || defaultModel
	);
	const [modelCheckMessage, setModelCheckMessage] = useState(null);
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

				if (modelUrl) return; // model already provided explicitly

				if (!data || data.length === 0) return;

				const first = data[0];
				const modelId = first.modelId || first.model || null;
				console.debug("FinalPage: first annotation modelId:", modelId);
				if (!modelId) return;

				// If modelId looks like a URL or absolute path, use it directly
				const isUrl = /(^https?:\/\/)|(^\/)/i.test(modelId);
				if (isUrl) {
					setEffectiveModelUrl({
						glb: modelId,
						usdz: modelId.replace(/\.(glb|gltf)$/i, ".usdz"),
					});
					return;
				}

				// If modelId looks like a Sketchfab UID (32 hex chars), fetch its download
				// metadata from our server and use the returned proxied GLB/GLTF URL.
				const isSketchfabUid = /^[0-9a-fA-F]{32}$/.test(modelId);
				if (isSketchfabUid) {
					try {
						const metaRes = await fetch(
							`/api/sketchfab/models/${modelId}/download`
						);
						if (metaRes.ok) {
							const meta = await metaRes.json();
							const pickUrl = (entry) => {
								if (!entry) return null;
								if (typeof entry === "string") return entry;
								return entry.url || null;
							};
							const url =
								pickUrl(meta.glb) ||
								pickUrl(meta.gltf) ||
								pickUrl(meta.zip) ||
								null;
							if (url) {
								setEffectiveModelUrl({
									glb: url,
									usdz: pickUrl(meta.usdz) || null,
								});
								return;
							}
						}
					} catch (e) {
						console.error(
							"Error fetching sketchfab download metadata for",
							modelId,
							e
						);
					}
				}

				// Otherwise treat it as a filename and try to load from /assets or /main/assets
				const filename = modelId.split("/").pop().split("?")[0];
				const inferredGlb = `/assets/${filename}`;
				const altGlb = `/main/assets/${filename}`;

				const check = async (url) => {
					try {
						const r = await fetch(url, { method: "GET" });
						if (!r.ok) return false;
						const ct = (r.headers.get("content-type") || "").toLowerCase();
						return (
							ct.includes("model/gltf-binary") ||
							ct.includes("model/gltf+json") ||
							ct.includes("application/octet-stream") ||
							ct.includes("model/vnd.usdz")
						);
					}
          catch { return false; }
				};

				if (await check(inferredGlb)) {
					setEffectiveModelUrl({
						glb: inferredGlb,
						usdz: inferredGlb.replace(/\.(glb|gltf)$/i, ".usdz"),
					});
					return;
				}

				if (await check(altGlb)) {
					setEffectiveModelUrl({
						glb: altGlb,
						usdz: altGlb.replace(/\.(glb|gltf)$/i, ".usdz"),
					});
					return;
				}

				setModelCheckMessage(
					`Modell "${filename}" nicht gefunden oder ungültig. Zeige Standardmodell.`
				);
			} catch (err) {
				console.error("Fehler beim Laden der Annotationen:", err);
			}
		};

		if (collectionName) fetchHotspots();
	}, [collectionName]);

	// Debug: Log and attach model-viewer event listeners to trace loading errors
	useEffect(() => {
		const mv = modelViewerRef.current;
		if (!mv) return;

		const onLoad = () => {
			console.info("model-viewer: load event for", effectiveModelUrl);
		};

		const onError = async (ev) => {
			try {
				console.error(
					"model-viewer: error event",
					ev,
					"src=",
					effectiveModelUrl
				);

				// Try to inspect the resource so we know what's being returned
				if (effectiveModelUrl && typeof effectiveModelUrl.glb === "string") {
					try {
						const r = await fetch(effectiveModelUrl.glb, { method: "GET" });
						const ct = r.headers.get("content-type") || "";
						console.warn(
							"Inspected resource:",
							effectiveModelUrl.glb,
							"status=",
							r.status,
							"content-type=",
							ct
						);
						if (
							ct.includes("text") ||
							ct.includes("html") ||
							ct.includes("json")
						) {
							const txt = await r.text();
							console.warn("First 400 chars of response:", txt.slice(0, 400));
						} else {
							const len = r.headers.get("content-length");
							console.warn("Binary resource, content-length=", len);
						}
					} catch (fetchErr) {
						console.error(
							"Error while fetching model for inspection:",
							fetchErr
						);
					}
				}
			} catch (e) {
				console.error("Error in onError handler:", e);
			}
		};

		mv.addEventListener("load", onLoad);
		mv.addEventListener("error", onError);

		// Log every time the effectiveModelUrl changes
		console.debug("FinalPage: effectiveModelUrl set to", effectiveModelUrl);

		return () => {
			mv.removeEventListener("load", onLoad);
			mv.removeEventListener("error", onError);
		};
	}, [modelViewerRef, effectiveModelUrl]);

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

			{modelCheckMessage && (
				<div className="w-full max-w-3xl px-4 mt-4">
					<div
						className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
						role="alert"
					>
						<p className="font-bold">Modell konnte nicht geladen werden</p>
						<p>{modelCheckMessage}</p>
					</div>
				</div>
			)}

			<model-viewer
				ref={modelViewerRef}
				src={
					effectiveModelUrl?.glb || effectiveModelUrl?.gltf || defaultModel.glb
				}
				ios-src={effectiveModelUrl?.usdz || defaultModel.usdz}
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
						<p className="text-sm text-black dark:text-white">
							Du hast alle Hotspots erfolgreich bearbeitet und die Aufgaben
							abgeschlossen. Gut gemacht! 👍
						</p>
						<br />
						<p className="text-sm text-black dark:text-white">
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
