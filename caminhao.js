class Caminhao extends Carro {
  constructor(modelo, cor, capacidadeCarga, apiId) {
    super(modelo, cor, apiId);
    this.capacidadeCarga = capacidadeCarga;
    this.cargaAtual = 0;
    // this.historicoManutencao já é inicializado pelo construtor de Carro
  }

  carregar(peso) {
    if (this.cargaAtual + peso <= this.capacidadeCarga) {
      this.cargaAtual += peso;
      console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log("Carga excede a capacidade do caminhão.");
    }
  }

  descarregar(peso) {
    if (this.cargaAtual - peso >= 0) {
      this.cargaAtual -= peso;
      console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
    } else {
      console.log("Não é possível descarregar mais do que a carga atual.");
    }
  }

  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    return `${infoBase}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
  }

  // Os métodos adicionarManutencao e getHistoricoManutencaoFormatado são herdados de Carro.

  toJSON() {
    const jsonPai = super.toJSON();
    return {
        ...jsonPai,
        tipoVeiculo: 'Caminhao',
        capacidadeCarga: this.capacidadeCarga,
        cargaAtual: this.cargaAtual
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    const caminhao = new Caminhao(json.modelo, json.cor, json.capacidadeCarga, json.apiId);
    caminhao.velocidade = json.velocidade;
    caminhao.ligado = json.ligado;
    caminhao.cargaAtual = json.cargaAtual;
    // historicoManutencao
    if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
        caminhao.historicoManutencao = json.historicoManutencao.map(mJson => Manutencao.fromJSON(mJson)).filter(m => m !== null);
    }
    return caminhao;
  }
}