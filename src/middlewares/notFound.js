import ApiError from '../utils/ApiError.js';
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new ApiError(404, message);
  next(error);
};

export default notFound;
