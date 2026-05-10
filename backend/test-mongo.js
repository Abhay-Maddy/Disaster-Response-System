const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:Abhay%402006@cluster0.3fk6reb.mongodb.net/disasterDB?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ MongoDB connected');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
