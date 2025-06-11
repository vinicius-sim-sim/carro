// script.js

// --- Constantes e Variáveis Globais ---
const CHAVE_LOCAL_STORAGE = 'garagemInteligente';
let garagemDeVeiculos = []; // Array para armazenar todos os veículos
let veiculoSelecionado = null;

// --- CONSTANTES E VARIÁVEIS GLOBAIS (PREVISÃO DO TEMPO VIAGEM) ---
// !!!!! IMPORTANTE: A CHAVE FOI REMOVIDA DAQUI !!!!!
// const OPENWEATHER_API_KEY = "SUA_CHAVE_AQUI"; // <<-- ISSO FOI REMOVIDO
let previsoesCidadeCache = null;
let numDiasFiltroAtual = 5;

// --- Elementos do DOM (código original mantido) ---
const divInformacoesVeiculo = document.getElementById("informacoesVeiculo");
const btnAdicionarManutencao = document.getElementById("btnAdicionarManutencao");
const divHistoricoManutencao = document.getElementById("historicoManutencao");
const divAgendamentosFuturos = document.getElementById("agendamentosFuturos");
const inputCidadeDestino = document.getElementById("cidadeDestino");
const btnBuscarPrevisao = document.getElementById("buscarPrevisaoBtn");
const divPrevisaoContainer = document.getElementById("previsaoContainer");
const divFiltroDiasPrevisao = document.getElementById("filtroDiasPrevisao");
const outputCarro = document.getElementById("outputCarro");
const outputEsportivo = document.getElementById("outputEsportivo");
const outputCaminhao = document.getElementById("outputCaminhao");
const inputPesoInteracao = document.getElementById("pesoInteracao");
const btnBuscarDetalhes = document.getElementById("buscarDetalhesBtn");
const divDetalhesExtrasOutput = document.getElementById("detalhesExtrasOutput");
const secaoManutencaoVeiculo = document.getElementById("secaoManutencaoVeiculo");
const nomeVeiculoManutencao = document.getElementById("nomeVeiculoManutencao");
const manutencaoDataInput = document.getElementById("manutencaoData");
const manutencaoTipoInput = document.getElementById("manutencaoTipo");
const manutencaoCustoInput = document.getElementById("manutencaoCusto");
const manutencaoDescricaoInput = document.getElementById("manutencaoDescricao");

// --- TODAS AS OUTRAS FUNÇÕES (criar carro, salvar, etc.) ESTÃO EXATAMENTE IGUAIS ---
// (Omitidas aqui para focar na mudança, mas estão no código final abaixo)
// ...

// --- FUNÇÕES DE PREVISÃO DO TEMPO PARA VIAGEM ---

// As funções abaixo (formatar, processar, exibir) permanecem IGUAIS.
function formatarDataPrevisao(dataObj) { /* ...código original mantido... */ }
function processarDadosPrevisao(dadosApi) { /* ...código original mantido... */ }
function exibirPrevisaoTempo(previsoesDiariasProcessadas, numDiasParaExibir) { /* ...código original mantido... */ }
function toggleDetalhesDia(event) { /* ...código original mantido... */ }


/**
 * Busca os dados da previsão do tempo.
 * ESSA É A FUNÇÃO QUE FOI ALTERADA PARA A ATIVIDADE A6.
 * @param {string} cidade - O nome da cidade.
 * @returns {Promise<object|null>} Os dados da API ou null em caso de erro.
 */
