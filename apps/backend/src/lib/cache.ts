import NodeCache from 'node-cache';

const ttl = parseInt(process.env.GOOGLE_REVIEWS_CACHE_TTL || '3600', 10);
const cache = new NodeCache({ stdTTL: ttl });

export default cache;
