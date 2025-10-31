// ARQUIVO: server.js (SUBSTITUA TODO O CONTEÚDO)

// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv'; // PASSO 1: Importa a biblioteca
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

// PASSO 2: Executa a configuração. Esta linha DEVE vir ANTES de qualquer uso de 'process.env'
dotenv.config();

// ----- IMPORTAR OS MODELOS -----
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js';
import User from './models/User.js';

// ----- IMPORTAR O MIDDLEWARE -----
import authMiddleware from './middleware/auth.js';


// ------------------- CONFIGURAÇÃO INICIAL -------------------
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
const allowedOrigins = [
  'https://carro-chi.vercel.app',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  }
}));
app.use(express.json());

// Configuração para servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static('uploads'));

// Configuração do Multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


// ------------------- CONEXÃO COM O MONGODB ATLAS -------------------
const mongoUri = process.env.MONGO_URI; // PASSO 3: Usa a variável carregada

async function connectDatabase() {
  if (!mongoUri) {
    console.error("ERRO FATAL: A variável de ambiente MONGO_URI não foi definida.");
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log("🚀 Conectado com sucesso ao MongoDB Atlas via Mongoose!");
  } catch (error) {
    console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB:", error.message);
    process.exit(1);
  }
}

// ------------------- ROTAS (ENDPOINTS) DA API -------------------

app.get('/', (req, res) => {
  res.send('API da Garagem Inteligente está no ar!');
});

// =================== ROTAS DE AUTENTICAÇÃO ===================

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Credenciais inválidas.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Credenciais inválidas.' });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, user: { email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


// =================== ROTAS DE VEÍCULOS ===================

app.post('/api/veiculos', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        const { placa, marca, modelo, ano, cor, tipoVeiculo, apiId, capacidadeCarga } = req.body;
        const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;
        const novoVeiculoData = { placa, marca, modelo, ano, cor, tipoVeiculo, apiId, capacidadeCarga, imageUrl, owner: req.userId };
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: `Veículo com a placa '${error.keyValue.placa}' já existe.` });
        res.status(500).json({ message: 'Erro interno ao criar veículo.' });
    }
});

app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const veiculosDoUsuario = await Veiculo.find({ $or: [{ owner: req.userId }, { sharedWith: req.userId }] })
            .populate('owner', 'email').populate('sharedWith', 'email _id');
        res.json(veiculosDoUsuario);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao buscar veículos.' });
    }
});

app.post('/api/veiculos/:veiculoId/share', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { email: emailToShare } = req.body;
        if (!emailToShare) return res.status(400).json({ message: 'O e-mail para compartilhamento é obrigatório.' });
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo || veiculo.owner.toString() !== req.userId) return res.status(403).json({ message: 'Acesso negado. Você não é o proprietário.' });
        const userToShareWith = await User.findOne({ email: emailToShare });
        if (!userToShareWith) return res.status(404).json({ message: `Usuário com o e-mail '${emailToShare}' não encontrado.` });
        if (userToShareWith._id.equals(veiculo.owner)) return res.status(400).json({ message: 'Você não pode compartilhar um veículo consigo mesmo.' });
        if (veiculo.sharedWith.includes(userToShareWith._id)) return res.status(409).json({ message: 'Este veículo já foi compartilhado com este usuário.' });
        veiculo.sharedWith.push(userToShareWith._id);
        await veiculo.save();
        res.status(200).json({ message: `Veículo compartilhado com sucesso com ${emailToShare}.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.post('/api/veiculos/:veiculoId/unshare', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { userIdToRemove } = req.body;
        if (!userIdToRemove) return res.status(400).json({ message: 'ID do usuário a ser removido é obrigatório.' });
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo || veiculo.owner.toString() !== req.userId) return res.status(403).json({ message: 'Acesso negado. Você não é o proprietário.' });
        await Veiculo.updateOne({ _id: veiculoId }, { $pull: { sharedWith: userIdToRemove } });
        res.status(200).json({ message: 'Compartilhamento removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});


// =================== ROTAS DE MANUTENÇÃO ===================

app.post('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.userId });
        if (!veiculo) return res.status(403).json({ message: 'Veículo não encontrado ou você não tem permissão.' });
        const novaManutencaoData = { ...req.body, veiculo: veiculoId };
        const manutencaoCriada = await Manutencao.create(novaManutencaoData);
        res.status(201).json(manutencaoCriada);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao criar manutenção.' });
    }
});

app.get('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.userId });
        if (!veiculo) return res.status(403).json({ message: 'Veículo não encontrado ou você não tem permissão.' });
        const manutencoes = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        res.status(200).json(manutencoes);
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao buscar manutenções.' });
    }
});


// ------------------- Rota para previsão do tempo (PÚBLICA) -------------------
app.get('/api/previsao/:cidade', async (req, res) => {
  const { cidade } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'Chave da API de clima não configurada.' });
  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  try {
    const response = await axios.get(weatherAPIUrl);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ message: error.response?.data?.message || 'Erro ao buscar previsão.' });
  }
});

// ------------------- INICIALIZAÇÃO DO SERVIDOR -------------------
async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta: ${port}`);
    if (!process.env.JWT_SECRET) console.warn("ATENÇÃO: JWT_SECRET não foi encontrada no .env.");
  });
}

startServer();