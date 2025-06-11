import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import "./index.css";

import HomePage from "./routes/HomePage.jsx";
import HomePageStudents from "./routes/HomePageStudents.jsx";
import SelectPage from "./routes/SelectPage.jsx";
import Header from "./components/Header.jsx";
import EditPage from "./routes/EditPage.jsx";
import FinalPage from "./routes/FinalPage.jsx";
import RoleBasedStart from "./routes/RoleBasedStart.jsx";

// Dynamisch aktiven Index aus Route ableiten
function RootLayout() {
  const location = useLocation();

  const activeIndex = (() => {
    switch (location.pathname) {
      case "/instructor":
        return 0;
      case "/learner":
        return 0;
      case "/select":
        return 1;
      case "/edit":
        return 2;
      case "/final":
        return 3;
      default:
        return 0;
    }
  })();

  return (
    <>
      <Header activeIndex={activeIndex} />
      <div className="px-4">
        <Outlet />
      </div>
    </>
  );
}

// Browser Router definieren
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <RoleBasedStart /> },
        { path: "instructor", element: <HomePage /> },
        { path: "learner", element: <HomePageStudents /> },
        { path: "select", element: <SelectPage /> },
        { path: "edit", element: <EditPage /> },
        { path: "final", element: <FinalPage /> },
      ],
    },
  ],
  {
    basename: "/",
  }
);

// App rendern
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
