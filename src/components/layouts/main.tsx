import { Outlet } from "react-router";
import Sidebar from "../widgets/sidebar";
import Appbar from "../widgets/appbar";

export default function MainLayout() {
  return (
    <div className="flex h-screen max-h-dvh flex-row items-stretch overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col items-stretch overflow-hidden md:p-4 md:pl-0">
        <Appbar className="md:mb-4" />

        <main className="bg-surface-container-low flex flex-1 flex-col items-stretch overflow-hidden md:rounded-2xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
