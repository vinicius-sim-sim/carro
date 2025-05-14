// script.js

// --- Constantes e Variáveis Globais ---
const CHAVE_LOCAL_STORAGE = 'garagemInteligente';
let garagemDeVeiculos = []; // Array para armazenar todos os veículos
let veiculoSelecionado = null;

// --- Elementos do DOM ---
const divInformacoesVeiculo = document.getElementById("informacoesVeiculo");
const outputCarro = document.getElementById("outputCarro");
const outputEsportivo = document.getElementById("outputEsportivo");
const outputCaminhao = document.getElementById("outputCaminhao");
const inputPesoInteracao = document.getElementById("pesoInteracao");
const btnBuscarDetalhes = document.getElementById("buscarDetalhesBtn");
const divDetalhesExtrasOutput = document.getElementById("detalhesExtrasOutput");

// Elementos da Seção de Manutenção
const secaoManutencaoVeiculo = document.getElementById("secaoManutencaoVeiculo");
const nomeVeiculoManutencao = document.getElementById("nomeVeiculoManutencao");
const manutencaoDataInput = document.getElementById("manutencaoData");
const manutencaoTipoInput = document.getElementById("manutencaoTipo");
const manutencaoCustoInput = document.getElementById("manutencaoCusto");
const manutencaoDescricaoInput = document.getElementById("manutencaoDescricao");
const btnAdicionarManutencao = document.getElementById("btnAdicionarManutencao");
const divHistoricoManutencao = document.getElementById("historicoManutencao");
const divAgendamentosFuturos = document.getElementById("agendamentosFuturos");


// --- Funções de Persistência (LocalStorage) ---

function salvarGaragemNoLocalStorage() {
    const garagemParaSalvar = garagemDeVeiculos.map(veiculo => veiculo.toJSON());
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(garagemParaSalvar));
    console.log("Garagem salva no LocalStorage.");
}

function carregarGaragemDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_LOCAL_STORAGE);
    if (dadosSalvos) {
        const garagemArrayJSON = JSON.parse(dadosSalvos);
        garagemDeVeiculos = garagemArrayJSON.map(veiculoJSON => {
            if (!veiculoJSON || !veiculoJSON.tipoVeiculo) return null; // Proteção
            switch (veiculoJSON.tipoVeiculo) {
                case 'Carro':
                    return Carro.fromJSON(veiculoJSON);
                case 'CarroEsportivo':
                    return CarroEsportivo.fromJSON(veiculoJSON);
                case 'Caminhao':
                    return Caminhao.fromJSON(veiculoJSON);
                default:
                    console.warn("Tipo de veículo desconhecido ao carregar:", veiculoJSON.tipoVeiculo);
                    return null;
            }
        }).filter(v => v !== null); // Remove nulos se houver erro
        console.log("Garagem carregada do LocalStorage:", garagemDeVeiculos);

        // Se houver veículos, seleciona o primeiro por padrão ou o último selecionado (mais complexo)
        if (garagemDeVeiculos.length > 0) {
            // Tenta encontrar o carro padrão se ele foi o primeiro a ser criado manualmente
            const carroPadraoSaved = garagemDeVeiculos.find(v => v.apiId === "carro-padrao-01");
            if (carroPadraoSaved) {
                selecionarVeiculoPorInstancia(carroPadraoSaved);
            } else {
                 selecionarVeiculoPorInstancia(garagemDeVeiculos[0]); // Seleciona o primeiro da lista
            }
        }
        atualizarOutputsEspecificosAposCarregar(); // Atualiza as caixas de info de cada tipo
    } else {
        // Se não há dados salvos, cria o carro padrão inicial
        criarCarroPadraoSeNaoExistir();
    }
}

// --- Funções de Criação de Veículos ---

function encontrarVeiculoPorApiId(apiId) {
    return garagemDeVeiculos.find(v => v.apiId === apiId);
}

function adicionarOuAtualizarVeiculoNaGaragem(veiculo) {
    const index = garagemDeVeiculos.findIndex(v => v.apiId === veiculo.apiId);
    if (index > -1) {
        garagemDeVeiculos[index] = veiculo; // Atualiza
    } else {
        garagemDeVeiculos.push(veiculo); // Adiciona
    }
    salvarGaragemNoLocalStorage();
}

function criarCarroPadraoSeNaoExistir() {
    if (!encontrarVeiculoPorApiId("carro-padrao-01")) {
        const novoCarroPadrao = new Carro("Volkswagen Gol gti", "Branco", "carro-padrao-01");
        adicionarOuAtualizarVeiculoNaGaragem(novoCarroPadrao);
        if (!veiculoSelecionado) { // Seleciona se nada estiver selecionado
            selecionarVeiculoPorInstancia(novoCarroPadrao);
        }
        outputCarro.textContent = `Carro Padrão (Modelo: ${novoCarroPadrao.modelo}, Cor: ${novoCarroPadrao.cor}) criado/carregado.`;
    }
}

