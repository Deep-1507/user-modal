require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose');

// Ensure the environment variable is set and provide a fallback or handle errors
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined in the .env file');
  process.exit(1); // Exit the process with an error code
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
  process.exit(1); // Exit the process with an error code
});


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    firstlogin:{
         type:Boolean,
         required:true,
     },
     otp:{
         type:Number,
         required:true,
     },
     otp_expiry:{
        type:String,
        required:true,
    }
},{
    collection:'users' // Specify the collection name here
});


const User = mongoose.model('User',userSchema);

module.exports={
    User
};