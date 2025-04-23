/**
 * @class Caminhao
 * @classdesc Representa um caminhão, que herda características da classe Carro e adiciona funcionalidades de carga.
 * @extends Carro
 */
class Caminhao extends Carro {
  /**
   * @constructor
   * @param {string} modelo - O modelo do caminhão.
   * @param {string} cor - A cor do caminhão.
   * @param {number} capacidadeCarga - A capacidade máxima de carga do caminhão em kg.
   */
  constructor(modelo, cor, capacidadeCarga) {
    super(modelo, cor);

    /**
     * @type {number}
     * @description A capacidade máxima de carga do caminhão em kg.
     */
    this.capacidadeCarga = capacidadeCarga;

    /**
     * @type {number}
     * @default 0
     * @description A carga atual do caminhão em kg.
     */
    this.cargaAtual = 0;
  }

  /**
   * @function carregar
   * @description Carrega o caminhão com um determinado peso, desde que não exceda a capacidade máxima.
   * @param {number} peso - O peso a ser carregado no caminhão em kg.
   * @returns {void}
   */
  carregar(peso) {
    if (this.cargaAtual + peso <= this.capacidadeCarga) {
      this.cargaAtual += peso;
      console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log("Carga excede a capacidade do caminhão.");
    }
  }

  /**
   * @function descarregar
   * @description Descarrega o caminhão com um determinado peso, desde que não seja maior que a carga atual.
   * @param {number} peso - O peso a ser descarregado do caminhão em kg.
   * @returns {void}
   */
  descarregar(peso) {
    if (this.cargaAtual - peso >= 0) {
      this.cargaAtual -= peso;
      console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log("Não é possível descarregar mais do que a carga atual.");
    }
  }

  /**
   * @function exibirInformacoes
   * @description Retorna uma string formatada com as informações do caminhão, incluindo as informações da classe pai (Carro) e a capacidade de carga e carga atual.
   * @returns {string} - Uma string com as informações do caminhão.
   * @override
   */
  exibirInformacoes() {
    const infoBase = super.exibirInformacoes(); // Obtém informações da classe pai
    return `${infoBase}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
  }
}