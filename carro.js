// Definição da classe Carro
class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0; // Novo atributo: velocidade
        this.ligado = false;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            console.log("Carro ligado!");
        } else {
            console.log("O carro já está ligado.");
        }
        // Opcional: Atualizar a exibição do status 'ligado' se houver um elemento para isso
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0; // Reseta a velocidade ao desligar
            atualizarVelocidadeNaTela(); // Garante que a tela seja atualizada
            console.log("Carro desligado!");
        } else {
            console.log("O carro já está desligado.");
        }
         // Opcional: Atualizar a exibição do status 'ligado' se houver um elemento para isso
    }

    acelerar() {
        if (this.ligado) {
            this.velocidade += 10; // Aumenta a velocidade em 10 km/h
            atualizarVelocidadeNaTela(); // Atualiza a velocidade na tela
            console.log("Acelerando! Velocidade: " + this.velocidade + " km/h");
        } else {
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    frear(decremento = 5) { // Valor padrão para decremento, caso não seja passado
        if (this.ligado) { // Só pode frear se estiver ligado (faz sentido?)
           this.velocidade -= decremento;
           if (this.velocidade < 0) {
             this.velocidade = 0; // Impede velocidade negativa
           }
           atualizarVelocidadeNaTela(); // Atualiza a velocidade na tela
           console.log(`Freando. Velocidade atual: ${this.velocidade} km/h`);
        } else {
            console.log("O carro está desligado.");
        }
      }

      exibirInformacoes() {
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
    }
}

