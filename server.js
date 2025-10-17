// ------------------- IMPORTAÇÕES -------------------
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ----- IMPORTAR OS MODELOS -----
import Veiculo from './models/Veiculo.js';
import Manutencao from './models/Manutencao.js';
import User from './models/User.js';

// ----- IMPORTAR O MIDDLEWARE -----
import authMiddleware from './middleware/auth.js';


// ------------------- CONFIGURAÇÃO INICIAL -------------------
dotenv.config();

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
  } catch (error) {
    console.error("❌ ERRO FATAL ao tentar conectar ao MongoDB:", error.message);
    process.exit(1);
  }
}

// ------------------- ROTAS (ENDPOINTS) DA API -------------------

app.get('/', (req, res) => {
  res.send('API da Garagem Inteligente está no ar!');
});

// =================== [NOVAS] ROTAS DE AUTENTICAÇÃO ===================

// ROTA DE REGISTRO
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error("[ERROR] Erro no registro:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});


// ROTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciais inválidas.' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.status(200).json({ token, user: { email: user.email } }); // Retorna o token e o e-mail

    } catch (error) {
        console.error("[ERROR] Erro no login:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});


// =================== ROTAS DE VEÍCULOS (AGORA PROTEGIDAS) ===================

app.post('/api/veiculos', authMiddleware, async (req, res) => {
    try {
        const novoVeiculoData = { ...req.body, owner: req.userId };
        const veiculoCriado = await Veiculo.create(novoVeiculoData);
        res.status(201).json(veiculoCriado);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: `Veículo com a placa '${error.keyValue.placa}' já existe.` });
        }
        res.status(500).json({ error: 'Erro interno ao criar veículo.' });
    }
});

app.get('/api/veiculos', authMiddleware, async (req, res) => {
    try {
          const veiculosDoUsuario = await Veiculo.find({
            $or: [
                { owner: req.userId },       // Veículos que eu possuo
                { sharedWith: req.userId }   // Veículos compartilhados comigo
            ]
        }).populate('owner', 'email'); // Adiciona os dados do dono (apenas o email) ao resultado

        res.json(veiculosDoUsuario);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno ao buscar veículos.' });
    }
});

// =================== ROTAS DE MANUTENÇÃO (AGORA PROTEGIDAS) ===================

app.post('/api/veiculos/:veiculoId/share', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const { email: emailToShare } = req.body;

        if (!emailToShare) {
            return res.status(400).json({ error: 'O e-mail para compartilhamento é obrigatório.' });
        }

        // 1. Encontrar o veículo e verificar se o usuário logado é o dono
        const veiculo = await Veiculo.findById(veiculoId);
        if (!veiculo || veiculo.owner.toString() !== req.userId) {
            return res.status(403).json({ error: 'Acesso negado. Você não é o proprietário deste veículo.' });
        }

        // 2. Encontrar o usuário com quem compartilhar
        const userToShareWith = await User.findOne({ email: emailToShare });
        if (!userToShareWith) {
            return res.status(404).json({ error: `Usuário com o e-mail '${emailToShare}' não encontrado.` });
        }
        
        // 3. Validações adicionais
        if (userToShareWith._id.equals(veiculo.owner)) {
            return res.status(400).json({ error: 'Você não pode compartilhar um veículo consigo mesmo.' });
        }
        if (veiculo.sharedWith.includes(userToShareWith._id)) {
            return res.status(409).json({ error: 'Este veículo já foi compartilhado com este usuário.' });
        }

        // 4. Adicionar o ID ao array e salvar
        veiculo.sharedWith.push(userToShareWith._id);
        await veiculo.save();

        res.status(200).json({ message: `Veículo ${veiculo.modelo} compartilhado com sucesso com ${emailToShare}.` });

    } catch (error) {
        console.error("Erro ao compartilhar veículo:", error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
});


app.get('/api/veiculos/:veiculoId/manutencoes', authMiddleware, async (req, res) => {
    try {
        const { veiculoId } = req.params;
        const veiculo = await Veiculo.findOne({ _id: veiculoId, owner: req.userId });

        if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado ou não pertence a você.' });
        }

        const manutencoes = await Manutencao.find({ veiculo: veiculoId }).sort({ data: -1 });
        res.status(200).json(manutencoes);
    } catch (error)
    {
        res.status(500).json({ error: 'Erro interno ao buscar manutenções.' });
    }
});


// ------------------- Rota para previsão do tempo (PÚBLICA) -------------------
app.get('/api/previsao/:cidade', async (req, res) => {
  const { cidade } = req.params;
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API de clima não configurada.' });
  }
  const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&units=metric&lang=pt_br`;
  try {
    const response = await axios.get(weatherAPIUrl);
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Erro ao buscar previsão.';
    res.status(status).json({ error: message });
  }
});

// ------------------- INICIALIZAÇÃO DO SERVIDOR -------------------
async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`✅ Servidor rodando na porta: ${port}`);
    if (!process.env.JWT_SECRET) {
      console.warn("-> ATENÇÃO: JWT_SECRET não foi encontrada no .env. A autenticação NÃO funcionará.");
    }
  });
}

startServer();