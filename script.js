class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;
        this.ligado = false;
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            exibirMensagem("Carro ligado!");
        } else {
            exibirMensagem("O carro já está ligado.");
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            atualizarVelocidadeNaTela();
            exibirMensagem("Carro desligado!");
        } else {
            exibirMensagem("O carro já está desligado.");
        }
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            atualizarVelocidadeNaTela();
            exibirMensagem("Acelerando... Velocidade atual: " + this.velocidade + " km/h");
        } else {
            exibirMensagem("O carro precisa estar ligado para acelerar.");
        }
    }
}

const meuCarro = new Carro("Sedan", "Prata");
const modeloCarroElement = document.getElementById("modeloCarro");
const corCarroElement = document.getElementById("corCarro");
const velocidadeCarroElement = document.getElementById("velocidadeCarro");
const ligarBtn = document.getElementById("ligarBtn");
const desligarBtn = document.getElementById("desligarBtn");
const acelerarBtn = document.getElementById("acelerarBtn");
const mensagensElement = document.getElementById("mensagens");

function atualizarInfoNaTela() {
    modeloCarroElement.textContent = meuCarro.modelo;
    corCarroElement.textContent = meuCarro.cor;
    atualizarVelocidadeNaTela();
}

function atualizarVelocidadeNaTela() {
    velocidadeCarroElement.textContent = meuCarro.velocidade;
}

function exibirMensagem(mensagem) {
    const paragrafo = document.createElement("p");
    paragrafo.textContent = mensagem;
    mensagensElement.appendChild(paragrafo);
    mensagensElement.scrollTop = mensagensElement.scrollHeight;
}

ligarBtn.addEventListener("click", function() {
    meuCarro.ligar();
});

desligarBtn.addEventListener("click", function() {
    meuCarro.desligar();
});

acelerarBtn.addEventListener("click", function() {
    meuCarro.acelerar(10);
});

atualizarInfoNaTela();