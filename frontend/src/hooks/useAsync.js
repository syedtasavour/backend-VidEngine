import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs an async loader on mount (and whenever `deps` change), tracking
 * loading/error/data and discarding results from superseded calls.
 */
export function useAsync(loader, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: immediate,
  });

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  // Only the newest run is allowed to write state.
  const runId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const id = (runId.current += 1);
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      if (!mounted.current || id !== runId.current) return data;
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (error?.name === "AbortError") return null;
      if (!mounted.current || id !== runId.current) return null;
      setState({ data: null, error, loading: false });
      return null;
    }
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === "function" ? updater(prev.data) : updater,
    }));
  }, []);

  return { ...state, reload: run, setData };
}
