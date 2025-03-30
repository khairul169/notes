import { useEffect, useState } from "react";

export function useStorageSize() {
  const [usage, setUsage] = useState(0);
  const [quota, setQuota] = useState(0);

  useEffect(() => {
    const fetchStorageInfo = async () => {
      if (navigator.storage && navigator.storage.estimate) {
        const { usage, quota } = await navigator.storage.estimate();
        setUsage(usage || 0);
        setQuota(quota || 0);
      }
    };

    fetchStorageInfo();
    window.addEventListener("focus", fetchStorageInfo);
    return () => {
      window.removeEventListener("focus", fetchStorageInfo);
    };
  }, []);

  return { usage, quota };
}
