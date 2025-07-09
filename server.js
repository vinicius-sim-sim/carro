// server.js

// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';

// ------------------- CONFIGURAÇÃO INICIAL -------------------
dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: 'https://carro-chi.vercel.app' })); // Configura o CORS
app.use(express.json()); // Permite o servidor entender JSON

// ------------------- CONEXÃO COM O MONGODB ATLAS -------------------
const mongoUri = process.env.MONGO_URI_CRUD;

async function connectDatabase() {
  if (!mongoUri) {
    console.error("ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não foi definida.");
    process.exit(1); // Encerra o programa se a URI não estiver configurada
  }

  try {
    // Tenta conectar ao banco de dados
    await mongoose.connect(mongoUri);
    console.log("🚀 Conectado com sucesso ao MongoDB Atlas via Mongoose!");

    // Monitora eventos após a conexão inicial
    mongoose.connection.on('error', (err) => console.error("❌ Erro de conexão do Mongoose:", err));
    mongoose.connection.on('disconnected', () => console.warn("⚠️ Mongoose desconectado."));

  } catch (error) {
    console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB:", error.message);
    process.exit(1); // Encerra o programa se a conexão inicial falhar
  }
}

// ------------------- ROTAS (ENDPOINTS) DA API -------------------

// Rota principal para teste
app.get('/', (req, res) => {
  res.send('API da Garagem Inteligente está no ar!');
});

// Rota para previsão do tempo
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
  // 1. Primeiro, conecta ao banco de dados
  await connectDatabase();

  // 2. Se a conexão for bem-sucedida, inicia o servidor web
  app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta: ${port}`);
    if (!process.env.OPENWEATHER_API_KEY) {
      console.warn("-> ATENÇÃO: OPENWEATHER_API_KEY não foi encontrada no .env");
    }
  });
}

// Inicia todo o processo
startServer();