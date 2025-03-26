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

    frear(decremento) {
        this.velocidade -= decremento;
        if (this.velocidade < 0) {
          this.velocidade = 0; // Impede velocidade negativa
        }
        console.log(`Freando. Velocidade atual: ${this.velocidade}`);
      }

      exibirInformacoes() {
        return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
    }
}

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
const meuCarro = new Veiculo("Sedan", "Vermelho");
let carroEsportivo;
let caminhao;

function exibirInformacoes(tipoVeiculo) {
    let veiculo;

    if (tipoVeiculo === 'meuCarro') {
        veiculo = meuCarro;
    } else if (tipoVeiculo === 'carroEsportivo' && carroEsportivo) {
        veiculo = carroEsportivo;
    } else if (tipoVeiculo === 'caminhao' && caminhao) {
        veiculo = caminhao;
    } else {
        document.getElementById("informacoesVeiculo").textContent = "Veículo não criado ou não selecionado.";
        return;
    }

    document.getElementById("informacoesVeiculo").textContent = veiculo.exibirInformacoes();
}