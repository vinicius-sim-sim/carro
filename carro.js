/**
 * @class Carro
 * @classdesc Representa um carro com propriedades como modelo, cor, velocidade e estado (ligado ou desligado).
 */
class Carro {
  /**
   * @constructor
   * @param {string} modelo - O modelo do carro.
   * @param {string} cor - A cor do carro.
   * @param {string} apiId - O identificador único para a API.
   */
  constructor(modelo, cor, apiId) {
    this.modelo = modelo;
    this.cor = cor;
    this.velocidade = 0;
    this.ligado = false;
    this.apiId = apiId; // Armazena o apiId
    this.historicoManutencao = []; // NOVO: Histórico de Manutenção
  }

  ligar() {
    if (!this.ligado) {
      this.ligado = true;
      console.log("Carro ligado!");
    } else {
      console.log("O carro já está ligado.");
    }
  }

  desligar() {
    if (this.ligado) {
      this.ligado = false;
      this.velocidade = 0;
      console.log("Carro desligado!");
    } else {
      console.log("O carro já está desligado.");
    }
  }

  acelerar() {
    if (this.ligado) {
      this.velocidade += 10;
      console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
    } else {
      console.log("O carro precisa estar ligado para acelerar.");
    }
  }

  frear(decremento = 5) {
    if (this.ligado) {
      this.velocidade -= decremento;
      if (this.velocidade < 0) {
        this.velocidade = 0;
      }
      console.log(`Freando. Velocidade atual: ${this.velocidade} km/h`);
    } else {
      console.log("O carro está desligado.");
    }
  }

  exibirInformacoes() {
    return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
  }

  /**
   * Adiciona um novo objeto Manutencao ao historicoManutencao.
   * @param {Manutencao} manutencaoObj - O objeto Manutencao a ser adicionado.
   */
  adicionarManutencao(manutencaoObj) {
      if (manutencaoObj instanceof Manutencao) {
          const validacao = manutencaoObj.validarDados();
          if (validacao.valido) {
              this.historicoManutencao.push(manutencaoObj);
              console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencaoObj.tipo}`);
          } else {
              alert(`Erro ao adicionar manutenção: ${validacao.mensagem}`);
              console.error(`Erro ao adicionar manutenção: ${validacao.mensagem}`, manutencaoObj);
          }
      } else {
          alert("Tentativa de adicionar um objeto de manutenção inválido.");
          console.error("Tentativa de adicionar um objeto de manutenção inválido.", manutencaoObj);
      }
  }

  /**
   * Retorna o historicoManutencao formatado para exibição.
   * @returns {string} String HTML com o histórico formatado, ou mensagem se vazio.
   */
  getHistoricoManutencaoFormatado() {
      if (this.historicoManutencao.length === 0) {
          return "Nenhuma manutenção registrada.";
      }
      // Ordena por data (mais recente primeiro, se as datas forem comparáveis como strings YYYY-MM-DD)
      // Para datas DD/MM/YYYY, a ordenação pode precisar de conversão para objeto Date.
      const historicoOrdenado = [...this.historicoManutencao].sort((a, b) => {
          // Converte para Date para comparação correta
          const dataA = a.data.includes('-') ? new Date(a.data) : new Date(a.data.split('/').reverse().join('-'));
          const dataB = b.data.includes('-') ? new Date(b.data) : new Date(b.data.split('/').reverse().join('-'));
          return dataB - dataA; // Mais recente primeiro
      });

      let html = "<ul>";
      historicoOrdenado.forEach(manutencao => {
          html += `<li>${manutencao.formatarManutencao()}</li>`;
      });
      html += "</ul>";
      return html;
  }

  // Método auxiliar para facilitar a serialização para JSON
  toJSON() {
      return {
          tipoVeiculo: 'Carro', // Importante para recriar a instância correta
          modelo: this.modelo,
          cor: this.cor,
          velocidade: this.velocidade,
          ligado: this.ligado,
          apiId: this.apiId,
          historicoManutencao: this.historicoManutencao.map(m => m.toJSON()) // Serializa cada manutenção
      };
  }

  // Método estático para recriar instância a partir de um objeto JSON
  static fromJSON(json) {
      if (!json) return null;
      const carro = new Carro(json.modelo, json.cor, json.apiId);
      carro.velocidade = json.velocidade;
      carro.ligado = json.ligado;
      if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
          carro.historicoManutencao = json.historicoManutencao.map(mJson => Manutencao.fromJSON(mJson)).filter(m => m !== null);
      }
      return carro;
  }
} 