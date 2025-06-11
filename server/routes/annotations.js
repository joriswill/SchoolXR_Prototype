import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// 🔧 Einheitliches Annotation-Schema
const annotationSchema = new mongoose.Schema({
  userId: String,              // Nutzer-ID aus dem LTI-Token
  modelId: String,
  title: String,
  description: String,
  task: String,
  position: [String],
  normal: [String],
  collectionName: String,      // 🔹 Name der Sammlung
  createdAt: { type: Date, default: Date.now }
});

// 🔧 Einheitliches Modell mit fester Collection "annotations"
const Annotation = mongoose.model('Annotation', annotationSchema, 'annotations');

// 🔹 GET: Alle Annotationen aus einer bestimmten Sammlung
router.get('/by-collection/:collectionName', async (req, res) => {
  const userId = res.locals.token?.user || 'testUser';
  const { collectionName } = req.params;

  try {
    const annotations = await Annotation.find({ userId, collectionName }).sort('createdAt');
    res.json(annotations);
  } catch (err) {
    console.error('❌ Fehler beim Laden der Sammlung:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Annotationen' });
  }
});

// 🔹 GET: Alle Sammlungsnamen für aktuellen Nutzer (für Dropdown etc.)
router.get('/collections/all', async (req, res) => {
  const userId = res.locals.token?.user || 'testUser';

  try {
    const collections = await Annotation.aggregate([
      { $match: { userId } },
      { $group: { _id: '$collectionName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(collections);
  } catch (err) {
    console.error('❌ Fehler beim Sammeln der Collections:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Sammlungen' });
  }
});

// 🔹 GET: Sammlungen nach Modell-ID (für Dropdown nach Modell)
router.get('/collections/model/:modelId', async (req, res) => {
  const userId = res.locals.token?.user || 'testUser';
  const { modelId } = req.params;

  try {
    const collections = await Annotation.aggregate([
      { $match: { userId, modelId } },
      { $group: { _id: "$collectionName", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(collections);
  } catch (err) {
    console.error('❌ Fehler beim Laden der modellbasierten Sammlungen:', err);
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

// 🔹 GET: Alle Annotationen für ein Modell und Nutzer (fallback oder legacy)
router.get('/:modelId', async (req, res) => {
  const { modelId } = req.params;
  const userId = res.locals.token?.user || 'testUser';

  try {
    const spots = await Annotation.find({ modelId, userId }).sort('createdAt');
    res.json(spots);
  } catch (err) {
    console.error('❌ Fehler beim Abrufen:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Annotationen' });
  }
});

// 🔹 POST: Einzelne Annotation speichern
router.post('/', async (req, res) => {
  const userId = res.locals.token?.user || 'testUser';
  const { modelId, title, description, task, position, normal, collectionName } = req.body;

  const newAnnotation = new Annotation({
    userId,
    modelId,
    title,
    description,
    task,
    position,
    normal,
    collectionName
  });

  try {
    await newAnnotation.save();
    res.status(201).json(newAnnotation);
  } catch (err) {
    console.error('❌ Fehler beim Speichern:', err);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

// 🔹 POST /batch: Mehrere Annotationen speichern
router.post('/batch', async (req, res) => {
  const userId = res.locals.token?.user || 'testUser';
  const { collectionName, annotations } = req.body;

  if (!userId || !collectionName || !Array.isArray(annotations)) {
    return res.status(400).json({ error: 'Fehlende oder ungültige Daten' });
  }

  try {
    // Lösche alte Einträge dieser Sammlung für diesen Nutzer + Modell
    const modelId = annotations[0]?.modelId;
    await Annotation.deleteMany({ userId, modelId, collectionName });

    // Neue Einträge einfügen
    const docs = annotations.map(a => ({
      ...a,
      userId,
      collectionName,
    }));

    const inserted = await Annotation.insertMany(docs);
    res.status(201).json(inserted);
  } catch (err) {
    console.error('❌ Fehler beim Batch-Speichern:', err);
    res.status(500).json({ error: 'Fehler beim Batch-Speichern' });
  }
});

export default router;
