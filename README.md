# SchoolXR – 3D Modell Annotation Plattform

**SchoolXR** ist eine Plattform, mit der Lehrkräfte und Schüler:innen interaktive 3D-Modelle mit Annotationen und Aufgaben für den Unterricht erstellen, bearbeiten und nutzen können.

---

## Features

- **Modelle hochladen oder aus Bibliothek wählen** (glTF/GLB/USDZ)
- **Hotspots/Annotationen** direkt im Modell platzieren
- **Sammlungen** von Annotationen speichern und laden
- **Rollenbasiertes System**: Lehrkraft/Schüler:in
- **LTI-Integration** (Learning Tools Interoperability, optional)
- **Checklisten und Aufgaben** für Schüler:innen

---

## Schnellstart (Entwicklungsmodus)

### Voraussetzungen

- Node.js (empfohlen: v18+)
- MongoDB (lokal oder Cloud, z.B. MongoDB Atlas)

### 1. Repository klonen

```bash
git clone <REPO_URL>
cd SchoolXR
```

### 2. Umgebungsvariablen anlegen

Erstelle eine `.env`-Datei im `server`-Verzeichnis mit folgendem Inhalt:

```
MONGODB_URI=deine-mongodb-url
MODE=dev
LTI_KEY=irgendein-geheimer-key
PORT=3001
```

Erstelle eine `.env`-Datei im `client`-Verzeichnis mit folgendem Inhalt:

```
VITE_SKETCHFAB_API_KEY=your_sketchfab_api_key_here
```

Passe ggf. die MongoDB-URL an.

### 3. Backend starten

```bash
cd server
npm install
npm run dev
```
Der Server läuft dann auf [http://localhost:3001](http://localhost:3001).

### 4. Frontend starten (separate Console)

```bash
cd ../client
npm install
npm run dev
```
Das Frontend läuft auf [http://localhost:5173](http://localhost:5173).

---

## Produktion/LTI-Modus

- Setze `MODE=prod` in der `.env`
- Richte LTI entsprechend ein (siehe [ltijs Doku](https://cvmcosta.me/ltijs/guide/))
- Starte Backend mit `npm start` (statt `npm run dev`)
- Das Frontend muss gebaut werden: `npm run build` im `client`-Ordner

---

## Benutzung

### 1. Startseite

- Wähle deine Rolle: **Lehrkraft** oder **Schüler:in**
- Folge dem Onboarding oder starte direkt

### 2. Modell auswählen/hochladen

- Wähle ein Modell aus der Bibliothek oder lade ein eigenes hoch

### 3. Editieren (Lehrkraft)

- Klicke auf das Modell, um Hotspots zu setzen
- Fülle Titel, Beschreibung und ggf. Aufgabe aus
- Speichere Hotspots als Sammlung (z.B. "Lektion Pflanzen")
- Lade bestehende Sammlungen über das Dropdown

### 4. Vorschau/Finale Ansicht

- Überprüfe das Modell und die Hotspots
- Schüler:innen können Aufgaben direkt im Modell bearbeiten
- Checkliste zeigt den Fortschritt

---

## API-Routen (Dev-Modus)

- `GET /api/annotations/collections/model/:modelId` – Sammlungen für Modell
- `GET /api/annotations/by-collection/:collectionName` – Hotspots einer Sammlung
- `POST /api/annotations/batch` – Hotspots-Sammlung speichern

---

## Troubleshooting

- **Modelle werden nicht angezeigt?**  
  Prüfe Dateiformate und Pfade.
- **Hotspots erscheinen nicht?**  
  Stelle sicher, dass sie als Children von `<model-viewer>` gerendert werden.
- **Keine Verbindung zur Datenbank?**  
  Prüfe `MONGODB_URI` und dass MongoDB läuft.

---

## Lizenz

MIT License

---

**Viel Spaß beim Ausprobieren!**
