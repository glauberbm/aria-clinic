import { NextResponse } from 'next/server';
import { setCORSHeaders, handleCORSPreflight } from '@/lib/cors';

describe('CORS Headers', () => {
  describe('setCORSHeaders', () => {
    it('should add CORS headers for allowed origin', () => {
      const response = new NextResponse();
      const allowedOrigin = 'http://localhost:3000';

      const corsResponse = setCORSHeaders(response, allowedOrigin);

      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(corsResponse.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
      expect(corsResponse.headers.get('Access-Control-Max-Age')).toBe('86400');
    });

    it('should not add CORS headers for disallowed origin', () => {
      const response = new NextResponse();
      const disallowedOrigin = 'http://evil.com';

      const corsResponse = setCORSHeaders(response, disallowedOrigin);

      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBeNull();
      expect(corsResponse.headers.get('Access-Control-Allow-Methods')).toBeNull();
    });

    it('should accept undefined origin and not add headers', () => {
      const response = new NextResponse();

      const corsResponse = setCORSHeaders(response, undefined);

      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should allow NEXT_PUBLIC_APP_URL environment variable', () => {
      const appUrl = 'https://ariacle.com';
      process.env.NEXT_PUBLIC_APP_URL = appUrl;

      const response = new NextResponse();
      const corsResponse = setCORSHeaders(response, appUrl);

      expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBe(appUrl);

      delete process.env.NEXT_PUBLIC_APP_URL;
    });
  });

  describe('handleCORSPreflight', () => {
    it('should return 200 with CORS headers for allowed origin', () => {
      const allowedOrigin = 'http://localhost:3000';
      const response = handleCORSPreflight(allowedOrigin);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('should return 403 for disallowed origin', () => {
      const disallowedOrigin = 'http://evil.com';
      const response = handleCORSPreflight(disallowedOrigin);

      expect(response.status).toBe(403);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should return 403 for undefined origin', () => {
      const response = handleCORSPreflight(undefined);

      expect(response.status).toBe(403);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    });

    it('should include all required CORS methods', () => {
      const allowedOrigin = 'http://localhost:3000';
      const response = handleCORSPreflight(allowedOrigin);

      const methods = response.headers.get('Access-Control-Allow-Methods');
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
      expect(methods).toContain('OPTIONS');
    });

    it('should set max-age to 24 hours (86400 seconds)', () => {
      const allowedOrigin = 'http://localhost:3000';
      const response = handleCORSPreflight(allowedOrigin);

      expect(response.headers.get('Access-Control-Max-Age')).toBe('86400');
    });
  });

  describe('CORS security', () => {
    it('should prevent unauthorized origins from making cross-origin requests', () => {
      const unauthorizedOrigins = [
        'http://evil.com',
        'https://malicious.com',
        'http://localhost:8080', // Different port
        'http://127.0.0.1:3000', // Different host
      ];

      unauthorizedOrigins.forEach(origin => {
        const response = new NextResponse();
        const corsResponse = setCORSHeaders(response, origin);
        expect(corsResponse.headers.get('Access-Control-Allow-Origin')).toBeNull();
      });
    });

    it('should only allow specific methods to prevent abuse', () => {
      const response = handleCORSPreflight('http://localhost:3000');
      const methods = response.headers.get('Access-Control-Allow-Methods');

      // Should only allow safe methods
      expect(methods).not.toContain('PATCH');
      expect(methods).not.toContain('HEAD');
      expect(methods).not.toContain('TRACE');
    });

    it('should restrict header types in CORS requests', () => {
      const response = handleCORSPreflight('http://localhost:3000');
      const headers = response.headers.get('Access-Control-Allow-Headers');

      // Should only allow specific headers
      expect(headers).toBe('Content-Type, Authorization');
      expect(headers).not.toContain('X-Custom-Header');
    });
  });
});
