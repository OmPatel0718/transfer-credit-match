import { useEffect, useState } from 'react';

export function useApiData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const json = (await response.json()) as T;
      setData(json);
    } catch (err) {
      console.error(err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [url]);

  return { data, loading, error, reload: load };
}