function criarCarroEsportivo() {
    const modelo = document.getElementById("modeloEsportivo").value || "Esportivo Padrão";
    const cor = document.getElementById("corEsportivo").value || "Amarelo";
    const apiId = "esportivo-" + modelo.toLowerCase().replace(/\s/g, '-') + "-" + Math.floor(Math.random()*100); // ID mais dinâmico

    let carroEsportivoExistente = encontrarVeiculoPorApiId(apiId); // Tenta encontrar um com mesmo ID
    if (!carroEsportivoExistente && garagemDeVeiculos.find(v => v.modelo === modelo && v.cor === cor && v instanceof CarroEsportivo)) {
        // Se não encontrou por ID, mas já existe um com mesmo modelo e cor, avisa (ou poderia atualizar)
        // Para este exemplo, vamos focar em criar um novo se o ID for diferente.
        // Ou permitir recriar limpando o anterior, o que é mais complexo de gerenciar sem IDs fixos.
        // Por simplicidade, se o usuário clicar em "criar", vamos criar um novo se o ID for novo
        // ou atualizar se o ID já existe.
        // Para o propósito deste exemplo, vamos assumir que "Criar/Recriar" significa que se já existe um
        // com o ID gerado dinamicamente (pouco provável), ele seria atualizado.
        // A melhor abordagem seria ter um ID fixo por slot de criação ou listar os veículos criados.
    }

    const novoCarroEsportivo = new CarroEsportivo(modelo, cor, apiId);
    adicionarOuAtualizarVeiculoNaGaragem(novoCarroEsportivo);
    console.log("Carro Esportivo criado/atualizado:", novoCarroEsportivo);
    outputEsportivo.textContent = `Carro Esportivo ${modelo} ${cor} criado. Selecione-o para interagir.`;
    selecionarVeiculoPorInstancia(novoCarroEsportivo);
    salvarGaragemNoLocalStorage();
}

function criarCaminhao() {
    const modelo = document.getElementById("modeloCaminhao").value || "Caminhão Padrão";
    const cor = document.getElementById("corCaminhao").value || "Branco";
    const capacidade = parseInt(document.getElementById("capacidadeCaminhao").value) || 5000;
    const apiId = "caminhao-" + modelo.toLowerCase().replace(/\s/g, '-') + "-" + Math.floor(Math.random()*100);

    const novoCaminhao = new Caminhao(modelo, cor, capacidade, apiId);
    adicionarOuAtualizarVeiculoNaGaragem(novoCaminhao);
    console.log("Caminhão criado/atualizado:", novoCaminhao);
    outputCaminhao.textContent = `Caminhão ${modelo} ${cor} (Cap: ${capacidade}kg) criado. Selecione-o para interagir.`;
    selecionarVeiculoPorInstancia(novoCaminhao);
    salvarGaragemNoLocalStorage();
}

// --- Funções de Atualização da Interface ---

function atualizarExibicaoInformacoes() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = veiculoSelecionado.exibirInformacoes().replace(/, /g, '<br>');
        secaoManutencaoVeiculo.style.display = "block";
        nomeVeiculoManutencao.textContent = `${veiculoSelecionado.constructor.name} ${veiculoSelecionado.modelo}`;
        atualizarHistoricoEAgendamentosManutencao();
    } else {
        divInformacoesVeiculo.textContent = "Nenhum veículo selecionado. Crie ou selecione um veículo.";
        secaoManutencaoVeiculo.style.display = "none";
    }
    // Não é mais necessário atualizar outputs específicos aqui, eles são atualizados ao criar/carregar
}

