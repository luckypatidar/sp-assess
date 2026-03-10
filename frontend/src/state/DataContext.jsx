import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(
    async ({ signal, page: requestedPage = 1, q = '' } = {}) => {
      const params = new URLSearchParams();
      params.set('page', String(requestedPage));
      params.set('limit', String(pageSize));
      if (q) params.set('q', q);

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:4001/api/items?${params.toString()}`, { signal });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const json = await res.json();

        setItems(json.items || []);
        setTotal(json.total || 0);
        setPage(json.page || requestedPage);
        setQuery(q);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load items');
        }
      } finally {
        if (!signal || !signal.aborted) {
          setLoading(false);
        }
      }
    },
    [pageSize]
  );

  return (
    <DataContext.Provider
      value={{
        items,
        total,
        page,
        pageSize,
        query,
        loading,
        error,
        fetchItems,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);