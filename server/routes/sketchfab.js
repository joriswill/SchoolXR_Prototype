import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Hole Umgebungsvariable
const SKETCHFAB_TOKEN = process.env.SKETCHFAB_TOKEN;

router.get('/search', async (req, res) => {
  const query = req.query.q || 'biology';
  try {
    const response = await fetch(`https://api.sketchfab.com/v3/search?type=models&q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: `Token ${SKETCHFAB_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Fehler bei Sketchfab-API' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Sketchfab API Fehler:', err);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;