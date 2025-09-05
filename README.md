# carro

Garagem Inteligente - Projeto para gerenciar diferentes tipos de veículos, suas interações, manutenções e consultar informações externas como previsão do tempo para viagens.

---

## API Endpoints

### Veículos

*   `GET /api/veiculos`: Lista todos os veículos cadastrados na garagem.
*   `POST /api/veiculos`: Cria um novo veículo. O corpo da requisição deve ser um JSON com os dados do veículo.

### Previsão do Tempo

*   `GET /api/previsao/:cidade`: Retorna a previsão do tempo para os próximos 5 dias para a cidade especificada.

### Manutenções (Sub-recurso de Veículos)

As manutenções são gerenciadas como um sub-recurso de um veículo específico.

*   **`GET /api/veiculos/:veiculoId/manutencoes`**
    *   **Descrição:** Retorna uma lista de todas as manutenções associadas a um veículo específico, ordenadas pela data mais recente.
    *   **Parâmetros da URL:** `veiculoId` (Obrigatório) - O ID do veículo.
    *   **Resposta de Sucesso (200 OK):** Um array de objetos de manutenção.

*   **`POST /api/veiculos/:veiculoId/manutencoes`**
    *   **Descrição:** Cria um novo registro de manutenção para um veículo específico.
    *   **Parâmetros da URL:** `veiculoId` (Obrigatório) - O ID do veículo.
    *   **Corpo da Requisição (JSON):**
        ```json
        {
          "descricaoServico": "Troca de pastilhas de freio",
          "data": "2025-09-10",
          "custo": 450.50,
          "quilometragem": 85000
        }
        ```
    *   **Resposta de Sucesso (201 Created):** O objeto da manutenção recém-criada.

## Relacionamento de Dados

Este projeto utiliza um relacionamento **um-para-muitos** entre as coleções `veiculos` e `manutencoes` no MongoDB.

-   A coleção `manutencoes` possui um campo `veiculo`.
-   Este campo armazena o `ObjectId` de um documento da coleção `veiculos`.
-   Isso garante que cada manutenção esteja diretamente associada a um, e apenas um, veículo, mantendo a integridade dos dados.