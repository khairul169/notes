import { createHashRouter, RouterProvider } from "react-router";
import { lazy } from "react";

import MainLayout from "./components/layouts/main";

const HomePage = lazy(() => import("./pages/home/page"));
const ViewNotePage = lazy(() => import("./pages/view/page"));
const SearchPage = lazy(() => import("./pages/search/page"));
const SettingsPage = lazy(() => import("./pages/settings/page"));

const router = createHashRouter([
  {
    Component: MainLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: "note/:id",
        Component: ViewNotePage,
      },
      {
        path: "search",
        Component: SearchPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
