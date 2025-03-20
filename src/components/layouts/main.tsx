import { Outlet } from "react-router";
import Sidebar from "../widgets/sidebar";
import Appbar from "../widgets/appbar";

export default function MainLayout() {
  return (
    <div className="flex flex-row items-stretch h-screen max-h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col items-stretch overflow-hidden md:p-4 md:pl-0">
        <Appbar className="md:mb-4" />

        <main className="md:rounded-2xl flex-1 flex flex-col items-stretch overflow-hidden bg-surface-container-low">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
