import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "./components/layouts/main";
import HomePage from "./pages/home/page";
import ViewNotePage from "./pages/view/page";
import SearchPage from "./pages/search/page";

const router = createBrowserRouter([
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
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