function atualizarOutputsEspecificosAposCarregar() {
    const carroPadrao = encontrarVeiculoPorApiId("carro-padrao-01");
    if (carroPadrao) {
        outputCarro.textContent = `Carro Padrão (Modelo: ${carroPadrao.modelo}, Cor: ${carroPadrao.cor}).`;
    } else {
        outputCarro.textContent = "Carro Padrão não encontrado ou ainda não criado.";
    }

    // Para esportivos e caminhões, a lógica de exibição individual pode ser mais complexa
    // se vários puderem ser criados. Por ora, o outputEsportivo/Caminhao reflete o último criado/selecionado.
    // Idealmente, teríamos uma lista de todos os veículos criados.
    const ultimoEsportivo = garagemDeVeiculos.filter(v => v instanceof CarroEsportivo).pop();
    if (ultimoEsportivo) {
         outputEsportivo.textContent = `Carro Esportivo ${ultimoEsportivo.modelo} ${ultimoEsportivo.cor} disponível.`;
    } else {
        outputEsportivo.textContent = "Nenhum Carro Esportivo criado.";
    }

    const ultimoCaminhao = garagemDeVeiculos.filter(v => v instanceof Caminhao).pop();
    if (ultimoCaminhao) {
        outputCaminhao.textContent = `Caminhão ${ultimoCaminhao.modelo} (Cap: ${ultimoCaminhao.capacidadeCarga}kg) disponível.`;
    } else {
        outputCaminhao.textContent = "Nenhum Caminhão criado.";
    }
}


function atualizarHistoricoEAgendamentosManutencao() {
    if (!veiculoSelecionado) return;

    // Histórico
    divHistoricoManutencao.innerHTML = veiculoSelecionado.getHistoricoManutencaoFormatado();

    // Agendamentos Futuros
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Comparar apenas a data

    const agendamentos = veiculoSelecionado.historicoManutencao.filter(m => {
        let dataManutencao;
        if (m.data.includes('-')) { // YYYY-MM-DD
            dataManutencao = new Date(m.data + "T00:00:00");
        } else { // DD/MM/YYYY
            const [dia, mes, ano] = m.data.split('/');
            dataManutencao = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        }
        return dataManutencao >= hoje;
    }).sort((a, b) => { // Ordena por data (mais próximo primeiro)
        const dataA = a.data.includes('-') ? new Date(a.data) : new Date(a.data.split('/').reverse().join('-'));
        const dataB = b.data.includes('-') ? new Date(b.data) : new Date(b.data.split('/').reverse().join('-'));
        return dataA - dataB;
    });

    if (agendamentos.length === 0) {
        divAgendamentosFuturos.innerHTML = "Nenhum agendamento futuro.";
    } else {
        let html = "<ul>";
        agendamentos.forEach(m => {
            html += `<li>${m.formatarManutencao()}</li>`;
        });
        html += "</ul>";
        divAgendamentosFuturos.innerHTML = html;
        verificarLembretesAgendamento(agendamentos);
    }
}


// --- Funções de Seleção de Veículo ---
function selecionarVeiculoPorInstancia(instanciaVeiculo) {
    if (instanciaVeiculo) {
        veiculoSelecionado = instanciaVeiculo;
        console.log("Veículo selecionado:", veiculoSelecionado);
        atualizarExibicaoInformacoes();
        divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.'; // Resetar detalhes API
    } else {
        console.warn("Tentativa de selecionar instância de veículo nula.");
    }
}

// Função para selecionar pelos botões principais (que buscam na garagem)
function selecionarVeiculoPorTipoOuCriar(tipo) {
    let veiculoParaSelecionar = null;
    switch (tipo) {
        case 'carro':
            veiculoParaSelecionar = encontrarVeiculoPorApiId("carro-padrao-01");
            if (!veiculoParaSelecionar) {
                alert("Carro Padrão não encontrado. Ele será criado.");
                criarCarroPadraoSeNaoExistir(); // Garante que exista
                veiculoParaSelecionar = encontrarVeiculoPorApiId("carro-padrao-01");
            }
            break;
        case 'esportivo':
            // Tenta pegar o último esportivo criado, ou o primeiro se não houver "último" claro
            const esportivos = garagemDeVeiculos.filter(v => v instanceof CarroEsportivo);
            if (esportivos.length > 0) {
                veiculoParaSelecionar = esportivos[esportivos.length -1]; // Pega o último adicionado
            } else {
                alert("Nenhum Carro Esportivo criado. Crie um primeiro na seção 'Carro Esportivo'.");
                return;
            }
            break;
        case 'caminhao':
            const caminhoes = garagemDeVeiculos.filter(v => v instanceof Caminhao);
             if (caminhoes.length > 0) {
                veiculoParaSelecionar = caminhoes[caminhoes.length -1];
            } else {
                alert("Nenhum Caminhão criado. Crie um primeiro na seção 'Caminhão'.");
                return;
            }
            break;
        default:
            console.error("Tipo de veículo desconhecido para seleção:", tipo);
            return;
    }

    if (veiculoParaSelecionar) {
        selecionarVeiculoPorInstancia(veiculoParaSelecionar);
    } else {
        // A mensagem de "crie primeiro" já foi dada para esportivo/caminhão
        // Para o carro padrão, ele deve ser criado se não existir.
        console.log(`Nenhum veículo do tipo ${tipo} encontrado para seleção imediata.`);
    }
}


