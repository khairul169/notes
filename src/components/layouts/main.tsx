import { Outlet } from "react-router";
import Sidebar from "../widgets/sidebar";
import Appbar from "../widgets/appbar";
import Loader from "../ui/loader";
import { Suspense } from "react";

export default function MainLayout() {
  return (
    <div className="flex h-screen max-h-dvh flex-row items-stretch overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col items-stretch overflow-hidden md:p-4 md:pl-0">
        <Appbar className="md:mb-4" />

        <main className="md:bg-surface-container-low flex flex-1 flex-col items-stretch overflow-hidden md:rounded-2xl">
          <Suspense fallback={<Loader className="flex-1" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
