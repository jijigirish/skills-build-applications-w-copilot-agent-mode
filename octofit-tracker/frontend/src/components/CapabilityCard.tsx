import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  emptyText: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, load, emptyText, isEmpty, renderData }: Props<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    load()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>
    {loading && <p role="status">Loading {title.toLowerCase()}...</p>}
    {!loading && error && <p role="alert">Unable to load {title.toLowerCase()}.</p>}
    {!loading && !error && data && isEmpty(data) && <p>{emptyText}</p>}
    {!loading && !error && data && !isEmpty(data) && renderData(data)}
  </div></section>;
}
