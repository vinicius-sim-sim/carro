// server.js

// Importações
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios'; // Usaremos axios para fazer a chamada HTTP para a API externa

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o aplicativo Express
const app = express();
// Define a porta. Usa a variável de ambiente PORT (para deploy) ou 3001 por padrão.
// Use uma porta diferente daquela que seu frontend pode estar rodando (ex: 3000, 5500, etc.)
const port = process.env.PORT || 3001;
let apiKey = process.env.OPENWEATHER_API_KEY;



// Middleware para permitir que o frontend (rodando em outra porta/origem) acesse este backend
// (CORS - Cross-Origin Resource Sharing)
// Isso é essencial para que seu navegador permita que o JS do index.html (ex: rodando em localhost:5500)
// faça requisições para o seu servidor backend (ex: rodando em localhost:3001).
app.use((req, res, next) => {
    // Permitir acesso de qualquer origem. Em produção, você mudaria '*' para o domínio específico do seu frontend.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // Se você precisar lidar com métodos como POST, PUT, DELETE, adicione-os aqui:
    // res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next(); // Continua para a próxima middleware ou rota
});

// ----- NOSSO PRIMEIRO ENDPOINT: Previsão do Tempo -----
// Rota GET para /api/previsao/ seguido pelo nome da cidade como parâmetro na URL
app.get('/api/previsao/:cidade', async (req, res) => {
    // Pega o parâmetro 'cidade' da URL (ex: /api/previsao/curitiba -> cidade = 'curitiba')
    const { cidade } = req.params;

    // --- Validações no Servidor ---
    if (!apiKey) {
        console.error("[Servidor] ERRO: Chave da API OpenWeatherMap não configurada.");
        return res.status(500).json({ error: 'Chave da API OpenWeatherMap não configurada no servidor.' });
    }
    if (!cidade) {
        console.warn("[Servidor] Requisição sem cidade especificada.");
        return res.status(400).json({ error: 'Nome da cidade é obrigatório.' });
    }

    // --- Construir URL para a API Externa (OpenWeatherMap) ---
    // A chave da API é usada AQUI NO BACKEND, não no frontend.
    // units=metric garante Celsius
    // lang=pt_br para descrições em português
    const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    console.log(`[Servidor] Recebida requisição para /api/previsao/${cidade}. Buscando previsão na OpenWeatherMap...`);

    try {
        // --- Fazer a requisição para a API Externa usando Axios ---
        const apiResponse = await axios.get(weatherAPIUrl);

        console.log('[Servidor] Dados recebidos da OpenWeatherMap com sucesso.');

        // --- Enviar a resposta da API Externa de volta para o Frontend ---
        // Enviamos os dados brutos (ou processados, se quiséssemos) diretamente
        // para o cliente que fez a requisição para o nosso backend.
        res.json(apiResponse.data);

    } catch (error) {
        // --- Tratamento de Erros ---
        // Se a requisição para a OpenWeatherMap falhar
        console.error("[Servidor] Erro ao buscar previsão na OpenWeatherMap:", error.response?.data || error.message);

        // Determina o status do erro para enviar de volta ao frontend
        const status = error.response?.status || 500; // Usa o status da API externa se disponível, senão 500
        // Tenta extrair uma mensagem de erro útil da API externa ou usa uma genérica
        const message = error.response?.data?.message || 'Erro interno ao buscar previsão do tempo.';

        // Envia a resposta de erro para o frontend
        res.status(status).json({ error: message });
    }
});

// ----- Opcional: Rota Raiz Simples -----
// Adicionar uma rota na raiz '/' é útil para verificar se o servidor está rodando.
app.get('/', (req, res) => {
    res.send('Servidor backend da Garagem Inteligente está rodando!');
});


// --- Inicia o servidor ---
app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
    // Verifica se a chave da API está carregada na inicialização (útil para debug)
    if (!apiKey) {
        console.warn(`!!! ATENÇÃO: Variável de ambiente OPENWEATHER_API_KEY NÃO encontrada. Configure seu arquivo .env !!!`);
    }
});