// --- Função de Interação Genérica ---
function interagir(acao) { // Removido o parâmetro 'veiculo' pois usaremos 'veiculoSelecionado'
    if (!veiculoSelecionado) {
        alert("Nenhum veículo selecionado para interagir!");
        return;
    }

    console.log(`Interagindo com ${veiculoSelecionado.constructor.name} (${veiculoSelecionado.modelo}) - Ação: ${acao}`);
    try {
        switch (acao) {
            case 'ligar':
                veiculoSelecionado.ligar();
                break;
            case 'desligar':
                veiculoSelecionado.desligar();
                break;
            case 'acelerar':
                if (veiculoSelecionado.ligado) {
                    veiculoSelecionado.acelerar();
                } else {
                    alert("Ligue o veículo primeiro!");
                }
                break;
            case 'frear':
                if (veiculoSelecionado.ligado) {
                    veiculoSelecionado.frear(5);
                } else {
                     console.log("Veículo desligado, mas frear pode ser possível (ex: freio de mão).");
                     // Para este exemplo, vamos manter a necessidade de estar ligado para simplificar.
                     alert("Ligue o veículo para usar o freio motor.");
                }
                break;
            case 'ativarTurbo':
                if (typeof veiculoSelecionado.ativarTurbo === 'function') {
                    veiculoSelecionado.ativarTurbo();
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`);
                }
                break;
            case 'desativarTurbo':
                if (typeof veiculoSelecionado.desativarTurbo === 'function') {
                    veiculoSelecionado.desativarTurbo();
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`);
                }
                break;
            case 'carregar':
                if (typeof veiculoSelecionado.carregar === 'function') {
                    const peso = parseInt(inputPesoInteracao.value);
                    if (!isNaN(peso) && peso > 0) {
                        veiculoSelecionado.carregar(peso);
                    } else {
                        alert("Por favor, insira um peso válido para carregar.");
                    }
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`);
                }
                break;
            case 'descarregar':
                if (typeof veiculoSelecionado.descarregar === 'function') {
                    const peso = parseInt(inputPesoInteracao.value);
                    if (!isNaN(peso) && peso > 0) {
                        veiculoSelecionado.descarregar(peso);
                    } else {
                        alert("Por favor, insira um peso válido para descarregar.");
                    }
                } else {
                    alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`);
                }
                break;
            default:
                alert(`Ação desconhecida: ${acao}`);
        }
    } catch (error) {
        console.error(`Erro ao executar a ação '${acao}' em ${veiculoSelecionado.constructor.name}:`, error);
        alert(`Ocorreu um erro ao tentar '${acao}'. Verifique o console.`);
    }

    atualizarExibicaoInformacoes();
    salvarGaragemNoLocalStorage(); // Salva o estado após a interação
}

// Wrapper para os botões do HTML que não passam o veículo
function chamarInteragir(acao) {
    interagir(acao);
}

// --- Lógica de Manutenção ---
function lidarComAdicaoManutencao() {
    if (!veiculoSelecionado) {
        alert("Selecione um veículo para adicionar manutenção.");
        return;
    }

    const data = manutencaoDataInput.value;
    const tipo = manutencaoTipoInput.value.trim();
    const custo = parseFloat(manutencaoCustoInput.value);
    const descricao = manutencaoDescricaoInput.value.trim();

    const novaManutencao = new Manutencao(data, tipo, custo, descricao);
    const validacao = novaManutencao.validarDados();

    if (!validacao.valido) {
        alert(`Erro no formulário de manutenção: ${validacao.mensagem}`);
        return;
    }

    veiculoSelecionado.adicionarManutencao(novaManutencao); // O método do veículo já valida
    salvarGaragemNoLocalStorage();
    atualizarHistoricoEAgendamentosManutencao();

    // Limpar formulário
    manutencaoDataInput.value = "";
    manutencaoTipoInput.value = "";
    manutencaoCustoInput.value = "";
    manutencaoDescricaoInput.value = "";

    alert("Manutenção adicionada/agendada com sucesso!");
}


// --- Lembretes e Notificações ---
function verificarLembretesAgendamento(agendamentos) {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    agendamentos.forEach(m => {
        let dataManutencao;
         if (m.data.includes('-')) { // YYYY-MM-DD
            dataManutencao = new Date(m.data + "T00:00:00");
        } else { // DD/MM/YYYY
            const [dia, mes, ano] = m.data.split('/');
            dataManutencao = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        }

        const nomeVeiculo = `${veiculoSelecionado.constructor.name} ${veiculoSelecionado.modelo}`;

        if (dataManutencao.toDateString() === hoje.toDateString()) {
            alert(`Lembrete HOJE: ${m.tipo} para ${nomeVeiculo} agendado(a) para hoje!`);
        } else if (dataManutencao.toDateString() === amanha.toDateString()) {
            alert(`Lembrete AMANHÃ: ${m.tipo} para ${nomeVeiculo} agendado(a) para amanhã!`);
        }
    });
}


