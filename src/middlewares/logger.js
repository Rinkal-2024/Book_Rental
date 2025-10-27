import morgan from 'morgan';
const logger = morgan('combined', {
  skip: (req, res) => {
    return req.url === '/health' || req.url === '/api/health';
  }
});

const devLogger = morgan('dev', {
  skip: (req, res) => {
    return req.url === '/health' || req.url === '/api/health';
  }
});

const errorLogger = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });
  next(err);
};

export {
  logger,
  devLogger,
  errorLogger
};
