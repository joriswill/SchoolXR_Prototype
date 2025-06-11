import { useNavigate } from "react-router-dom";
import React from "react";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

function HomePage() {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Only include the steps you want in the carousel
  const steps = [
    {
      title: "👣 Schritt 1: Modell wählen oder hochladen",
      content: (
        <>
          <img src="/assets/screenshots/instruction1.png" alt="" />
          Nutzen Sie die integrierte Bibliothek oder importieren Sie eigene
          Modelle (glTF/GLB/USDZ).
        </>
      ),
    },
    {
      title: "👣 Schritt 2: Interaktiv anreichern",
      content: (
        <>
          <img src="/assets/screenshots/instruction3.png" alt="" />
          Fügen Sie Annotationen, Texte, Aufgaben oder Hotspots direkt im Modell
          hinzu.
        </>
      ),
    },
    {
      title: "👣 Schritt 3: Vorschau und Veröffentlichung",
      content: (
        <>
          <img src="/assets/screenshots/instruction4.png" alt="" />
          Sehen Sie sich das Ergebnis an, speichern Sie es und teilen Sie es per
          Link oder QR-Code mit Ihrer Klasse.
        </>
      ),
    },
  ];

  // Additional info cards (not in carousel)
  const infoCards = [
    {
      title: "🧭 Was Sie hier erwartet",
      content: (
        <>
          Diese Plattform unterstützt Sie dabei, digitale 3D-Inhalte gezielt für
          den Unterricht vorzubereiten. Ob Biologie, Technik oder Geografie –
          mit wenigen Schritten erstellen Sie annotierte Modelle mit erklärenden
          Hinweisen und Aufgabenstellungen.
        </>
      ),
    },
    {
      title: "👥 Rollenbasiertes System",
      content: (
        <>
          Je nach Login sehen Sie unterschiedliche Ansichten: Lehrkräfte
          erstellen und bearbeiten Modelle. Schüler:innen nutzen vorbereitete
          Modelle für interaktive Aufgaben.
        </>
      ),
    },
    {
      title: "❓ Noch unsicher?",
      content: (
        <>
          Nutzen Sie das integrierte Tutorial für eine geführte Einführung oder
          starten Sie direkt mit einem Beispielmodell.
        </>
      ),
    },
  ];

  const prevStep = () =>
    setCurrentIndex((i) => (i === 0 ? steps.length - 1 : i - 1));
  const nextStep = () =>
    setCurrentIndex((i) => (i === steps.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col items-center mt-16">
      <h1 className="mb-8" style={{ fontSize: "50px" }}>Willkommen!</h1>

      {/* Info cards above carousel */}
      <div className="w-full max-w-xl px-4 mb-6 space-y-4">
        {infoCards.slice(0, 1).map((card, idx) => (
          <div key={idx} className="bg-white rounded shadow p-6">
            <h2 className="text-xl mb-2">{card.title}</h2>
            <div className="text-center">{card.content}</div>
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-xl px-4 pb">
        <div className="bg-white rounded shadow p-6 flex flex-col items-center min-h-[320px] transition-all duration-300">
          <h2 className="text-xl mb-2">{steps[currentIndex].title}</h2>
          <div className="text-center">{steps[currentIndex].content}</div>
          {/* Step points inside the card */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-2 h-2 rounded-full ${
                  idx === currentIndex ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition"
          onClick={prevStep}
          aria-label="Vorherige Karte"
        >
          <HiArrowLeft />
        </button>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition"
          onClick={nextStep}
          aria-label="Nächste Karte"
        >
          <HiArrowRight />
        </button>
      </div>

      {/* Info cards below carousel */}
      <div className="w-full max-w-xl px-4 mt-6 space-y-4 mb-6">
        {infoCards.slice(1).map((card, idx) => (
          <div key={idx} className="bg-white rounded shadow p-6">
            <h2 className="text-xl mb-2">{card.title}</h2>
            <div className="text-center">{card.content}</div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-50 flex gap-4">

        <button
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl
            
          }`}
          onClick={() => navigate("/select")}
        >
          <HiArrowRight color="white" />
        </button>
      </div>
    </div>
  );
}

export default HomePage;
