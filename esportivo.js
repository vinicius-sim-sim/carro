class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
      super(modelo, cor); // Chama o construtor da classe pai (Carro)
      this.turboAtivado = false;
    }
  
    ativarTurbo() {
      if (this.ligado) {
        this.turboAtivado = true;
        this.acelerar(50); // Acelera mais rápido com o turbo
        console.log("Turbo ativado!");
      } else {
        console.log("O carro precisa estar ligado para ativar o turbo.");
      }
    }
  
    desativarTurbo() {
      this.turboAtivado = false;
      console.log("Turbo desativado!");
    }
  }