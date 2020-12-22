export const GA = null;
export const debug = location.hostname.endsWith('.netlify.live') || location.hostname === 'localhost';
export const domain = debug ? location.hostname : 'kernvalley.us';
