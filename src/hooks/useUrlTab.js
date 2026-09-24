import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Keeps a dashboard's selected tab in the URL (?tab=<key>) so sidebar links,
 * refreshes and shared links open the right tab. `keys` lists the tab keys in
 * the same order as the <Tab> elements; the first key is the default.
 * `?section=<key>` is accepted as an older alias.
 */
export default function useUrlTab(keys) {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') || params.get('section');
  const found = keys.indexOf(requested);
  const index = found >= 0 ? found : 0;

  const setIndex = useCallback((i) => {
    const next = new URLSearchParams(params);
    next.delete('section');
    next.set('tab', keys[i] || keys[0]);
    setParams(next, { replace: true });
  }, [params, setParams, keys]);

  return [index, setIndex];
}
