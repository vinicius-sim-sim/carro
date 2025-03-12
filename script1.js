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
}

// Criação de um objeto Carro
const meuCarro = new Carro("Sedan", "Vermelho");

// Exibição das informações do carro na página
document.getElementById("modeloCarro").textContent = meuCarro.modelo;
document.getElementById("corCarro").textContent = meuCarro.cor;

// Funções para atualizar a velocidade na tela
function atualizarVelocidadeNaTela() {
    document.getElementById("velocidadeCarro").textContent = meuCarro.velocidade;
}

// Adicionando eventos aos botões
document.getElementById("ligarBotao").addEventListener("click", function() {
    meuCarro.ligar();
});

document.getElementById("desligarBotao").addEventListener("click", function() {
    meuCarro.desligar();
});

document.getElementById("acelerarBotao").addEventListener("click", function() {
    meuCarro.acelerar();
});