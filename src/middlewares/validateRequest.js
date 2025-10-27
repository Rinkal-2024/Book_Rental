import Joi from 'joi';
import ApiError from '../utils/ApiError.js';
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new ApiError(400, errorMessage));
    }

    req[property] = value;
    next();
  };
};

const validateBody = (schema) => validateRequest(schema, 'body');

const validateQuery = (schema) => validateRequest(schema, 'query');

const validateParams = (schema) => validateRequest(schema, 'params');

export {
  validateRequest,
  validateBody,
  validateQuery,
  validateParams
};
