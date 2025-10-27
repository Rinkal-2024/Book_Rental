import mongoose from 'mongoose';
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    minlength: [2, 'Author name must be at least 2 characters long'],
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    enum: {
      values: [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Thriller', 
        'Science Fiction', 'Fantasy', 'Biography', 'History', 
        'Self-Help', 'Business', 'Technology', 'Health', 'Travel',
        'Cooking', 'Art', 'Music', 'Sports', 'Education', 'Other'
      ],
      message: 'Invalid genre'
    }
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\d-]+$/.test(v);
      },
      message: 'ISBN must contain only numbers and hyphens'
    }
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'Total copies must be at least 1'],
    max: [1000, 'Total copies cannot exceed 1000']
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  coverImage: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Cover image must be a valid URL ending with image extension'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookSchema.virtual('isAvailable').get(function() {
  return this.availableCopies > 0;
});

bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ genre: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ availableCopies: 1 });

bookSchema.pre('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    this.availableCopies = this.totalCopies;
  }
  next();
});

bookSchema.statics.findAvailable = function() {
  return this.find({ isActive: true, availableCopies: { $gt: 0 } });
};

bookSchema.statics.findByGenre = function(genre) {
  return this.find({ genre, isActive: true });
};

bookSchema.methods.canBeRented = function() {
  return this.isActive && this.availableCopies > 0;
};

bookSchema.methods.rentBook = function() {
  if (!this.canBeRented()) {
    throw new Error('Book is not available for rental');
  }
  this.availableCopies -= 1;
  return this.save();
};

bookSchema.methods.returnBook = function() {
  if (this.availableCopies >= this.totalCopies) {
    throw new Error('All copies are already available');
  }
  this.availableCopies += 1;
  return this.save();
};

export default mongoose.model('Book', bookSchema);
