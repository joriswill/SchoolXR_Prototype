import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Hole Umgebungsvariable
const SKETCHFAB_TOKEN = process.env.SKETCHFAB_TOKEN;

router.get("/search", async (req, res) => {
	const query = req.query.q || "biology";
	const next = req.query.next;
	try {
		let response;
		if (next) {
			// client requested a 'next' page; next is an encoded full Sketchfab URL
			const decoded = decodeURIComponent(next);
			response = await fetch(decoded, {
				headers: { Authorization: `Token ${SKETCHFAB_TOKEN}` },
			});
		} else {
			response = await fetch(
				`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(
					query
				)}&downloadable=true`,
				{
					headers: { Authorization: `Token ${SKETCHFAB_TOKEN}` },
				}
			);
		}

		if (!response.ok) {
			return res
				.status(response.status)
				.json({ error: "Fehler bei Sketchfab-API" });
		}

		const data = await response.json();
		// Rewrite `next` to point back to our proxy so the client doesn't fetch Sketchfab directly
		if (data.next) {
			data.next = `/api/sketchfab/search?next=${encodeURIComponent(data.next)}`;
		}
		res.json(data);
	} catch (err) {
		console.error("Sketchfab API Fehler:", err);
		res.status(500).json({ error: "Interner Serverfehler" });
	}
});

// Proxy: get download formats for a specific model UID
router.get("/models/:uid/download", async (req, res) => {
	const uid = req.params.uid;
	try {
		const response = await fetch(
			`https://api.sketchfab.com/v3/models/${uid}/download`,
			{
				headers: {
					Authorization: `Token ${SKETCHFAB_TOKEN}`,
				},
			}
		);

		if (!response.ok) {
			const text = await response.text();
			console.error(
				"Sketchfab download endpoint error:",
				response.status,
				text
			);
			return res
				.status(response.status)
				.json({ error: "Fehler bei Sketchfab-Download-API" });
		}

		const data = await response.json();
		// Return the JSON directly to the client (client will pick glb/gltf/zip urls)
		res.json(data);
	} catch (err) {
		console.error("Sketchfab download Fehler:", err);
		res.status(500).json({ error: "Interner Serverfehler" });
	}
});

export default router;
