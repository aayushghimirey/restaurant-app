export const invalidateKey = (key: string | readonly string[]) => {
  const event = new CustomEvent('app-invalidate-key', { detail: { key } });
  window.dispatchEvent(event);
};

export const subscribeToInvalidation = (key: string | readonly string[], callback: () => void) => {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<{ key: string | readonly string[] }>;
    const eventKey = customEvent.detail.key;

    // Very simple matcher: if eventKey is an array, we match the first element
    // e.g. invalidate ['vendors'] matches ['vendors', 'list']
    let matches = false;
    
    const serializeKey = (k: string | readonly unknown[]) => 
      Array.isArray(k) ? k[0] : k; // just check broad matching for now

    if (serializeKey(eventKey) === serializeKey(key)) {
        matches = true;
    }

    if (matches) {
      callback();
    }
  };
  
  window.addEventListener('app-invalidate-key', listener);
  return () => window.removeEventListener('app-invalidate-key', listener);
};
