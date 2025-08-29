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
    // --- NOVOS CAMPOS ---
    tipoVeiculo: {
        type: String,
        required: true,
        enum: ['Carro', 'CarroEsportivo', 'Caminhao'] // Garante que apenas estes valores sejam aceitos
    },
    apiId: { type: String }, // ID para a API de detalhes extras
    capacidadeCarga: { type: Number, default: 0 }, // Específico para Caminhao
}, { 
    timestamps: true 
});

const Veiculo = mongoose.model('Veiculo', veiculoSchema);

export default Veiculo;