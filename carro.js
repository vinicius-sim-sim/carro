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
    this._id = null; // Propriedade para armazenar o ID do MongoDB

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

  exibirInformacoes() {
    return `Veículo: ${this.marca} ${this.modelo} | Placa: ${this.placa} | Ano: ${this.ano} | Cor: ${this.cor} | Ligado: ${this.ligado ? 'Sim' : 'Não'} | Velocidade: ${this.velocidade} km/h`;
  }

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
      
      carro._id = json._id;
      
      // Atribui propriedades de estado que podem ou não vir do DB
      carro.velocidade = json.velocidade || 0;
      carro.ligado = json.ligado || false;
      
      // ===== LINHA ADICIONADA AQUI =====
      carro.owner = json.owner; 
      // ===================================
      
      return carro;
  }
}