import { createBrowserRouter } from "react-router";
import { TeamSetup } from "./pages/TeamSetup";
import { Dashboard } from "./pages/Dashboard";
import { Activities } from "./pages/Activities";
import { ActivityDetail } from "./pages/ActivityDetail";
import { Sensors } from "./pages/Sensors";
import { Leaderboard } from "./pages/Leaderboard";
import { Forum } from "./pages/Forum";
import { Settings } from "./pages/Settings";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <TeamSetup />,
  },
  {
    path: "/app",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "activities", element: <Activities /> },
      { path: "activities/:activityId", element: <ActivityDetail /> },
      { path: "sensors", element: <Sensors /> },
      { path: "leaderboard", element: <Leaderboard /> },
      { path: "forum", element: <Forum /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
