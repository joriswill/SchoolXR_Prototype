import { useState } from "react";
import { HiInformationCircle } from "react-icons/hi";

/**
 * InfoBanner component
 * @param {string} text - The info text to display
 */
export default function InfoBanner({ text }) {
  const [show, setShow] = useState(true);

  if (!show) return null;

return (
  <div
    className="absolute left-1/2 transform -translate-x-1/2 px-4 w-full max-w-4xl"
    style={{ zIndex: 9999 }}
  >
    <div className="bg-white rounded shadow-md p-4 pt-8 text-gray-800 text-base text-center relative">
      <button
        className="absolute top-2 right-3 mr-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        onClick={() => setShow(false)}
        aria-label="Schließen"
        type="button"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          right: 0,
          left: "auto",
        }}
      >
        ×
      </button>
      <span>{text}</span>
    </div>
  </div>
);
}
