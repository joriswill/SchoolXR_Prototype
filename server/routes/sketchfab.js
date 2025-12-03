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
		// Rewrite asset URLs to route through our proxy so the client fetches
		// binary files through the server (avoids CORS / HTML error pages).
		const rewrite = (entry) => {
			if (!entry) return;
			if (typeof entry === "string")
				return `/api/sketchfab/proxy?url=${encodeURIComponent(entry)}`;
			if (entry.url)
				entry.url = `/api/sketchfab/proxy?url=${encodeURIComponent(entry.url)}`;
			return entry;
		};

		if (data.glb) data.glb = rewrite(data.glb);
		if (data.gltf) data.gltf = rewrite(data.gltf);
		if (data.zip) data.zip = rewrite(data.zip);
		if (data.usdz) data.usdz = rewrite(data.usdz);
		if (data.fbx) data.fbx = rewrite(data.fbx);
		if (data.obj) data.obj = rewrite(data.obj);

		res.json(data);
	} catch (err) {
		console.error("Sketchfab download Fehler:", err);
		res.status(500).json({ error: "Interner Serverfehler" });
	}
});

// Proxy a remote asset URL and stream it back to the client. The client
// will request `/api/sketchfab/proxy?url=<encoded>` which we fetch and
// forward the response (preserving content-type). This avoids the client
// receiving HTML error pages when fetching remote asset URLs directly.
router.get("/proxy", async (req, res) => {
	const target = req.query.url;
	if (!target) return res.status(400).json({ error: "Missing url" });

	try {
		const response = await fetch(target);

		const buffer = await response.arrayBuffer();
		const buf = Buffer.from(buffer);

		// Forward status and content-type
		const contentType =
			response.headers.get("content-type") || "application/octet-stream";
		res.setHeader("content-type", contentType);
		res.status(response.status).send(buf);
	} catch (err) {
		console.error("Proxy fetch error:", err);
		res.status(500).json({ error: "Proxy fetch error" });
	}
});

export default router;
