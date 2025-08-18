/**
 * ProxyService - Handles proxying API requests to avoid CORS issues
 * This service provides multiple proxy options and fallbacks.
 */

type ProxyStrategy = 'direct' | 'corsAnywhere' | 'allOrigins' | 'jsonp';

// Configuration for different proxy strategies
const PROXY_CONFIGS = {
  corsAnywhere: {
    url: 'https://cors-anywhere.herokuapp.com/',
    headers: {
      // Guard for React Native where window/location may be undefined
      'Origin': typeof window !== 'undefined' && (window as any).location && (window as any).location.origin
        ? (window as any).location.origin
        : '',
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  allOrigins: {
    url: 'https://api.allorigins.win/raw?url=',
    encode: true,
    headers: {}
  },
  // Add other proxy services here if needed
};

/**
 * Fetches a URL through various proxy strategies, with fallbacks
 * @param url The original URL to fetch
 * @param options Fetch options
 * @param preferredStrategy The preferred proxy strategy to try first
 * @returns The fetch response data or null
 */
export async function fetchWithProxy<T>(
  url: string,
  options: RequestInit = {},
  preferredStrategy: ProxyStrategy = 'direct'
): Promise<T | null> {
  // Try strategies in order (direct → preferred → all remaining)
  const strategyOrder = getStrategyOrder(preferredStrategy);
  
  let lastError: Error | null = null;
  
  // Try each strategy in order
  for (const strategy of strategyOrder) {
    try {
      const result = await fetchWithStrategy<T>(url, options, strategy);
      if (result) {
        console.log(`[Proxy] Successfully fetched with ${strategy} strategy`);
        return result;
      }
    } catch (error) {
      console.error(`[Proxy] ${strategy} strategy failed:`, error);
      lastError = error as Error;
    }
  }
  
  console.error('[Proxy] All strategies failed. Last error:', lastError);
  return null;
}

/**
 * Fetches a URL using a specific proxy strategy
 * @param url The original URL to fetch
 * @param options Fetch options
 * @param strategy The proxy strategy to use
 * @returns The fetch response data or null
 */
async function fetchWithStrategy<T>(
  url: string,
  options: RequestInit = {},
  strategy: ProxyStrategy
): Promise<T | null> {
  console.log(`[Proxy] Attempting ${strategy} strategy for: ${url}`);
  
  switch (strategy) {
    case 'direct':
      return directFetch<T>(url, options);
      
    case 'corsAnywhere':
      return corsAnywhereFetch<T>(url, options);
      
    case 'allOrigins':
      return allOriginsFetch<T>(url, options);
      
    case 'jsonp':
      throw new Error('JSONP strategy not implemented yet');
      
    default:
      throw new Error(`Unknown proxy strategy: ${strategy}`);
  }
}

/**
 * Fetches a URL directly without a proxy
 */
async function directFetch<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    console.error(`[Proxy] Direct fetch failed with status: ${response.status}`);
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return await response.json() as T;
}

/**
 * Fetches a URL through cors-anywhere proxy
 */
async function corsAnywhereFetch<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const config = PROXY_CONFIGS.corsAnywhere;
  const proxyUrl = `${config.url}${url}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...options.headers,
      ...config.headers
    }
  });
  
  if (!response.ok) {
    console.error(`[Proxy] CORS Anywhere fetch failed with status: ${response.status}`);
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return await response.json() as T;
}

/**
 * Fetches a URL through allorigins.win proxy
 */
async function allOriginsFetch<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const config = PROXY_CONFIGS.allOrigins;
  const proxyUrl = `${config.url}${config.encode ? encodeURIComponent(url) : url}`;
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers: {
      ...options.headers,
      ...config.headers
    }
  });
  
  if (!response.ok) {
    console.error(`[Proxy] AllOrigins fetch failed with status: ${response.status}`);
    throw new Error(`HTTP error: ${response.status}`);
  }
  
  return await response.json() as T;
}

/**
 * Gets the order of strategies to try
 */
function getStrategyOrder(preferredStrategy: ProxyStrategy): ProxyStrategy[] {
  const allStrategies: ProxyStrategy[] = ['direct', 'corsAnywhere', 'allOrigins'];
  
  if (preferredStrategy === 'direct') {
    return allStrategies;
  }
  
  // Move the preferred strategy to the front, after direct
  const filteredStrategies = allStrategies.filter(s => s !== preferredStrategy && s !== 'direct');
  return ['direct', preferredStrategy, ...filteredStrategies];
}

export default {
  fetchWithProxy
}; 