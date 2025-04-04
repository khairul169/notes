import SyncManager from "./components/providers/sync-manager";
import { Toaster } from "./components/ui/sonner";
import Router from "./router";

export default function App() {
  return (
    <>
      <Router />
      <SyncManager />
      <Toaster />
    </>
  );
}
