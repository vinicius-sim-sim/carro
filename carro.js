/**
 * @class Carro
 * @classdesc Representa um carro com propriedades como modelo, cor, velocidade e estado (ligado ou desligado).
 */
class Carro {
    /**
     * @constructor
     * @param {string} modelo - O modelo do carro.
     * @param {string} cor - A cor do carro.
     */
    constructor(modelo, cor, apiId) { // Adiciona apiId
      this.modelo = modelo;
      this.cor = cor;
      this.velocidade = 0;
      this.ligado = false;
      /**
       * @type {string}
       * @description O identificador único deste veículo para consulta na API simulada.
       */
      this.apiId = apiId; // Armazena o apiId

    }
  
    /**
     * @function ligar
     * @description Liga o carro se ele estiver desligado.
     * @returns {void}
     */
    ligar() {
      if (!this.ligado) {
        this.ligado = true;
        console.log("Carro ligado!");
      } else {
        console.log("O carro já está ligado.");
      }
      // Opcional: Atualizar a exibição do status 'ligado' se houver um elemento para isso
    }
  
    /**
     * @function desligar
     * @description Desliga o carro se ele estiver ligado e reseta a velocidade para 0.
     * @returns {void}
     */
    desligar() {
      if (this.ligado) {
        this.ligado = false;
        this.velocidade = 0; // Reseta a velocidade ao desligar
        //atualizarVelocidadeNaTela(); // Garante que a tela seja atualizada
        console.log("Carro desligado!");
      } else {
        console.log("O carro já está desligado.");
      }
      // Opcional: Atualizar a exibição do status 'ligado' se houver um elemento para isso
    }
  
    /**
     * @function acelerar
     * @description Aumenta a velocidade do carro em 10 km/h se ele estiver ligado.
     * @returns {void}
     */
    acelerar() {
      if (this.ligado) {
        this.velocidade += 10; // Aumenta a velocidade em 10 km/h
        //atualizarVelocidadeNaTela(); // Atualiza a velocidade na tela
        console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
      } else {
        console.log("O carro precisa estar ligado para acelerar.");
      }
    }
  
    /**
     * @function frear
     * @description Diminui a velocidade do carro pelo valor especificado, com um valor padrão de 5 km/h.  Impede que a velocidade seja negativa.
     * @param {number} [decremento=5] - O valor a ser subtraído da velocidade.
     * @returns {void}
     */
    frear(decremento = 5) {
      if (this.ligado) { // Só pode frear se estiver ligado (faz sentido?)
        this.velocidade -= decremento;
        if (this.velocidade < 0) {
          this.velocidade = 0; // Impede velocidade negativa
        }
        //atualizarVelocidadeNaTela(); // Atualiza a velocidade na tela
        console.log(`Freando. Velocidade atual: ${this.velocidade} km/h`);
      } else {
        console.log("O carro está desligado.");
      }
    }
  
    /**
     * @function exibirInformacoes
     * @description Retorna uma string formatada com as informações do carro (modelo, cor, se está ligado e a velocidade).
     * @returns {string} - Uma string com as informações do carro.
     */
    exibirInformacoes() {
      return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
      
    }
  }   