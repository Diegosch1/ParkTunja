import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'admin'], // usertypes
        default: 'user'
    }
},{timestamps: true}); //timestamps will add createdAt and updatedAt to the schema

export default mongoose.model('User', userSchema)