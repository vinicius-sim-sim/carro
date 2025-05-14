// manutencao.js

class Manutencao {
    /**
     * @param {string} data - Data da manutenção (formato YYYY-MM-DD ou DD/MM/YYYY).
     * @param {string} tipo - Tipo de serviço realizado.
     * @param {number} custo - Custo da manutenção.
     * @param {string} [descricao=""] - Descrição detalhada do serviço (opcional).
     */
    constructor(data, tipo, custo, descricao = "") {
        this.data = data;
        this.tipo = tipo;
        this.custo = parseFloat(custo); // Garante que custo seja um número
        this.descricao = descricao;
    }

    /**
     * Retorna uma representação formatada da manutenção.
     * @returns {string} String formatada da manutenção.
     */
    formatarManutencao() {
        // Tenta formatar a data para DD/MM/YYYY se estiver em YYYY-MM-DD
        let dataFormatada = this.data;
        if (this.data.includes('-')) {
            const partes = this.data.split('-');
            if (partes.length === 3) {
                dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
            }
        }
        return `${this.tipo} em ${dataFormatada} - R$${this.custo.toFixed(2)}${this.descricao ? ' (' + this.descricao + ')' : ''}`;
    }

    /**
     * Valida os dados da manutenção.
     * @returns {{valido: boolean, mensagem: string}} Objeto com status da validação e mensagem.
     */
    validarDados() {
        if (!this.data) {
            return { valido: false, mensagem: "A data da manutenção é obrigatória." };
        }
        // Validação simples de data (pode ser melhorada com bibliotecas ou regex mais robustos)
        // Este regex aceita YYYY-MM-DD ou DD/MM/YYYY
        const regexData = /^((\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4}))$/;
        if (!regexData.test(this.data)) {
            return { valido: false, mensagem: "Formato de data inválido. Use YYYY-MM-DD ou DD/MM/YYYY." };
        }

        // Tenta converter para objeto Date para uma validação mais profunda
        let dataObj;
        if (this.data.includes('-')) {
            dataObj = new Date(this.data + "T00:00:00"); // Adiciona T00:00:00 para evitar problemas de fuso horário
        } else {
            const [dia, mes, ano] = this.data.split('/');
            dataObj = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        }

        if (isNaN(dataObj.getTime())) {
             return { valido: false, mensagem: "Data inválida (ex: 31/02/2024 não existe)." };
        }


        if (!this.tipo || this.tipo.trim() === "") {
            return { valido: false, mensagem: "O tipo de serviço é obrigatório." };
        }
        if (isNaN(this.custo) || this.custo < 0) {
            return { valido: false, mensagem: "O custo deve ser um número positivo ou zero." };
        }
        return { valido: true, mensagem: "Dados válidos." };
    }

    // Método auxiliar para facilitar a serialização para JSON
    toJSON() {
        return {
            data: this.data,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
        };
    }

    // Método estático para recriar instância a partir de um objeto JSON
    static fromJSON(json) {
        if (!json) return null;
        return new Manutencao(json.data, json.tipo, json.custo, json.descricao);
    }
}