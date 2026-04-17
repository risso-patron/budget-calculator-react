/* @vitest-environment node */


import { handler, __private } from '../../netlify/functions/ai-proxy.js';

describe('ai-proxy security', () => {
  beforeEach(() => {
    __private.clearRateLimits();
    delete process.env.ALLOWED_ORIGINS;
  });

  it('rechaza solicitudes sin token', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({ prompt: 'hola' }),
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error).toBe('No autorizado');
  });

  it('rate limit helper bloquea despues del umbral', () => {
    const key = 'user-1:127.0.0.1';

    let lastAllowed = true;
    for (let i = 0; i < 10; i += 1) {
      lastAllowed = __private.checkRateLimitMemory(key);
    }

    expect(lastAllowed).toBe(true);
    expect(__private.checkRateLimitMemory(key)).toBe(false);
  });

  it('valida origen permitido cuando ALLOWED_ORIGINS esta configurado', () => {
    process.env.ALLOWED_ORIGINS = 'https://budget-calculator.netlify.app,https://app.example.com';

    expect(__private.isOriginAllowed('https://budget-calculator.netlify.app')).toBe(true);
    expect(__private.isOriginAllowed('https://evil.example')).toBe(false);
  });
});
