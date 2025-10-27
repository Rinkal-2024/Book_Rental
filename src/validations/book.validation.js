import Joi from 'joi';
const createBookSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  author: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Author name must be at least 2 characters long',
      'string.max': 'Author name cannot exceed 100 characters',
      'any.required': 'Author is required'
    }),
  
  genre: Joi.string()
    .valid(
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Thriller',
      'Science Fiction', 'Fantasy', 'Biography', 'History',
      'Self-Help', 'Business', 'Technology', 'Health', 'Travel',
      'Cooking', 'Art', 'Music', 'Sports', 'Education', 'Other'
    )
    .required()
    .messages({
      'any.only': 'Invalid genre selected',
      'any.required': 'Genre is required'
    }),
  
  isbn: Joi.string()
    .pattern(/^[\d-]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'ISBN must contain only numbers and hyphens'
    }),
  
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.min': 'Published year must be valid',
      'number.max': 'Published year cannot be in the future'
    }),
  
  totalCopies: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.min': 'Total copies must be at least 1',
      'number.max': 'Total copies cannot exceed 1000',
      'any.required': 'Total copies is required'
    }),
  
  availableCopies: Joi.number()
    .integer()
    .min(0)
    .max(Joi.ref('totalCopies'))
    .required()
    .messages({
      'number.min': 'Available copies cannot be negative',
      'number.max': 'Available copies cannot exceed total copies',
      'any.required': 'Available copies is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  coverImage: Joi.string()
    .uri()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .optional()
    .messages({
      'string.uri': 'Cover image must be a valid URL',
      'string.pattern.base': 'Cover image must be a valid image URL'
    })
});

const updateBookSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  author: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Author name must be at least 2 characters long',
      'string.max': 'Author name cannot exceed 100 characters'
    }),
  
  genre: Joi.string()
    .valid(
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Thriller',
      'Science Fiction', 'Fantasy', 'Biography', 'History',
      'Self-Help', 'Business', 'Technology', 'Health', 'Travel',
      'Cooking', 'Art', 'Music', 'Sports', 'Education', 'Other'
    )
    .optional()
    .messages({
      'any.only': 'Invalid genre selected'
    }),
  
  isbn: Joi.string()
    .pattern(/^[\d-]+$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'ISBN must contain only numbers and hyphens'
    }),
  
  publishedYear: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.min': 'Published year must be valid',
      'number.max': 'Published year cannot be in the future'
    }),
  
  totalCopies: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.min': 'Total copies must be at least 1',
      'number.max': 'Total copies cannot exceed 1000'
    }),
  
  availableCopies: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Available copies cannot be negative'
    }),
  
  description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  coverImage: Joi.string()
    .uri()
    .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Cover image must be a valid URL',
      'string.pattern.base': 'Cover image must be a valid image URL'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be a boolean value'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getBooksQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  genre: Joi.string()
    .valid(
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Thriller',
      'Science Fiction', 'Fantasy', 'Biography', 'History',
      'Self-Help', 'Business', 'Technology', 'Health', 'Travel',
      'Cooking', 'Art', 'Music', 'Sports', 'Education', 'Other'
    )
    .optional()
    .messages({
      'any.only': 'Invalid genre filter'
    }),
  
  available: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Available filter must be a boolean value'
    }),
  
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search term must be at least 1 character',
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  
  sortBy: Joi.string()
    .valid('title', 'author', 'genre', 'publishedYear', 'createdAt', 'availableCopies')
    .default('createdAt')
    .messages({
      'any.only': 'Invalid sort field'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const bookIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid book ID format',
      'any.required': 'Book ID is required'
    })
});

export {
  createBookSchema,
  updateBookSchema,
  getBooksQuerySchema,
  bookIdSchema
};
