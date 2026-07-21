function notFound(req, res) {
  res.status(404).json({ error: `Nie znaleziono: ${req.method} ${req.originalUrl}` });
}

// Express recognizes an error-handling middleware by its 4 arguments.
// Any synchronous throw in a route handler ends up here automatically.
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: "Coś poszło nie tak po stronie serwera." });
}

module.exports = { notFound, errorHandler };
