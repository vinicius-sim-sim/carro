class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
      super(modelo, cor);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
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
      const infoBase = super.exibirInformacoes(); // Obtém informações da classe pai
      return `${infoBase}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
  }
  }