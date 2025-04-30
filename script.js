// --- Instâncias dos Veículos ---
// Carro padrão criado automaticamente
const meuCarro = new Carro("Sedan", "Vermelho", "carro-padrao-01");

// Variáveis para os outros veículos (serão criados pelos botões)
let meuCarroEsportivo = null; // Inicializa como null
let meuCaminhao = null;       // Inicializa como null


// Variável para guardar a referência do veículo atualmente selecionado
let veiculoSelecionado = meuCarro; // Começa com o carro padrão selecionado

// --- Elementos do DOM ---
const divInformacoesVeiculo = document.getElementById("informacoesVeiculo");
const outputCarro = document.getElementById("outputCarro"); // Para info específica se necessário
const outputEsportivo = document.getElementById("outputEsportivo");
const outputCaminhao = document.getElementById("outputCaminhao");
const inputPesoInteracao = document.getElementById("pesoInteracao");

// --- Funções de Criação ---
function criarCarroEsportivo() {
    const modelo = document.getElementById("modeloEsportivo").value || "Esportivo Padrão";
    const cor = document.getElementById("corEsportivo").value || "Amarelo";
    // Use um ID que corresponda ao seu JSON
    meuCarroEsportivo = new CarroEsportivo(modelo, cor, "esportivo-corolla-01"); // Adiciona o ID da API
    console.log("Carro Esportivo criado:", meuCarroEsportivo);
    outputEsportivo.textContent = `Carro Esportivo ${modelo} ${cor} criado. Selecione-o para interagir.`;
    selecionarVeiculo('esportivo');
}

function criarCaminhao() {
    const modelo = document.getElementById("modeloCaminhao").value || "Caminhão Padrão";
    const cor = document.getElementById("corCaminhao").value || "Branco";
    const capacidade = parseInt(document.getElementById("capacidadeCaminhao").value) || 5000;
     // Use um ID que corresponda ao seu JSON
    meuCaminhao = new Caminhao(modelo, cor, capacidade, "caminhao-volvo-01"); // Adiciona o ID da API
    console.log("Caminhão criado:", meuCaminhao);
    outputCaminhao.textContent = `Caminhão ${modelo} ${cor} (Cap: ${capacidade}kg) criado. Selecione-o para interagir.`;
    selecionarVeiculo('caminhao');
}

// --- Função para Atualizar a Exibição Central ---
function atualizarExibicaoInformacoes() {
    if (veiculoSelecionado) {
        // Chama o método polimórfico exibirInformacoes()
        divInformacoesVeiculo.innerHTML = veiculoSelecionado.exibirInformacoes().replace(/, /g, '<br>'); // Usa <br> para quebrar linha
        // Atualizar também os outputs específicos (opcional, mas útil)
        atualizarOutputsEspecificos();
    } else {
        divInformacoesVeiculo.textContent = "Nenhum veículo selecionado.";
    }
    // Atualiza a exibição da velocidade do carro padrão (se ele estiver selecionado)
    // A velocidade dos outros será mostrada na div central
     if (veiculoSelecionado === meuCarro) {
         // O elemento velocidadeCarro não existe mais no HTML reestruturado
         // A velocidade será mostrada na div central 'informacoesVeiculo'
         // Se precisar de um display específico de velocidade, teria que recriar o elemento
         console.log("Velocidade Carro Padrão:", meuCarro.velocidade);
     }
}

// --- Função para Atualizar Outputs Específicos (se mantidos) ---
function atualizarOutputsEspecificos() {
    if (outputCarro && meuCarro) { // Atualiza o output do carro padrão se ele existe
        // Poderia exibir algo específico aqui se quisesse, ou deixar como está
         outputCarro.textContent = `Carro Padrão (Modelo: ${meuCarro.modelo}, Cor: ${meuCarro.cor}). Estado atual na área de controle.`;
    }
    if (outputEsportivo) {
        outputEsportivo.textContent = meuCarroEsportivo
            ? `Carro Esportivo ${meuCarroEsportivo.modelo} criado. Estado atual na área de controle.`
            : "Carro Esportivo ainda não criado.";
    }
     if (outputCaminhao) {
        outputCaminhao.textContent = meuCaminhao
            ? `Caminhão ${meuCaminhao.modelo} (Cap: ${meuCaminhao.capacidadeCarga}kg) criado. Estado atual na área de controle.`
            : "Caminhão ainda não criado.";
    }
}


