const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
  name:{type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isGoogleUser: { type: String, required: false},
  role: { type: String, enum: ['lawyer', 'client'], required: true },
  googleId: { type: String, required: false }, 
  // adminId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
  resetToken:{
        type: String
    },
    resetTokenExpiry:{
        type: Date
    }
});

module.exports = mongoose.model('User', UsersSchema);
