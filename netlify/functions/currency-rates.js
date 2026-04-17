/**
 * Proxy para api.frankfurter.app
 * Resuelve el error CORS desde el dominio de Netlify.
 * El navegador llama a /.netlify/functions/currency-rates
 * y esta función relaya la petición al servidor de frankfurter.
 */
export const handler = async () => {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD');
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Upstream error', status: res.status }),
      };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // cachea 1 hora en CDN
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to fetch currency rates', message: err.message }),
    };
  }
};
