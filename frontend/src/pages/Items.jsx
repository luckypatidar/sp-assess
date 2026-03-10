import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { List } from 'react-window';

const ROW_HEIGHT = 40;

function ItemRow({ index, style, items = [], ariaAttributes }) {
  const item = items[index];
  if (!item) return <div style={style} {...(ariaAttributes || {})} />;
  return (
    <div
      style={{ ...style, padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb' }}
      {...(ariaAttributes || {})}
    >
      <Link to={'/items/' + item.id}>{item.name}</Link>
    </div>
  );
}

function SkeletonRow({ index, style, ariaAttributes }) {
  return (
    <div
      style={{
        ...style,
        padding: '0.5rem 0.75rem',
        background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)',
      }}
      {...(ariaAttributes || {})}
    >
      <div
        style={{
          height: '0.9rem',
          width: '60%',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #e5e7eb 0px, #f9fafb 40px, #e5e7eb 80px)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.2s ease-in-out infinite',
        }}
      />
    </div>
  );
}

function Items() {
  const { items, total, page, pageSize, query, loading, error, fetchItems } = useData();
  const [search, setSearch] = useState(query || '');

  useEffect(() => {
    const controller = new AbortController();

    fetchItems({ signal: controller.signal, page, q: query }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });

    return () => {
      controller.abort();
    };
  }, [fetchItems, page, query]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const controller = new AbortController();
    fetchItems({ signal: controller.signal, page: 1, q: value }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const controller = new AbortController();
    fetchItems({ signal: controller.signal, page: nextPage, q: search }).catch((error) => {
      if (error.name !== 'AbortError') {
        console.error(error);
      }
    });
  };

  return (
    <div>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search items..."
          aria-label="Search items"
        />
        {loading && (
          <span aria-live="polite" style={{ fontSize: '0.875rem', color: '#555' }}>
            Loading…
          </span>
        )}
      </div>

      {error && (
        <div role="alert" style={{ marginBottom: '0.5rem', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {loading && !items.length ? (
        <List
          key="skeleton"
          rowComponent={SkeletonRow}
          rowCount={5}
          rowHeight={ROW_HEIGHT}
          rowProps={{}}
          style={{ height: 200, width: '100%' }}
        />
      ) : items.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <List
          key="items"
          rowComponent={ItemRow}
          rowCount={items.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ items }}
          style={{ height: 400, width: '100%' }}
        />
      )}

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || loading}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || loading}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;