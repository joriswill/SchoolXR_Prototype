import { useNavigate } from "react-router-dom";
import React from "react";

function HomePageStudents() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-center mt-16"
      style={{ minHeight: "100vh" }}
    >
      <h1 className="text-3xl mb-8">Schüler Startseite</h1>
      <button
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => navigate("/")}
      >
        Zurück
      </button>
    </div>
  );
}

export default HomePageStudents;
