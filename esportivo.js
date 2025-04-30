/**
 * @class CarroEsportivo
 * @classdesc Representa um carro esportivo, que herda características da classe Carro e adiciona funcionalidades de turbo.
 * @extends Carro
 */
class CarroEsportivo extends Carro {
  /**
   * @constructor
   * @param {string} modelo - O modelo do carro esportivo.
   * @param {string} cor - A cor do carro esportivo.
   */
  constructor(modelo, cor, apiId) { // Adiciona apiId
    super(modelo, cor, apiId); // Passa apiId para o construtor pai
    this.turboAtivado = false;
  }

  /**
   * @function ativarTurbo
   * @description Ativa o turbo do carro esportivo, acelerando-o mais rapidamente.
   * @returns {void}
   */
  ativarTurbo() {
    if (this.ligado) {
      this.turboAtivado = true;
      this.acelerar(50); // Acelera mais rápido com o turbo
      console.log("Turbo ativado!");
    } else {
      console.log("O carro precisa estar ligado para ativar o turbo.");
    }
  }

  /**
   * @function desativarTurbo
   * @description Desativa o turbo do carro esportivo.
   * @returns {void}
   */
  desativarTurbo() {
    this.turboAtivado = false;
    console.log("Turbo desativado!");
  }

  /**
   * @function exibirInformacoes
   * @description Retorna uma string formatada com as informações do carro esportivo, incluindo as informações da classe pai (Carro) e o estado do turbo.
   * @returns {string} - Uma string com as informações do carro esportivo.
   * @override
   */
  exibirInformacoes() {
    const infoBase = super.exibirInformacoes(); // Obtém informações da classe pai
    return `${infoBase}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
  }
}