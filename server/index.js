import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Provider } from 'ltijs';
import mongoose from 'mongoose';

import sketchfabRoutes from './routes/sketchfab.js';
import annotationsRoutes from './routes/annotations.js';
import whoamiRoutes from './routes/whoami.js';

// __dirname für ESM korrekt definieren
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfad zum Frontend-Build
const buildPath = path.join(__dirname, './build');

// Express App
const app = express();

// LTI Provider (Singleton)
const lti = Provider;

// Statische Dateien – öffentlich erreichbar (vor LTI!)
app.use('/main/assets', express.static(path.join(buildPath, 'assets')));
app.use('/main/vite.svg', express.static(path.join(buildPath, 'vite.svg')));
app.use('/main', express.static(buildPath));

// Öffentliche API-Routen (nicht geschützt)
app.use('/api/sketchfab', sketchfabRoutes);

const setup = async () => {
  // MongoDB verbinden
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('✅ MongoDB verbunden'))
    .catch((err) => console.error('❌ MongoDB Fehler:', err));

  app.use(express.json());

  // 🧪 Dev-Modus ohne LTI
  if (process.env.MODE === 'dev') {
    app.use((req, res, next) => {
      res.locals.token = { user: 'testUser' };
      next();
    });

    app.use('/api/annotations', annotationsRoutes);
    app.use('/api/sketchfab', sketchfabRoutes);
    app.use('/api/whoami', whoamiRoutes);

    app.listen(3001, () => {
      console.log('🧪 Dev-Server läuft auf http://localhost:3001');
    });

    return;
  }

  // 🔓 Whitelist für statische Assets (regex erlaubt Unterpfade)
  lti.whitelist(
    { route: /^\/main\/.*/, method: 'GET' }
  );


  // 🔐 LTI Setup
  await lti.setup(process.env.LTI_KEY, {
    url: process.env.MONGODB_URI,
  }, {
    appUrl: '/lti/launch',
    loginUrl: '/lti/oidc',
    cookie: {
      secure: false, // Setze auf true bei HTTPS in Produktion
      sameSite: 'Lax',
    },
    logger: true,
  });

  // 🔐 LTI Deployment
  await lti.deploy({ server: app, port: process.env.PORT || 3000 });

  lti.app.set('trust proxy', 1);

  // 🐞 Debug: Zeige alle LTI-Routen
  lti.app.use((req, res, next) => {
    console.log(`[LTI] ${req.method} ${req.path} | token: ${!!res.locals.token}`);
    next();
  });

  // 🎯 LTI-Login → Weiterleitung zur Hauptseite mit Token
  lti.onConnect((connection, req, res) => {
    lti.redirect(res, `/main?ltik=${connection.token}`);
  });

  // 🔐 Token-geschützte Einstiegspunkte
  lti.app.get('/main', (req, res) => {
    if (!res.locals.token) return res.status(401).send('Nicht autorisiert');
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  lti.app.get(/^\/main\/(?!assets).*/, (req, res) => {
    if (!res.locals.token) return res.status(401).send('Nicht autorisiert');
    res.sendFile(path.join(buildPath, 'index.html'));
  });

  // 🔐 Geschützte API-Routen
  lti.app.use('/api/annotations', annotationsRoutes);
  lti.app.use('/api/sketchfab', sketchfabRoutes);
  lti.app.use('/api/whoami', whoamiRoutes);

  // ✅ Health Check
  lti.app.get('/health', (_, res) => res.send('OK'));
};

setup().catch(console.error);
