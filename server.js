// server.js

// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';

// ----- IMPORTAR OS MODELOS -----
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js'; // Garante que estamos importando o arquivo com "M" maiúsculo.


// ------------------- CONFIGURAÇÃO INICIAL -------------------
dotenv.config(); // Carrega as variáveis do arquivo .env

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
// Lista de origens permitidas
// ATENÇÃO: Adicione aqui TODAS as URLs onde seu frontend estará hospedado.
// Se você mudar o domínio do Vercel, precisa atualizar aqui.
const allowedOrigins = [
  'https://carro-chi.vercel.app', // Seu frontend no Vercel (EXEMPLO)
  'http://127.0.0.1:5500',      // Seu ambiente de desenvolvimento local
  'http://localhost:5500',        // Outra variação comum do ambiente local
  'http://localhost:3000'         // Se usar create-react-app ou similar
];

// Configuração do CORS
app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: de ferramentas como Postman ou requisições do mesmo servidor)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `A política de CORS para este site não permite acesso da origem especificada: ${origin}.`;
      console.error("[CORS Error] " + msg); // Log detalhado do erro de CORS
      return callback(new Error(msg), false);
    }
    console.log(`[CORS] Requisição da origem ${origin} permitida.`); // Log para sucesso de CORS
    return callback(null, true);
  }
}));
app.use(express.json());

// ------------------- CONEXÃO COM O MONGODB ATLAS -------------------
const mongoUri = process.env.MONGO_URI_CRUD;

async function connectDatabase() {
  if (!mongoUri) {
    console.error("ERRO FATAL: A variável de ambiente MONGO_URI_CRUD não foi definida. Verifique seu arquivo .env ou as configurações de ambiente no Render/Vercel.");
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log("🚀 Conectado com sucesso ao MongoDB Atlas via Mongoose!");
    mongoose.connection.on('error', (err) => console.error("❌ Erro de conexão do Mongoose:", err));
    mongoose.connection.on('disconnected', () => console.warn("⚠️ Mongoose desconectado."));
  } catch (error) {
    console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB:", error.message, error); // Log do objeto de erro completo
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
        console.log('[DEBUG] Recebido POST para /api/veiculos com dados:', novoVeiculoData); // Log dos dados recebidos
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        console.log('[DEBUG] Veículo criado com sucesso:', veiculoCriado);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        console.error("[ERROR] Erro ao criar veículo:", error); // Log do objeto de erro completo
        if (error.code === 11000) {
            return res.status(409).json({ error: `Veículo com a placa '${error.keyValue.placa}' já existe. Por favor, use uma placa diferente.` });
        }
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({ error: `Erro de validação: ${messages.join(' ')}` });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

app.get('/api/veiculos', async (req, res) => {
    try {
        const todosOsVeiculos = await Veiculo.find();
        console.log(`[DEBUG] Buscando todos os veículos do DB. Encontrados: ${todosOsVeiculos.length} veículos.`);
        res.json(todosOsVeiculos);
    } catch (error) {
        console.error("[ERROR] Erro ao buscar veículos:", error); // Log do objeto de erro completo
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// ------------------- ROTAS DE SUB-RECURSO: MANUTENÇÕES DE VEÍCULOS -------------------

app.post('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            console.warn(`[WARN] Tentativa de adicionar manutenção a veículo não encontrado: ${veiculoId}`);
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const novaManutencaoData = { ...req.body, veiculo: veiculoId };
        console.log(`[DEBUG] Recebido POST para manutenção do veículo ${veiculoId} com dados:`, novaManutencaoData); // Log dos dados recebidos
        const manutencaoCriada = await Manutencao.create(novaManutencaoData);
        console.log(`[DEBUG] Manutenção criada para o veículo ${veiculoId}:`, manutencaoCriada);
        res.status(201).json(manutencaoCriada);
    } catch (error) {
        console.error("[ERROR] Erro ao criar manutenção:", error); // Log do objeto de erro completo
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: `Erro de validação na manutenção: ${messages.join(' ')}` });
        }
        res.status(500).json({ error: 'Erro interno ao criar manutenção.' });
    }
});

app.get('/api/veiculos/:veiculoId/manutencoes', async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculoExistente = await Veiculo.findById(veiculoId);
        if (!veiculoExistente) {
            console.warn(`[WARN] Tentativa de buscar manutenção para veículo não encontrado: ${veiculoId}`);
            return res.status(404).json({ error: 'Veículo não encontrado.' });
        }
        const manutencoes = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        console.log(`[DEBUG] Buscando manutenções para o veículo ${veiculoId}. Encontradas: ${manutencoes.length}.`);
        res.status(200).json(manutencoes);
    } catch (error) {
        console.error("[ERROR] Erro ao buscar manutenções:", error); // Log do objeto de erro completo
        res.status(500).json({ error: 'Erro interno ao buscar manutenções.' });
    }
});

// ------------------- Rota para previsão do tempo (EXISTENTE) -------------------
app.get('/api/previsao/:cidade', async (req, res) => {
  const { cidade } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("ERRO: OPENWEATHER_API_KEY não configurada no servidor."); // Log de erro se a chave estiver ausente
    return res.status(500).json({ error: 'Chave da API de clima não configurada no servidor.' });
  }
  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  console.log(`[DEBUG] Buscando previsão para cidade: ${cidade} na URL: ${weatherAPIUrl}`); // Log da URL da API
  try {
    const response = await axios.get(weatherAPIUrl);
    res.json(response.data);
  } catch (error) {
    console.error(`[ERROR] Erro ao buscar previsão para ${cidade}:`, error.message, error.response?.data); // Log de erro detalhado da API externa
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
      console.warn("-> ATENÇÃO: OPENWEATHER_API_KEY não foi encontrada no .env. A previsão do tempo pode não funcionar.");
    }
  });
}

startServer();