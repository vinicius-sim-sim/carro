// esportivo.js

class CarroEsportivo extends Carro {
  /**
   * @constructor
   * Herda todas as propriedades de Carro e adiciona as específicas do esportivo.
   */
  constructor(marca, modelo, cor, placa, ano, apiId) {
    // Chama o construtor da classe pai (Carro) com todos os parâmetros necessários
    super(marca, modelo, cor, placa, ano, apiId);
    
    // Propriedades específicas do CarroEsportivo
    this.tipoVeiculo = 'CarroEsportivo'; // Sobrescreve o tipo
    this.turboAtivado = false;
  }

  ativarTurbo() {
    if (this.ligado) {
      if (!this.turboAtivado) {
        this.turboAtivado = true;
        // Simula um ganho de performance
        super.acelerar(); 
        super.acelerar();
        console.log(`Turbo ativado no ${this.modelo}! Sinta a potência!`);
      } else {
        console.log("O turbo já está ativado.");
      }
    } else {
      console.log("O carro precisa estar ligado para ativar o turbo.");
    }
  }

  desativarTurbo() {
    if (this.turboAtivado) {
        this.turboAtivado = false;
        console.log("Turbo desativado.");
    } else {
        console.log("O turbo já estava desativado.");
    }
  }

  /**
   * Sobrescreve o método da classe pai para adicionar a informação do turbo.
   */
  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    return `${infoBase} | Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
  }

  /**
   * [CORRIGIDO E ESSENCIAL]
   * Método estático para recriar uma instância da classe a partir de um objeto JSON do DB.
   * @param {object} json - O objeto com os dados do veículo vindo do backend.
   * @returns {CarroEsportivo} Uma nova instância da classe CarroEsportivo.
   */
  static fromJSON(json) {
    if (!json) return null;

    const esportivo = new CarroEsportivo(
        json.marca, 
        json.modelo, 
        json.cor, 
        json.placa, 
        json.ano, 
        json.apiId
    );
    
    // Atribui propriedades de estado
    esportivo.velocidade = json.velocidade || 0;
    esportivo.ligado = json.ligado || false;
    esportivo.turboAtivado = json.turboAtivado || false;
    
    // Recria as instâncias de Manutencao (herdado)
    if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
        esportivo.historicoManutencao = json.historicoManutencao
            .map(mJson => Manutencao.fromJSON(mJson))
            .filter(m => m !== null);
    }
    
    return esportivo;
  }
}