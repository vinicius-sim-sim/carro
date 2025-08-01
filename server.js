// server.js

// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';

// ----- [NOVO] IMPORTAR O MODELO DE VEÍCULO -----
import Veiculo from './models/Veiculo.js';


// ------------------- CONFIGURAÇÃO INICIAL -------------------
dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
// ATENÇÃO: Verifique se a URL do seu frontend no Vercel está correta aqui.
// Lista de origens permitidas
const allowedOrigins = [
  'https://carro-chi.vercel.app', // Seu frontend no Vercel
  'http://127.0.0.1:5500',      // Seu ambiente de desenvolvimento local
  'http://localhost:5500'        // Outra variação comum do ambiente local
];

// Configuração do CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (como Postman ou apps mobile)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'A política de CORS para este site não permite acesso da origem especificada.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(express.json()); // Permite o servidor entender JSON

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

// Rota principal para teste
app.get('/', (req, res) => {
  res.send('API da Garagem Inteligente está no ar!');
});


// ----- [NOVO] ENDPOINTS DO CRUD DE VEÍCULOS -----

// ENDPOINT POST /api/veiculos (CREATE)
app.post('/api/veiculos', async (req, res) => {
    try {
        const novoVeiculoData = req.body;
        // O Mongoose aplicará as validações do Schema aqui
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        
        console.log('[Servidor] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado); // Retorna o veículo criado com o _id do DB

    } catch (error) {
        console.error("[Servidor] Erro ao criar veículo:", error);
        // Tratamento de erros de validação e duplicidade do Mongoose
        if (error.code === 11000) { // Erro de placa duplicada (unique)
            return res.status(409).json({ error: `Veículo com a placa '${error.keyValue.placa}' já existe.` });
        }
        if (error.name === 'ValidationError') { // Erros de campos obrigatórios, min/max, etc.
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: messages.join(' ') });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

// ENDPOINT GET /api/veiculos (READ ALL)
app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find(); // .find() sem argumentos busca todos
        
        console.log('[Servidor] Buscando todos os veículos do DB.');
        res.json(todosOsVeiculos);

    } catch (error) {
        console.error("[Servidor] Erro ao buscar veículos:", error);
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
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