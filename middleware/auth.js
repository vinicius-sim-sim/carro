// middleware/auth.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    // Pega o token do cabeçalho Authorization: "Bearer TOKEN"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Nenhum token fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Adiciona o ID do usuário ao objeto da requisição
        req.userId = decoded.userId;
        
        next(); // Continua para a rota
    } catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
};

export default authMiddleware;