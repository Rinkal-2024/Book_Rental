import mongoose from 'mongoose';
const connectTestDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/book-rental-api-test';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Test database connected');
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
};

const cleanupDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

const closeTestDB = async () => {
  await mongoose.connection.close();
  console.log('Test database connection closed');
};

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await cleanupDB();
});

afterAll(async () => {
  await closeTestDB();
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection in test:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in test:', err);
});