// --- Função de Seleção de Veículo ---
function selecionarVeiculo(tipo) {
    console.log("Tentando selecionar:", tipo);
    switch (tipo) {
        case 'carro':
            veiculoSelecionado = meuCarro;
            break;
        case 'esportivo':
            if (meuCarroEsportivo) {
                veiculoSelecionado = meuCarroEsportivo;
            } else {
                alert("Crie o Carro Esportivo primeiro!");
                return; // Não muda a seleção se não existe
            }
            break;
        case 'caminhao':
            if (meuCaminhao) {
                veiculoSelecionado = meuCaminhao;
            } else {
                alert("Crie o Caminhão primeiro!");
                return; // Não muda a seleção se não existe
            }
            break;
        default:
            console.error("Tipo de veículo desconhecido para seleção:", tipo);
            return;
    }
    console.log("Veículo selecionado:", veiculoSelecionado);
    atualizarExibicaoInformacoes(); // Atualiza a div central
}

// --- A GARAGEM INTELIGENTE: Função interagir() ---
function interagir(veiculo, acao) {
    if (!veiculo) {
        alert("Nenhum veículo selecionado para interagir!");
        console.warn("Tentativa de interação sem veículo selecionado.");
        return;
    }

    console.log(`Interagindo com ${veiculo.constructor.name} (${veiculo.modelo}) - Ação: ${acao}`);

    try { // Usar try...catch para lidar com métodos que podem não existir
        switch (acao) {
            case 'ligar':
                veiculo.ligar();
                break;
            case 'desligar':
                veiculo.desligar();
                break;
            case 'acelerar':
                // O método acelerar da classe base não espera argumento no seu código original
                // Se quiser passar um valor, teria que ajustar a classe Carro
                 if (veiculo.ligado) { // Verifica se está ligado antes de acelerar
                     veiculo.acelerar(); // Chama sem argumento como definido em Carro.js
                 } else {
                     console.log("Veículo desligado, não pode acelerar.");
                     alert("Ligue o veículo primeiro!");
                 }
                break;
            case 'frear':
                 // O método frear da classe base pode receber argumento
                 if (veiculo.ligado) {
                    veiculo.frear(5); // Freia com um valor padrão
                 } else {
                     console.log("Veículo desligado.");
                     // Poderia permitir frear mesmo desligado se fizesse sentido (freio de mão?)
                 }
                break;
            case 'ativarTurbo':
                if (typeof veiculo.ativarTurbo === 'function') {
                    veiculo.ativarTurbo();
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculo.constructor.name}.`);
                    console.warn(`Método '${acao}' não encontrado em ${veiculo.constructor.name}`);
                }
                break;
             case 'desativarTurbo':
                 if (typeof veiculo.desativarTurbo === 'function') {
                    veiculo.desativarTurbo();
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculo.constructor.name}.`);
                    console.warn(`Método '${acao}' não encontrado em ${veiculo.constructor.name}`);
                }
                break;
            case 'carregar':
                if (typeof veiculo.carregar === 'function') {
                    const peso = parseInt(inputPesoInteracao.value);
                    if (!isNaN(peso) && peso > 0) {
                        veiculo.carregar(peso);
                    } else {
                        alert("Por favor, insira um peso válido para carregar.");
                    }
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculo.constructor.name}.`);
                    console.warn(`Método '${acao}' não encontrado em ${veiculo.constructor.name}`);
                }
                break;
            case 'descarregar':
                 if (typeof veiculo.descarregar === 'function') {
                    const peso = parseInt(inputPesoInteracao.value);
                     if (!isNaN(peso) && peso > 0) {
                        veiculo.descarregar(peso);
                    } else {
                        alert("Por favor, insira um peso válido para descarregar.");
                    }
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculo.constructor.name}.`);
                    console.warn(`Método '${acao}' não encontrado em ${veiculo.constructor.name}`);
                }
                break;
            // Adicione mais 'case' para outras ações (buzinar, etc.)
            default:
                alert(`Ação desconhecida: ${acao}`);
                console.warn(`Ação desconhecida tentada: ${acao}`);
        }
    } catch (error) {
        console.error(`Erro ao executar a ação '${acao}' em ${veiculo.constructor.name}:`, error);
        alert(`Ocorreu um erro ao tentar '${acao}'. Verifique o console.`);
    }


    // IMPORTANTE: Atualizar a exibição das informações após cada interação
    atualizarExibicaoInformacoes();
}

// --- Função Helper para Chamar Interagir ---
// Usada pelos botões genéricos no HTML
function chamarInteragir(acao) {
    interagir(veiculoSelecionado, acao);
}

// --- Event Listeners para Botões de Seleção ---
document.getElementById("selectCarroBtn").addEventListener("click", () => selecionarVeiculo('carro'));
document.getElementById("selectEsportivoBtn").addEventListener("click", () => selecionarVeiculo('esportivo'));
document.getElementById("selectCaminhaoBtn").addEventListener("click", () => selecionarVeiculo('caminhao'));

// --- Inicialização ---
// Garante que o DOM está carregado (embora o script no fim do body geralmente resolva)
window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM carregado. Inicializando exibição.');
    atualizarExibicaoInformacoes(); // Exibe as informações do veículo selecionado inicialmente
    atualizarOutputsEspecificos(); // Atualiza outputs específicos iniciais
});

