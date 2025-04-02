// --- INÍCIO DAS CORREÇÕES ---

// 1. Criar a instância do carro PRIMEIRO
const meuCarro = new Carro("Sedan", "Vermelho"); // Corrigido: Usa 'Carro' e vem antes

// 2. Agora podemos usar 'meuCarro' com segurança
// Exibição das informações iniciais do carro na página
document.getElementById("modeloCarro").textContent = meuCarro.modelo;
document.getElementById("corCarro").textContent = meuCarro.cor;
document.getElementById("velocidadeCarro").textContent = meuCarro.velocidade; // Exibe velocidade inicial

// Funções para atualizar a velocidade na tela
function atualizarVelocidadeNaTela() {
    // Verifica se o elemento existe antes de tentar acessá-lo
    const elVelocidade = document.getElementById("velocidadeCarro");
    if (elVelocidade) {
        elVelocidade.textContent = meuCarro.velocidade;
    } else {
        console.error("Elemento com id 'velocidadeCarro' não encontrado!");
    }
}

// Adicionando eventos aos botões
// Verifica se os botões existem antes de adicionar listeners
const ligarBotao = document.getElementById("ligarBotao");
if (ligarBotao) {
    ligarBotao.addEventListener("click", function() {
        meuCarro.ligar();
        // Talvez atualizar informações gerais aqui também
        exibirInformacoes('meuCarro');
    });
}

const desligarBotao = document.getElementById("desligarBotao");
if (desligarBotao) {
    desligarBotao.addEventListener("click", function() {
        meuCarro.desligar();
         // Talvez atualizar informações gerais aqui também
        exibirInformacoes('meuCarro');
    });
}

const acelerarBotao = document.getElementById("acelerarBotao");
if (acelerarBotao) {
    acelerarBotao.addEventListener("click", function() {
        meuCarro.acelerar();
    });
}

// --- FIM DAS CORREÇÕES ---


// Variáveis para outros veículos (ainda não usados diretamente pelos botões)
let carroEsportivo;
let caminhao;

// Função para exibir informações (já estava ok, mas depende da criação correta de meuCarro)
function exibirInformacoes(tipoVeiculo) {
    let veiculo;

    if (tipoVeiculo === 'meuCarro') {
        veiculo = meuCarro;
    } else if (tipoVeiculo === 'carroEsportivo' && carroEsportivo) {
        veiculo = carroEsportivo;
    } else if (tipoVeiculo === 'caminhao' && caminhao) {
        veiculo = caminhao;
    } else {
        // Verifica se o elemento existe
        const elInfo = document.getElementById("informacoesVeiculo");
        if(elInfo) {
             elInfo.textContent = "Veículo não criado ou não selecionado.";
        } else {
            console.error("Elemento com id 'informacoesVeiculo' não encontrado!");
        }
        return;
    }

    
}

// Opcional: Exibir informações iniciais ao carregar a página
// Garante que o DOM esteja carregado antes de tentar exibir
// window.addEventListener('DOMContentLoaded', (event) => {
//     exibirInformacoes('meuCarro');
// });
// Ou chame diretamente se o script estiver no final do <body>
exibirInformacoes('meuCarro');



  // Inclua o código JavaScript (Carro, CarroEsportivo, Caminhao) aqui

  // let carroEsportivo;
  // let caminhao;


  function criarCarroEsportivo() {
    const modelo = document.getElementById("modeloEsportivo").value;
    const cor = document.getElementById("corEsportivo").value;
    carroEsportivo = new CarroEsportivo(modelo, cor);
    atualizarOutputEsportivo();
  }

  function ligarCarroEsportivo() {
    if (carroEsportivo) {
      carroEsportivo.ligar();
      atualizarOutputEsportivo();
    }
  }

  function desligarCarroEsportivo() {
    if (carroEsportivo) {
      carroEsportivo.desligar();
      atualizarOutputEsportivo();
    }
  }

  function acelerarCarroEsportivo() {
    if (carroEsportivo) {
      carroEsportivo.acelerar(10);
      atualizarOutputEsportivo();
    }
  }

  function frearCarroEsportivo() {
    if (carroEsportivo) {
      carroEsportivo.frear(10);
      atualizarOutputEsportivo();
    }
  }

  function ativarTurbo() {
    if (carroEsportivo) {
      carroEsportivo.ativarTurbo();
      atualizarOutputEsportivo();
    }
  }

  function desativarTurbo() {
    if (carroEsportivo) {
      carroEsportivo.desativarTurbo();
      atualizarOutputEsportivo();
    }
  }

  function criarCaminhao() {
    const modelo = document.getElementById("modeloCaminhao").value;
    const cor = document.getElementById("corCaminhao").value;
    const capacidade = parseInt(document.getElementById("capacidadeCaminhao").value);
    caminhao = new Caminhao(modelo, cor, capacidade);
    atualizarOutputCaminhao();
  }

  function ligarCaminhao() {
    if (caminhao) {
      caminhao.ligar();
      atualizarOutputCaminhao();
    }
  }

  function desligarCaminhao() {
    if (caminhao) {
      caminhao.desligar();
      atualizarOutputCaminhao();
    }
  }

  function acelerarCaminhao() {
    if (caminhao) {
      caminhao.acelerar(10);
      atualizarOutputCaminhao();
    }
  }

  function frearCaminhao() {
    if (caminhao) {
      caminhao.frear(10);
      atualizarOutputCaminhao();
    }
  }

  function carregarCaminhao() {
    if (caminhao) {
      const carga = parseInt(document.getElementById("carga").value);
      caminhao.carregar(carga);
      atualizarOutputCaminhao();
    }
  }

  function descarregarCaminhao() {
    if (caminhao) {
      const carga = parseInt(document.getElementById("carga").value);
      caminhao.descarregar(carga);
      atualizarOutputCaminhao();
    }
  }

  function atualizarOutputEsportivo() {
    const output = document.getElementById("outputEsportivo");
    if (carroEsportivo) {
      output.innerHTML = `
          Modelo: ${carroEsportivo.modelo}<br>
          Cor: ${carroEsportivo.cor}<br>
          Ligado: ${carroEsportivo.ligado}<br>
          Velocidade: ${carroEsportivo.velocidade}<br>
          Turbo Ativado: ${carroEsportivo.turboAtivado}
        `;
    } else {
      output.innerHTML = "Crie um carro esportivo primeiro.";
    }
  }

  function atualizarOutputCaminhao() {
    const output = document.getElementById("outputCaminhao");
    if (caminhao) {
      output.innerHTML = `
          Modelo: ${caminhao.modelo}<br>
          Cor: ${caminhao.cor}<br>
          Ligado: ${caminhao.ligado}<br>
          Velocidade: ${caminhao.velocidade}<br>
          Capacidade de Carga: ${caminhao.capacidadeCarga} kg<br>
          Carga Atual: ${caminhao.cargaAtual} kg
        `;
    } else {
      output.innerHTML = "Crie um caminhão primeiro.";
    }
  }
