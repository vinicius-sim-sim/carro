import mongoose from 'mongoose';

const manutencaoSchema = new mongoose.Schema({
    descricaoServico: {
        type: String,
        required: [true, 'A descrição do serviço é obrigatória.']
    },
    data: {
        type: Date,
        required: true,
        default: Date.now
    },
    custo: {
        type: Number,
        required: [true, 'O custo é obrigatório.'],
        min: [0, 'O custo não pode ser negativo.']
    },
    quilometragem: {
        type: Number,
        min: [0, 'A quilometragem não pode ser negativa.']
    },
    // Este é o campo que conecta a manutenção ao veículo
    veiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veiculo', // Diz ao Mongoose que este ID se refere a um documento do modelo 'Veiculo'
        required: true
    }
}, {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

const Manutencao = mongoose.model('Manutencao', manutencaoSchema);

export default Manutencao;