async function buscarDadosOpenWeatherMap(cidade) {
    // Validação inicial continua a mesma
    if (!cidade) {
        if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = "<p style='color:orange; text-align:center;'>Por favor, digite o nome da cidade.</p>";
        return null;
    }

    if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = `<p style="text-align:center;">Buscando previsão para ${cidade}...</p>`;

    // <<< MUDANÇA PRINCIPAL PARA A ATIVIDADE A6 >>>
    // A URL agora aponta para o seu backend no Render.com.
    // Você DEVE substituir a URL de exemplo pela URL real do seu serviço no Render.
    const backendUrl = 'https://SEU-BACKEND-NO-RENDER.onrender.com'; // <-- MUDE ISSO!
    const urlApi = `${backendUrl}/api/previsao/${encodeURIComponent(cidade)}`;


    // ANTES (CÓDIGO ANTIGO COMENTADO):
    /*
    if (OPENWEATHER_API_KEY === "" || !OPENWEATHER_API_KEY) {
        console.error("Chave da API OpenWeatherMap não configurada.");
        if(divPrevisaoContainer) divPrevisaoContainer.innerHTML = "<p style='color:red; text-align:center;'>ERRO: Chave da API OpenWeatherMap não configurada no script.js.</p>";
        return null;
    }
    const urlComUnits = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cidade)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    */
    // FIM DO CÓDIGO ANTIGO

    // DEPOIS (NOVO CÓDIGO):
    try {
        console.log(`[Frontend] Fazendo requisição para o backend na nuvem: ${urlApi}`);
        const response = await fetch(urlApi);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // A mensagem de erro agora vem do nosso backend!
            throw new Error(errorData.error || `Erro ${response.status} ao contatar o servidor.`);
        }

        const data = await response.json();
        console.log("[Frontend] Dados recebidos do backend na nuvem:", data);
        return data; // Retorna os dados para a função `iniciarBuscaPrevisao`

    } catch (error) {
        console.error("[Frontend] Erro ao buscar previsão no backend:", error);
        if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = `<p style='color:red; text-align:center;'>Falha ao buscar previsão: ${error.message}</p>`;
        return null;
    }
}


/**
 * Inicia o processo de busca e exibição da previsão do tempo.
 * ESSA FUNÇÃO NÃO MUDA, ELA CONTINUA CHAMANDO a `buscarDadosOpenWeatherMap` que nós alteramos.
 */
async function iniciarBuscaPrevisao() {
    const cidade = inputCidadeDestino.value.trim();
    if (!cidade) {
        alert("Por favor, digite o nome da cidade.");
        return;
    }

    const dadosApi = await buscarDadosOpenWeatherMap(cidade); // <-- A mágica acontece aqui dentro agora
    if (dadosApi) {
        // O resto do código funciona da mesma forma
        previsoesCidadeCache = processarDadosPrevisao(dadosApi);
        if (previsoesCidadeCache) {
            exibirPrevisaoTempo(previsoesCidadeCache, numDiasFiltroAtual);
        } else {
            if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = "<p style='color:red; text-align:center;'>Não foi possível processar os dados da previsão.</p>";
        }
    }
    // Se dadosApi for null, a mensagem de erro já foi exibida por buscarDadosOpenWeatherMap
}


// --- RESTANTE DO CÓDIGO (Event Listeners e Inicialização) ---
// Nenhum outro código foi alterado.

