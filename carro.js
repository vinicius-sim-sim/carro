// carro.js

/**
 * @class Carro
 * @classdesc Representa um carro com propriedades e métodos básicos.
 * Esta é a classe base para outros veículos como CarroEsportivo e Caminhao.
 */
class Carro {
  /**
   * @constructor
   * @param {string} marca - A marca do carro (ex: Volkswagen).
   * @param {string} modelo - O modelo do carro (ex: Gol).
   * @param {string} cor - A cor do carro.
   * @param {string} placa - A placa do carro.
   * @param {number} ano - O ano de fabricação do carro.
   * @param {string} apiId - O identificador único para a API de detalhes extras.
   */
  constructor(marca, modelo, cor, placa, ano, apiId) {
    // Propriedades vindas do Banco de Dados
    this.marca = marca;
    this.modelo = modelo;
    this.cor = cor;
    this.placa = placa;
    this.ano = ano;
    this.apiId = apiId;
    this.tipoVeiculo = 'Carro'; // Define o tipo para lógica interna no frontend

    // Propriedades de estado (controladas no frontend)
    this.velocidade = 0;
    this.ligado = false;
    this.historicoManutencao = []; 
  }

  ligar() {
    if (!this.ligado) {
      this.ligado = true;
      console.log(`${this.marca} ${this.modelo} ligado!`);
    } else {
      console.log("O carro já está ligado.");
    }
  }

  desligar() {
    if (this.ligado) {
      this.ligado = false;
      this.velocidade = 0;
      console.log(`${this.marca} ${this.modelo} desligado!`);
    } else {
      console.log("O carro já está desligado.");
    }
  }

  acelerar() {
    if (this.ligado) {
      this.velocidade += 10;
      console.log(`Acelerando! Velocidade: ${this.velocidade} km/h`);
    } else {
      console.log("O carro precisa estar ligado para acelerar.");
    }
  }

  frear(decremento = 5) {
    if (this.ligado) {
      this.velocidade -= decremento;
      if (this.velocidade < 0) this.velocidade = 0;
      console.log(`Freando. Velocidade atual: ${this.velocidade} km/h`);
    } else {
      console.log("O carro está desligado.");
    }
  }

  /**
   * [MODIFICADO] Exibe informações mais completas do veículo.
   */
  exibirInformacoes() {
    return `Veículo: ${this.marca} ${this.modelo} | Placa: ${this.placa} | Ano: ${this.ano} | Cor: ${this.cor} | Ligado: ${this.ligado ? 'Sim' : 'Não'} | Velocidade: ${this.velocidade} km/h`;
  }

  /**
   * Adiciona um novo objeto Manutencao ao histórico.
   * @param {Manutencao} manutencaoObj - O objeto Manutencao a ser adicionado.
   */
  adicionarManutencao(manutencaoObj) {
      if (!(manutencaoObj instanceof Manutencao)) {
          console.error("Tentativa de adicionar um objeto de manutenção inválido.", manutencaoObj);
          alert("Tentativa de adicionar um objeto de manutenção inválido.");
          return;
      }
      
      const validacao = manutencaoObj.validarDados();
      if (validacao.valido) {
          this.historicoManutencao.push(manutencaoObj);
          console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencaoObj.tipo}`);
      } else {
          console.error(`Erro ao adicionar manutenção: ${validacao.mensagem}`, manutencaoObj);
          alert(`Erro ao adicionar manutenção: ${validacao.mensagem}`);
      }
  }
  
  /**
   * Retorna o histórico de manutenção formatado para exibição.
   */
  getHistoricoManutencaoFormatado() {
      if (this.historicoManutencao.length === 0) {
          return "Nenhuma manutenção registrada.";
      }
      
      const historicoOrdenado = [...this.historicoManutencao].sort((a, b) => {
          const dataA = a.data.includes('-') ? new Date(a.data) : new Date(a.data.split('/').reverse().join('-'));
          const dataB = b.data.includes('-') ? new Date(b.data) : new Date(b.data.split('/').reverse().join('-'));
          return dataB - dataA;
      });

      return `<ul>${historicoOrdenado.map(m => `<li>${m.formatarManutencao()}</li>`).join('')}</ul>`;
  }
  
  /**
   * [MANTIDO] Método para serializar o objeto para JSON. Útil para debug ou futuras implementações.
   */
  toJSON() {
      return {
          tipoVeiculo: this.tipoVeiculo,
          marca: this.marca,
          modelo: this.modelo,
          cor: this.cor,
          placa: this.placa,
          ano: this.ano,
          velocidade: this.velocidade,
          ligado: this.ligado,
          apiId: this.apiId,
          historicoManutencao: this.historicoManutencao.map(m => m.toJSON())
      };
  }

  /**
   * [CORRIGIDO E ESSENCIAL]
   * Método estático para recriar uma instância da classe Carro a partir de um objeto JSON
   * vindo do banco de dados.
   * @param {object} json - O objeto com os dados do veículo vindo do backend.
   * @returns {Carro} Uma nova instância da classe Carro.
   */
  static fromJSON(json) {
      if (!json) return null;

      const carro = new Carro(
          json.marca, 
          json.modelo, 
          json.cor, 
          json.placa, 
          json.ano, 
          json.apiId
      );
      
      // Atribui propriedades de estado que podem ou não vir do DB
      carro.velocidade = json.velocidade || 0;
      carro.ligado = json.ligado || false;
      
      // Recria as instâncias de Manutencao
      if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
          carro.historicoManutencao = json.historicoManutencao
              .map(mJson => Manutencao.fromJSON(mJson))
              .filter(m => m !== null);
      }
      
      return carro;
  }
}