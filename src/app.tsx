import SyncManager from "./components/providers/sync-manager";
import Router from "./router";

export default function App() {
  return (
    <>
      <Router />
      <SyncManager />
    </>
  );
}
