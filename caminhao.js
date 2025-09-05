// caminhao.js 

class Caminhao extends Carro {
  /**
   * @constructor
   * Herda de Carro e adiciona capacidade de carga.
   * @param {number} capacidadeCarga - A capacidade máxima de carga em kg.
   */
  constructor(marca, modelo, cor, placa, ano, apiId, capacidadeCarga) {
    // Chama o construtor da classe pai (Carro)
    super(marca, modelo, cor, placa, ano, apiId);
    
    // Propriedades específicas do Caminhao
    this.tipoVeiculo = 'Caminhao'; // Sobrescreve o tipo
    this.capacidadeCarga = capacidadeCarga || 0; // Garante um valor padrão
    this.cargaAtual = 0;
  }

  carregar(peso) {
    if (peso <= 0) {
      console.log("O peso para carregar deve ser positivo.");
      return;
    }
    if (this.cargaAtual + peso <= this.capacidadeCarga) {
      this.cargaAtual += peso;
      console.log(`Carga de ${peso} kg adicionada. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log(`Não foi possível carregar. Carga de ${peso} kg excede a capacidade máxima de ${this.capacidadeCarga} kg.`);
      alert(`Carga excede a capacidade do caminhão!`);
    }
  }

  descarregar(peso) {
    if (peso <= 0) {
      console.log("O peso para descarregar deve ser positivo.");
      return;
    }
    if (this.cargaAtual - peso >= 0) {
      this.cargaAtual -= peso;
      console.log(`Carga de ${peso} kg removida. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log(`Não é possível descarregar ${peso} kg. Carga atual é de apenas ${this.cargaAtual} kg.`);
      alert("Não é possível descarregar mais do que a carga atual.");
    }
  }

  /**
   * Sobrescreve o método da classe pai para adicionar informações de carga.
   */
  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    return `${infoBase} | Carga: ${this.cargaAtual}kg / ${this.capacidadeCarga}kg`;
  }

  /**
   * [CORRIGIDO E ESSENCIAL]
   * Método estático para recriar uma instância da classe a partir de um objeto JSON do DB.
   * @param {object} json - O objeto com os dados do veículo vindo do backend.
   * @returns {Caminhao} Uma nova instância da classe Caminhao.
   */
  static fromJSON(json) {
    if (!json) return null;

    const caminhao = new Caminhao(
        json.marca, 
        json.modelo, 
        json.cor, 
        json.placa, 
        json.ano, 
        json.apiId,
        json.capacidadeCarga // Passa a capacidade de carga
    );
    
    caminhao._id = json._id; // <-- ALTERAÇÃO IMPORTANTE: Armazena o ID do banco
    
    // Atribui propriedades de estado
    caminhao.velocidade = json.velocidade || 0;
    caminhao.ligado = json.ligado || false;
    caminhao.cargaAtual = json.cargaAtual || 0;
    
    return caminhao;
  }
}