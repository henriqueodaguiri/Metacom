function createResponse({ body = null, status = 200, headers = { "Content-Type": "application/json" } }) {
  const responseOptions = {
    status,
    headers,
  };

  if (body !== null) {
    responseOptions.body = JSON.stringify(body);
  }

  return new Response(body !== null ? JSON.stringify(body) : null, responseOptions);
}

module.exports = createResponse;