// --- Funções da API Simulada (mantidas como estavam) ---
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    // ... (código da função buscarDetalhesVeiculoAPI como estava antes)
    console.log(`Buscando detalhes para o ID: ${identificadorVeiculo}`);
    try {
      const response = await fetch('./dados_veiculos_api.json');
      if (!response.ok) {
        console.error(`Erro ao buscar API: ${response.status} ${response.statusText}`);
        return null;
      }
      const todosVeiculosAPI = await response.json();
      const veiculoEncontrado = todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo);
      if (veiculoEncontrado) {
        console.log("Veículo encontrado na API:", veiculoEncontrado);
        return veiculoEncontrado;
      } else {
        console.log(`Veículo com ID ${identificadorVeiculo} não encontrado na API.`);
        return null;
      }
    } catch (error) {
      console.error("Falha ao buscar ou processar dados da API:", error);
      return null;
    }
}


// --- Event Listeners ---
document.getElementById("selectCarroBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('carro'));
document.getElementById("selectEsportivoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('esportivo'));
document.getElementById("selectCaminhaoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('caminhao'));

btnAdicionarManutencao.addEventListener("click", lidarComAdicaoManutencao);

btnBuscarDetalhes.addEventListener('click', async () => {
  if (!veiculoSelecionado) {
    divDetalhesExtrasOutput.innerHTML = "Selecione um veículo primeiro.";
    return;
  }
  if (!veiculoSelecionado.apiId) {
     divDetalhesExtrasOutput.innerHTML = "Este veículo não possui um ID para consulta na API.";
     return;
  }
  divDetalhesExtrasOutput.innerHTML = "Carregando detalhes da API...";
  const detalhes = await buscarDetalhesVeiculoAPI(veiculoSelecionado.apiId);
  if (detalhes) {
    let htmlDetalhes = `<strong>Detalhes Extras para ${veiculoSelecionado.modelo} (Ref: ${detalhes.modeloReferencia}):</strong><br>`;
    htmlDetalhes += `Valor FIPE: ${detalhes.valorFIPE}<br>`;
    htmlDetalhes += `Recall Pendente: ${detalhes.recallPendente ? `Sim (${detalhes.recallDescricao || 'Detalhes não especificados'})` : 'Não'}<br>`;
    let dataRevisaoFormatada = 'N/A';
    if (detalhes.ultimaRevisao && detalhes.ultimaRevisao.includes('-')) {
        const partes = detalhes.ultimaRevisao.split('-');
        dataRevisaoFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    } else if (detalhes.ultimaRevisao) {
        dataRevisaoFormatada = detalhes.ultimaRevisao; // Se já estiver em outro formato
    }
    htmlDetalhes += `Última Revisão (API): ${dataRevisaoFormatada}<br>`;
    htmlDetalhes += `Dica: ${detalhes.dicaManutencao || 'Nenhuma dica disponível.'}`;
    divDetalhesExtrasOutput.innerHTML = htmlDetalhes;
  } else {
    divDetalhesExtrasOutput.innerHTML = `Não foram encontrados detalhes extras para o veículo com ID ${veiculoSelecionado.apiId} ou ocorreu um erro ao buscar.`;
  }
});


// --- Inicialização ---
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Inicializando garagem...');
    carregarGaragemDoLocalStorage(); // Carrega os veículos do LocalStorage ou cria o padrão
    // Se nenhum veículo foi selecionado após carregar (garagem estava vazia e carro padrão foi criado),
    // garante que a exibição inicial seja atualizada.
    if (!veiculoSelecionado && garagemDeVeiculos.length > 0) {
        selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
    } else {
        atualizarExibicaoInformacoes(); // Garante que a UI de manutenção fique oculta se nada selecionado
    }

    if (divDetalhesExtrasOutput) {
         divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.';
    }

    // Inicializar o Datepicker (flatpickr)
    if (typeof flatpickr !== "undefined") {
        flatpickr("#manutencaoData", {
            dateFormat: "Y-m-d", // Salva no formato YYYY-MM-DD
            altInput: true,
            altFormat: "d/m/Y", // Exibe no formato DD/MM/YYYY
        });
    } else {
        console.warn("Flatpickr não carregado. O input de data será o padrão do navegador.");
    }
});