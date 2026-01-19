export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return corsResponse('', 204);
    }

    if (url.pathname === '/api/parse') {
      return handleParse(request);
    }

    if (url.pathname === '/api/fetch') {
      return handleFetch(request);
    }

    return corsResponse('Not Found', 404);
  },
};

function corsResponse(body, status = 200, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  headers.set('Access-Control-Allow-Headers', '*');
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');

  return new Response(body, {
    status,
    headers,
  });
}

async function handleParse(request) {
  if (request.method !== 'POST') {
    return corsResponse('Method Not Allowed', 405);
  }

  const targetUrl = 'http://api.rcuts.com/Video/DouYin_All.php';
  const proxyRequest = new Request(targetUrl, request);
  const response = await fetch(proxyRequest);

  return corsResponse(response.body, response.status, response.headers);
}

async function handleFetch(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return corsResponse('Method Not Allowed', 405);
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) {
    return corsResponse('Missing url parameter', 400);
  }

  const response = await fetch(targetUrl, { method: request.method });
  return corsResponse(response.body, response.status, response.headers);
}
