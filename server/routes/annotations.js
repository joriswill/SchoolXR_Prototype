import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// 🔧 Einheitliches Annotation-Schema
const annotationSchema = new mongoose.Schema({
	userId: String, // Nutzer-ID aus dem LTI-Token
	modelId: String,
	title: String,
	description: String,
	task: String,
	position: [String],
	normal: [String],
	collectionName: String, // 🔹 Name der Sammlung
	createdAt: { type: Date, default: Date.now },
});

// 🔧 Einheitliches Modell mit fester Collection "annotations"
const Annotation = mongoose.model(
	"Annotation",
	annotationSchema,
	"annotations"
);

// 🔹 GET: Alle Annotationen aus einer bestimmten Sammlung
router.get("/by-collection/:collectionName", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";
	const { collectionName } = req.params;

	try {
		const annotations = await Annotation.find({ userId, collectionName }).sort(
			"createdAt"
		);
		res.json(annotations);
	} catch (err) {
		console.error("❌ Fehler beim Laden der Sammlung:", err);
		res.status(500).json({ error: "Fehler beim Abrufen der Annotationen" });
	}
});

// 🔹 GET: Alle Sammlungsnamen für aktuellen Nutzer (für Dropdown etc.)
router.get("/collections/all", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";

	try {
		const collections = await Annotation.aggregate([
			{ $match: { userId } },
			{ $group: { _id: "$collectionName", count: { $sum: 1 } } },
			{ $sort: { _id: 1 } },
		]);

		res.json(collections);
	} catch (err) {
		console.error("❌ Fehler beim Sammeln der Collections:", err);
		res.status(500).json({ error: "Fehler beim Abrufen der Sammlungen" });
	}
});

// 🔹 GET: Sammlungen nach Modell-ID (für Dropdown nach Modell)
router.get("/collections/model/:modelId", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";
	const { modelId } = req.params;

	try {
		const collections = await Annotation.aggregate([
			{ $match: { userId, modelId } },
			{ $group: { _id: "$collectionName", count: { $sum: 1 } } },
			{ $sort: { _id: 1 } },
		]);

		res.json(collections);
	} catch (err) {
		console.error("❌ Fehler beim Laden der modellbasierten Sammlungen:", err);
		res.status(500).json({ error: "Fehler beim Laden" });
	}
});

// DELETE: remove all annotations for a collection for current user
router.delete("/collection/:collectionName", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";
	const { collectionName } = req.params;

	if (!collectionName)
		return res.status(400).json({ error: "Missing collectionName" });

	try {
		const result = await Annotation.deleteMany({ userId, collectionName });
		res.json({ deletedCount: result.deletedCount || 0 });
	} catch (err) {
		console.error("❌ Fehler beim Löschen der Collection:", err);
		res.status(500).json({ error: "Fehler beim Löschen der Collection" });
	}
});
// 🔹 GET: Alle Annotationen für ein Modell und Nutzer (fallback oder legacy)
router.get("/:modelId", async (req, res) => {
	const { modelId } = req.params;
	const userId = res.locals.token?.user || "testUser";

	try {
		const spots = await Annotation.find({ modelId, userId }).sort("createdAt");
		res.json(spots);
	} catch (err) {
		console.error("❌ Fehler beim Abrufen:", err);
		res.status(500).json({ error: "Fehler beim Laden der Annotationen" });
	}
});

// 🔹 POST: Einzelne Annotation speichern
router.post("/", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";
	const {
		modelId,
		title,
		description,
		task,
		position,
		normal,
		collectionName,
	} = req.body;

	// Normalize modelId: if client sent a proxied URL or a signed S3 URL,
	// try to extract the Sketchfab/archive id (pattern: /archives/<id>/)
	const normalizeModelId = (mid) => {
		if (!mid) return mid;
		try {
			// If it's our proxy URL like /api/sketchfab/proxy?url=<encoded>
			if (mid.includes("/api/sketchfab/proxy") && mid.includes("url=")) {
				const encoded = mid.split("url=")[1];
				const decoded = decodeURIComponent(encoded);
				const m = decoded.match(/\/archives\/([^\/]+)/);
				if (m) return m[1];
			}

			// If it's a full URL (e.g., signed S3 URL) containing /archives/<id>/
			const m2 = mid.match(/archives\/([^\/]+)/);
			if (m2) return m2[1];

			// If it's already a 32-char hex id, keep it
			if (/^[0-9a-fA-F]{32}$/.test(mid)) return mid;
		} catch (e) {
			console.warn("Error normalizing modelId", e);
		}
		return mid; // fallback: return original
	};

	const normalizedModelId = normalizeModelId(modelId);

	const newAnnotation = new Annotation({
		userId,
		modelId: normalizedModelId,
		title,
		description,
		task,
		position,
		normal,
		collectionName,
	});

	try {
		await newAnnotation.save();
		res.status(201).json(newAnnotation);
	} catch (err) {
		console.error("❌ Fehler beim Speichern:", err);
		res.status(500).json({ error: "Fehler beim Speichern" });
	}
});

// 🔹 POST /batch: Mehrere Annotationen speichern
router.post("/batch", async (req, res) => {
	const userId = res.locals.token?.user || "testUser";
	const { collectionName, annotations } = req.body;

	if (!userId || !collectionName || !Array.isArray(annotations)) {
		return res.status(400).json({ error: "Fehlende oder ungültige Daten" });
	}

	try {
		// Normalize modelId for the batch and delete old entries for that model
		const normalizeModelId = (mid) => {
			if (!mid) return mid;
			try {
				if (mid.includes("/api/sketchfab/proxy") && mid.includes("url=")) {
					const encoded = mid.split("url=")[1];
					const decoded = decodeURIComponent(encoded);
					const m = decoded.match(/\/archives\/([^\/]+)/);
					if (m) return m[1];
				}
				const m2 = mid.match(/archives\/([^\/]+)/);
				if (m2) return m2[1];
				if (/^[0-9a-fA-F]{32}$/.test(mid)) return mid;
			} catch (e) {
				console.warn("Error normalizing modelId", e);
			}
			return mid;
		};

		const modelIdRaw = annotations[0]?.modelId;
		const modelId = normalizeModelId(modelIdRaw);
		await Annotation.deleteMany({ userId, modelId, collectionName });

		// Neue Einträge einfügen (mit normalisiertem modelId)
		const docs = annotations.map((a) => ({
			...a,
			modelId: normalizeModelId(a.modelId),
			userId,
			collectionName,
		}));

		const inserted = await Annotation.insertMany(docs);
		res.status(201).json(inserted);
	} catch (err) {
		console.error("❌ Fehler beim Batch-Speichern:", err);
		res.status(500).json({ error: "Fehler beim Batch-Speichern" });
	}
});

export default router;
