// This file provides polyfills for Firebase to work properly with Next.js

if (typeof window === 'undefined') {
  // Server-side polyfills
  global.fetch = fetch;
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
}

export {}; 