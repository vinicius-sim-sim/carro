// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'O e-mail é obrigatório.'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'A senha é obrigatória.']
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;