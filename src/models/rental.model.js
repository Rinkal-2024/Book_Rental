import mongoose from 'mongoose';
const rentalSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  renterName: {
    type: String,
    required: [true, 'Renter name is required'],
    trim: true,
    minlength: [2, 'Renter name must be at least 2 characters long'],
    maxlength: [100, 'Renter name cannot exceed 100 characters']
  },
  renterEmail: {
    type: String,
    required: [true, 'Renter email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  renterPhone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[\d\s\-\+\(\)]+$/.test(v);
      },
      message: 'Phone number contains invalid characters'
    }
  },
  rentalDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v > this.rentalDate;
      },
      message: 'Due date must be after rental date'
    }
  },
  returnDate: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v >= this.rentalDate;
      },
      message: 'Return date cannot be before rental date'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'returned', 'overdue'],
      message: 'Invalid rental status'
    },
    default: 'active'
  },
  lateFee: {
    type: Number,
    default: 0,
    min: [0, 'Late fee cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

rentalSchema.virtual('rentalDuration').get(function() {
  if (this.returnDate) {
    return Math.ceil((this.returnDate - this.rentalDate) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((new Date() - this.rentalDate) / (1000 * 60 * 60 * 24));
});

rentalSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'returned') return 0;
  const today = new Date();
  const overdue = Math.ceil((today - this.dueDate) / (1000 * 60 * 60 * 24));
  return overdue > 0 ? overdue : 0;
});

rentalSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && this.daysOverdue > 0;
});

rentalSchema.index({ book: 1 });
rentalSchema.index({ renterEmail: 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ rentalDate: -1 });
rentalSchema.index({ dueDate: 1 });
rentalSchema.index({ book: 1, status: 1 });

rentalSchema.pre('save', function(next) {
  if (this.isModified('returnDate') && this.returnDate) {
    this.status = 'returned';
  } else if (this.status === 'active' && this.daysOverdue > 0) {
    this.status = 'overdue';
  }
  next();
});

rentalSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).populate('book');
};

rentalSchema.statics.findOverdue = function() {
  return this.find({ 
    status: 'active',
    dueDate: { $lt: new Date() }
  }).populate('book');
};

rentalSchema.statics.findByRenter = function(email) {
  return this.find({ renterEmail: email }).populate('book');
};

rentalSchema.statics.findByBook = function(bookId) {
  return this.find({ book: bookId }).populate('book');
};

rentalSchema.methods.returnBook = function() {
  if (this.status === 'returned') {
    throw new Error('Book is already returned');
  }
  
  this.returnDate = new Date();
  this.status = 'returned';
  
  if (this.daysOverdue > 0) {
    this.lateFee = this.daysOverdue * 1; // $1 per day late fee
  }
  
  return this.save();
};

rentalSchema.methods.calculateTotalFee = function(baseRate = 0) {
  return baseRate + this.lateFee;
};

export default mongoose.model('Rental', rentalSchema);
