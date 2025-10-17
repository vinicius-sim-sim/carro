# carro

Garagem Inteligente - Projeto para gerenciar diferentes tipos de veículos, suas interações, manutenções e consultar informações externas como previsão do tempo para viagens.

---

## API Endpoints

### Autenticação

*   `POST /api/auth/register`: Registra um novo usuário.
*   `POST /api/auth/login`: Autentica um usuário e retorna um token JWT.

### Veículos

*   `GET /api/veiculos`: Lista todos os veículos que o usuário possui E os que foram compartilhados com ele. (Requer autenticação)
*   `POST /api/veiculos`: Cria um novo veículo para o usuário logado. (Requer autenticação)
*   **`POST /api/veiculos/:veiculoId/share`** (NOVO)
    *   **Descrição:** Compartilha um veículo que pertence ao usuário logado com outro usuário.
    *   **Parâmetros da URL:** `veiculoId` (Obrigatório) - O ID do veículo a ser compartilhado.
    *   **Corpo da Requisição (JSON):**
        ```json
        {
          "email": "email.do.amigo@exemplo.com"
        }
        ```
    *   **Autorização:** Requer token de autenticação. O usuário deve ser o proprietário (`owner`) do veículo.
    *   **Resposta de Sucesso (200 OK):** Um objeto com uma mensagem de confirmação.
    *   **Respostas de Erro:**
        *   `403 Forbidden`: Se o usuário tentando compartilhar não for o proprietário.
        *   `404 Not Found`: Se o usuário com o e-mail fornecido não for encontrado.
        *   `409 Conflict`: Se o veículo já estiver compartilhado com o usuário alvo.

### Previsão do Tempo

*   `GET /api/previsao/:cidade`: Retorna a previsão do tempo para os próximos 5 dias para a cidade especificada.

### Manutenções (Sub-recurso de Veículos)

*   `GET /api/veiculos/:veiculoId/manutencoes`: Retorna as manutenções de um veículo específico. (Requer autenticação e propriedade do veículo)
*   `POST /api/veiculos/:veiculoId/manutencoes`: Cria um novo registro de manutenção. (Requer autenticação e propriedade do veículo)