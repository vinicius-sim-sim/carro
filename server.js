// server.js

// Importações
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors'; // 1. IMPORTE O PACOTE CORS

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
const port = process.env.PORT || 3001;
const apiKey = process.env.OPENWEATHER_API_KEY;

// 2. CONFIGURE AS OPÇÕES DO CORS
const corsOptions = {
    // Especifique EXATAMENTE qual origem (seu site no Vercel) tem permissão.
    // Isso é muito mais seguro do que usar '*'.
    origin: 'https://carro-chi.vercel.app',
    optionsSuccessStatus: 200 // Para navegadores mais antigos
};

// 3. USE O MIDDLEWARE DO CORS
app.use(cors(corsOptions));

// O seu middleware antigo pode ser removido agora:
/*
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
*/


// ----- SEU ENDPOINT (continua igual) -----
app.get('/api/previsao/:cidade', async (req, res) => {
    const { cidade } = req.params;

    if (!apiKey) {
        console.error("[Servidor] ERRO: Chave da API não configurada.");
        return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
    }
    if (!cidade) {
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    console.log(`[Servidor] Recebida requisição para /api/previsao/${cidade}.`);

    try {
        const apiResponse = await axios.get(weatherAPIUrl);
        console.log('[Servidor] Dados recebidos da OpenWeatherMap com sucesso.');
        res.json(apiResponse.data);
    } catch (error) {
        console.error("[Servidor] Erro ao buscar previsão na OpenWeatherMap:", error.response?.data || error.message);
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || 'Erro interno ao buscar previsão do tempo.';
        res.status(status).json({ error: message });
    }
});

// ----- Rota Raiz para Teste -----
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está rodando!');
});

// --- Inicia o servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    if (!apiKey) {
        console.warn(`!!! ATENÇÃO: Variável de ambiente OPENWEATHER_API_KEY NÃO encontrada.`);
    } else {
        console.log("Chave da API OpenWeatherMap carregada com sucesso.");
    }
});