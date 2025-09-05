// server.js

// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';

// ----- IMPORTAR OS MODELOS -----
import Veiculo from './models/Veiculo.js';
// A LINHA ABAIXO É A MAIS IMPORTANTE PARA A CORREÇÃO.
// Garante que estamos importando o arquivo com "M" maiúsculo.
import Manutencao from './models/Manutencao.js';


// ------------------- CONFIGURAÇÃO INICIAL -------------------
dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
// Lista de origens permitidas
const allowedOrigins = [
  'https://carro-chi.vercel.app', // Seu frontend no Vercel
  'http://127.0.0.1:5500',      // Seu ambiente de desenvolvimento local
  'http://localhost:5500'        // Outra variação comum do ambiente local
];

// Configuração do CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS para este site não permite acesso da origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json());

// ------------------- CONEXÃO COM O MONGODB ATLAS -------------------
const mongoUri = process.env.MONGO_URI_CRUD;

async function connectDatabase() {
  if (!mongoUri) {
    console.error("ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não foi definida.");
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log("🚀 Conectado com sucesso ao MongoDB Atlas via Mongoose!");
    mongoose.connection.on('error', (err) => console.error("❌ Erro de conexão do Mongoose:", err));
    mongoose.connection.on('disconnected', () => console.warn("⚠️ Mongoose desconectado."));
  } catch (error) {
    console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB:", error.message);
    process.exit(1);
  }
}

// ------------------- ROTAS (ENDPOINTS) DA API -------------------

app.get('/', (req, res) => {
  res.send('API da Garagem Inteligente está no ar!');
});

// ----- ENDPOINTS DO CRUD DE VEÍCULOS -----

app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: `Veículo com a placa '${error.keyValue.placa}' já existe.` });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find();
        console.log('[Servidor] Buscando todos os veículos do DB.');
        res.json(todosOsVeiculos);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// ------------------- ROTAS DE SUB-RECURSO: MANUTENÇÕES DE VEÍCULOS -------------------

app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const novaManutencaoData = { ...req.body, veiculo: veiculoId };
        const manutencaoCriada = await Manutencao.create(novaManutencaoData);
        console.log(`[Servidor] Manutenção criada para o veículo ${veiculoId}:`, manutencaoCriada);
        res.status(201).json(manutencaoCriada);
    } catch (error) {
        console.error("[Servidor] Erro ao criar manutenção:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar manutenção.' });
    }
});

app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const manutencoes = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        console.log(`[Servidor] Buscando manutenções para o veículo ${veiculoId}. Encontradas: ${manutencoes.length}`);
        res.status(200).json(manutencoes);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar manutenções:", error);
        res.status(500).json({ error: 'Erro interno ao buscar manutenções.' });
    }
});

// ------------------- Rota para previsão do tempo (EXISTENTE) -------------------
app.get('/api/previsao/:cidade', async (req, res) => {
  const { cidade } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API de clima não configurada no servidor.' });
  }
  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  try {
    const response = await axios.get(weatherAPIUrl);
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erro ao buscar previsão do tempo.';
    res.status(status).json({ error: message });
  }
});

// ------------------- INICIALIZAÇÃO DO SERVIDOR -------------------
async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta: ${port}`);
    if (!process.env.OPENWEATHER_API_KEY) {
      console.warn("-> ATENÇÃO: OPENWEATHER_API_KEY não foi encontrada no .env");
    }
  });
}

startServer();