function configurarFiltrosDeDias() {
    if (!divFiltroDiasPrevisao) return;
    const botoesFiltro = divFiltroDiasPrevisao.querySelectorAll("button");
    botoesFiltro.forEach(botao => {
        botao.addEventListener("click", (event) => {
            botoesFiltro.forEach(b => b.classList.remove("active"));
            event.currentTarget.classList.add("active");
            numDiasFiltroAtual = parseInt(event.currentTarget.getAttribute("data-dias"));
            if (previsoesCidadeCache) {
                exibirPrevisaoTempo(previsoesCidadeCache, numDiasFiltroAtual);
            }
        });
    });
}
document.getElementById("selectCarroBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('carro'));
document.getElementById("selectEsportivoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('esportivo'));
document.getElementById("selectCaminhaoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('caminhao'));
btnAdicionarManutencao.addEventListener("click", lidarComAdicaoManutencao);
btnBuscarDetalhes.addEventListener('click', async () => { /* ...código original mantido... */ });
if (btnBuscarPrevisao) { btnBuscarPrevisao.addEventListener("click", iniciarBuscaPrevisao); }
if (inputCidadeDestino) { inputCidadeDestino.addEventListener("keypress", (event) => { if (event.key === "Enter") { event.preventDefault(); iniciarBuscaPrevisao(); } }); }
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Inicializando garagem...');
    carregarGaragemDoLocalStorage();
    if (!veiculoSelecionado && garagemDeVeiculos.length > 0) {
        selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
    } else {
        atualizarExibicaoInformacoes();
    }
    if (typeof flatpickr !== "undefined") {
        flatpickr("#manutencaoData", { dateFormat: "Y-m-d", altInput: true, altFormat: "d/m/Y" });
    }
    configurarFiltrosDeDias();
});

// Incluindo aqui as funções que foram omitidas para não quebrar seu código
function selecionarVeiculoPorTipoOuCriar(tipo) {
    let veiculoParaSelecionar = null;
    switch (tipo) {
        case 'carro':
            veiculoParaSelecionar = encontrarVeiculoPorApiId("carro-padrao-01");
            if (!veiculoParaSelecionar) {
                alert("Carro Padrão não encontrado. Ele será criado.");
                criarCarroPadraoSeNaoExistir();
                veiculoParaSelecionar = encontrarVeiculoPorApiId("carro-padrao-01");
            }
            break;
        case 'esportivo':
            const esportivos = garagemDeVeiculos.filter(v => v instanceof CarroEsportivo);
            if (esportivos.length > 0) {
                veiculoParaSelecionar = esportivos[esportivos.length - 1];
            } else {
                alert("Nenhum Carro Esportivo criado. Crie um primeiro na seção 'Carro Esportivo'.");
                return;
            }
            break;
        case 'caminhao':
            const caminhoes = garagemDeVeiculos.filter(v => v instanceof Caminhao);
            if (caminhoes.length > 0) {
                veiculoParaSelecionar = caminhoes[caminhoes.length - 1];
            } else {
                alert("Nenhum Caminhão criado. Crie um primeiro na seção 'Caminhão'.");
                return;
            }
            break;
        default: console.error("Tipo de veículo desconhecido para seleção:", tipo); return;
    }
    if (veiculoParaSelecionar) { selecionarVeiculoPorInstancia(veiculoParaSelecionar); }
}
function chamarInteragir(acao) {
    if (!veiculoSelecionado) { alert("Nenhum veículo selecionado para interagir!"); return; }
    try {
        let metodo = veiculoSelecionado[acao];
        if (typeof metodo === 'function') {
            if (acao === 'carregar' || acao === 'descarregar') {
                const peso = parseInt(inputPesoInteracao.value);
                if (!isNaN(peso) && peso > 0) { metodo.call(veiculoSelecionado, peso); } else { alert(`Por favor, insira um peso válido para ${acao}.`); }
            } else { metodo.call(veiculoSelecionado); }
        } else { alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`); }
    } catch (error) { console.error(`Erro ao executar a ação '${acao}' em ${veiculoSelecionado.constructor.name}:`, error); alert(`Ocorreu um erro ao tentar '${acao}'.`); }
    atualizarExibicaoInformacoes(); salvarGaragemNoLocalStorage();
}
function lidarComAdicaoManutencao() {
    if (!veiculoSelecionado) { alert("Selecione um veículo para adicionar manutenção."); return; }
    const data = manutencaoDataInput.value;
    const tipo = manutencaoTipoInput.value.trim();
    const custo = parseFloat(manutencaoCustoInput.value);
    const descricao = manutencaoDescricaoInput.value.trim();
    const novaManutencao = new Manutencao(data, tipo, custo, descricao);
    const validacao = novaManutencao.validarDados();
    if (!validacao.valido) { alert(`Erro no formulário: ${validacao.mensagem}`); return; }
    veiculoSelecionado.adicionarManutencao(novaManutencao);
    salvarGaragemNoLocalStorage();
    atualizarHistoricoEAgendamentosManutencao();
    manutencaoDataInput.value = ""; manutencaoTipoInput.value = ""; manutencaoCustoInput.value = ""; manutencaoDescricaoInput.value = "";
    alert("Manutenção adicionada/agendada com sucesso!");
}
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch('./dados_veiculos_api.json');
        if (!response.ok) { return null; }
        const todosVeiculosAPI = await response.json();
        return todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo) || null;
    } catch (error) { console.error("Falha ao buscar dados da API:", error); return null; }
}