// API wrapper with artificial latency and error injection
const API_CONFIG = {
  latencyRange: [200, 1200], // 200-1200ms artificial latency
  errorRate: 0.07, // 7% error rate (5-10% range)
  writeEndpoints: ['POST', 'PATCH', 'PUT', 'DELETE']
};

// Generate random latency within range
const getRandomLatency = () => {
  const min = API_CONFIG.latencyRange[0];
  const max = API_CONFIG.latencyRange[1];
  return Math.random() * (max - min) + min;
};

// Check if request should fail (error injection)
const shouldInjectError = (method) => {
  const isWrite = API_CONFIG.writeEndpoints.includes(method?.toUpperCase());
  return isWrite && Math.random() < API_CONFIG.errorRate;
};

// Enhanced fetch with latency and error injection
export const apiCall = async (url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  
  // Inject artificial latency for all requests
  const latency = getRandomLatency();
  await new Promise(resolve => setTimeout(resolve, latency));
  
  // Inject errors on write operations
  if (shouldInjectError(method)) {
    const errorMessages = [
      'Network timeout - please try again',
      'Server temporarily unavailable',
      'Connection failed - check your internet',
      'Request failed - please retry',
      'Service temporarily down'
    ];
    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    throw new Error(randomError);
  }
  
  // Make actual fetch request
  try {
    const response = await fetch(url, options);
    
    // Still check for actual HTTP errors
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // Re-throw with enhanced error message
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error - please check your connection');
    }
    throw error;
  }
};

// Convenience methods for different HTTP verbs
export const api = {
  get: (url) => apiCall(url),
  
  post: (url, data) => apiCall(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  patch: (url, data) => apiCall(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  put: (url, data) => apiCall(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  
  delete: (url) => apiCall(url, {
    method: 'DELETE'
  })
};

// Development helper to log API calls
if (process.env.NODE_ENV === 'development') {
  const originalApiCall = apiCall;
  
  window.apiCall = async (...args) => {
    const start = Date.now();
    try {
      const result = await originalApiCall(...args);
      const duration = Date.now() - start;
      console.log(`✅ API Call: ${args[0]} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`❌ API Call Failed: ${args[0]} (${duration}ms) - ${error.message}`);
      throw error;
    }
  };
}

export default api;
