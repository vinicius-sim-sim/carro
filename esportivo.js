class CarroEsportivo extends Carro {
  constructor(modelo, cor, apiId) {
    super(modelo, cor, apiId);
    this.turboAtivado = false;
    // this.historicoManutencao já é inicializado pelo construtor de Carro
  }

  ativarTurbo() {
    if (this.ligado) {
      this.turboAtivado = true;
      // No seu código original, `acelerar` não aceitava parâmetro.
      // Vou assumir que você quer chamar o acelerar padrão da classe Carro algumas vezes,
      // ou que você modificaria o `acelerar` da classe base ou desta para aceitar um valor.
      // Para manter simples, vamos simular uma aceleração mais forte:
      super.acelerar(); // Acelera uma vez
      super.acelerar(); // Acelera mais uma vez (exemplo)
      console.log("Turbo ativado! Aceleração aumentada.");
    } else {
      console.log("O carro precisa estar ligado para ativar o turbo.");
    }
  }

  desativarTurbo() {
    this.turboAtivado = false;
    console.log("Turbo desativado!");
  }

  exibirInformacoes() {
    const infoBase = super.exibirInformacoes();
    return `${infoBase}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
  }

  // Os métodos adicionarManutencao e getHistoricoManutencaoFormatado são herdados de Carro.
  // Se precisar de comportamento específico para CarroEsportivo, pode sobrescrevê-los.

  toJSON() {
    // Pega o JSON da classe pai e adiciona/modifica o que for específico
    const jsonPai = super.toJSON();
    return {
        ...jsonPai, // Spread das propriedades do pai
        tipoVeiculo: 'CarroEsportivo', // Sobrescreve o tipoVeiculo
        turboAtivado: this.turboAtivado
    };
  }

  static fromJSON(json) {
    if (!json) return null;
    const esportivo = new CarroEsportivo(json.modelo, json.cor, json.apiId);
    esportivo.velocidade = json.velocidade;
    esportivo.ligado = json.ligado;
    esportivo.turboAtivado = json.turboAtivado;
    if (json.historicoManutencao && Array.isArray(json.historicoManutencao)) {
        esportivo.historicoManutencao = json.historicoManutencao.map(mJson => Manutencao.fromJSON(mJson)).filter(m => m !== null);
    }
    return esportivo;
  }
}