// --- REMOVIDO (era do código antigo, não mais necessário com a abordagem interagir) ---
/*
function atualizarVelocidadeNaTela() { ... } // A velocidade agora é parte de exibirInformacoes()
// Funções específicas como ligarCarroEsportivo(), acelerarCaminhao() etc. foram substituídas por chamarInteragir()
// AddEventListeners específicos para botões como ligarBotao, desligarBotao, acelerarBotao do carro padrão foram removidos em favor dos genéricos
*/

// --- Funções da API Simulada ---

/**
 * Busca detalhes adicionais de um veículo na API simulada (arquivo JSON local).
 * @param {string} identificadorVeiculo O ID único do veículo a ser buscado.
 * @returns {Promise<object|null>} Uma Promise que resolve com o objeto do veículo encontrado
 *                                  ou null se não encontrado ou em caso de erro.
 */
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    console.log(`Buscando detalhes para o ID: ${identificadorVeiculo}`);
    try {
      const response = await fetch('./dados_veiculos_api.json'); // Busca o arquivo local
  
      if (!response.ok) {
        // Se o status da resposta não for OK (ex: 404 Not Found)
        console.error(`Erro ao buscar API: ${response.status} ${response.statusText}`);
        // Lança um erro para ser pego pelo catch, ou retorna null diretamente
        // throw new Error(`HTTP error! status: ${response.status}`); // Opção 1: Lançar erro
        return null; // Opção 2: Retornar null em caso de erro de fetch
      }
  
      const todosVeiculosAPI = await response.json(); // Converte a resposta para JSON
  
      // Encontra o veículo pelo ID fornecido
      const veiculoEncontrado = todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo);
  
      if (veiculoEncontrado) {
        console.log("Veículo encontrado na API:", veiculoEncontrado);
        return veiculoEncontrado; // Retorna o objeto do veículo se encontrado
      } else {
        console.log(`Veículo com ID ${identificadorVeiculo} não encontrado na API.`);
        return null; // Retorna null se o veículo não for encontrado no array
      }
  
    } catch (error) {
      // Captura erros de rede, de parse do JSON, ou o erro lançado manualmente
      console.error("Falha ao buscar ou processar dados da API:", error);
      return null; // Retorna null em caso de qualquer erro
    }
  }
  // --- Elementos do DOM (adicione os novos) ---
// ... (elementos existentes)
const btnBuscarDetalhes = document.getElementById("buscarDetalhesBtn");
const divDetalhesExtrasOutput = document.getElementById("detalhesExtrasOutput");

// --- Event Listener para o Botão de Detalhes Extras ---
btnBuscarDetalhes.addEventListener('click', async () => { // Usando async para await
  if (!veiculoSelecionado) {
    divDetalhesExtrasOutput.innerHTML = "Selecione um veículo primeiro.";
    return;
  }

  if (!veiculoSelecionado.apiId) {
     divDetalhesExtrasOutput.innerHTML = "Este veículo não possui um ID para consulta na API.";
     console.warn("Veículo selecionado não tem apiId:", veiculoSelecionado);
     return;
  }

  // Exibe mensagem de carregamento
  divDetalhesExtrasOutput.innerHTML = "Carregando detalhes da API...";

  // Chama a função assíncrona e espera o resultado
  const detalhes = await buscarDetalhesVeiculoAPI(veiculoSelecionado.apiId);

  // Exibe o resultado
  if (detalhes) {
    // Formata e exibe os dados encontrados
    let htmlDetalhes = `<strong>Detalhes Extras para ${veiculoSelecionado.modelo} (Ref: ${detalhes.modeloReferencia}):</strong><br>`;
    htmlDetalhes += `Valor FIPE: ${detalhes.valorFIPE}<br>`;
    htmlDetalhes += `Recall Pendente: ${detalhes.recallPendente ? `Sim (${detalhes.recallDescricao || 'Detalhes não especificados'})` : 'Não'}<br>`;
    htmlDetalhes += `Última Revisão: ${detalhes.ultimaRevisao || 'N/A'}<br>`;
    htmlDetalhes += `Dica: ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}`;
    divDetalhesExtrasOutput.innerHTML = htmlDetalhes;
  } else {
    // Exibe mensagem se não encontrado ou erro
    divDetalhesExtrasOutput.innerHTML = `Não foram encontrados detalhes extras para o veículo com ID ${veiculoSelecionado.apiId} ou ocorreu um erro ao buscar. Verifique o console.`;
  }
});

// --- Inicialização ---
// ... (resto da inicialização) ...
// Limpa a área de detalhes extras ao iniciar
window.addEventListener('DOMContentLoaded', (event) => {
    // ... (código existente)
    if(divDetalhesExtrasOutput) {
         divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.';
    }
});