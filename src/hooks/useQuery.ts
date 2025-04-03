import { useCallback, useEffect, useState } from "react";

type UseQueryOptions = {
  enabled?: boolean;
};

export function useQuery<T>(
  asyncFn: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    asyncFn()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    if (options.enabled !== false) {
      refetch();
    }
  }, [refetch, options.enabled]);

  return { data, error, loading, refetch };
}
