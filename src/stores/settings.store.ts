import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { produce, WritableDraft } from "immer";

type SettingsStore = {
  theme: "light" | "dark";
  sync: {
    enabled: boolean;
    url: string;
    token: string;
  };
};

const initialState: SettingsStore = {
  theme: "dark",
  sync: {
    enabled: false,
    url: "",
    token: "",
  },
};

const store = createStore<SettingsStore>()(
  persist(() => initialState, { name: "settings" })
);

const settingsStore = Object.assign(store, {
  reset() {
    store.setState(initialState);
  },
  set(fn: (draft: WritableDraft<SettingsStore>) => void) {
    store.setState(produce(store.getState(), fn));
  },
});

export default settingsStore;
