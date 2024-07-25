const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    bio: { type: String, default: "" },
    role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});


const User = model('User', userSchema); 

module.exports = User;
