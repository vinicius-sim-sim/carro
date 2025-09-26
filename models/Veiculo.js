// models/Veiculo.js
import mongoose from 'mongoose';

const veiculoSchema = new mongoose.Schema({
    placa: {
        type: String,
        required: [true, 'A placa é obrigatória.'],
        unique: true,
        uppercase: true,
        trim: true
    },
    marca: { type: String, required: [true, 'A marca é obrigatória.'] },
    modelo: { type: String, required: [true, 'O modelo é obrigatório.'] },
    ano: {
        type: Number,
        required: [true, 'O ano é obrigatório.'],
        min: [1900, 'O ano deve ser no mínimo 1900.'],
        max: [new Date().getFullYear() + 1, 'O ano não pode ser no futuro.']
    },
    cor: { type: String },
    tipoVeiculo: {
        type: String,
        required: true,
        enum: ['Carro', 'CarroEsportivo', 'Caminhao']
    },
    apiId: { type: String },
    capacidadeCarga: { type: Number, default: 0 },
    // --- CAMPO ADICIONADO ---
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referência ao modelo 'User'
        required: true
    }
}, {
    timestamps: true
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;