// script.js

// --- Constantes e Variáveis Globais ---
const CHAVE_LOCAL_STORAGE = 'garagemInteligente';
let garagemDeVeiculos = []; // Array para armazenar todos os veículos
let veiculoSelecionado = null;

// --- CONSTANTES E VARIÁVEIS GLOBAIS (PREVISÃO DO TEMPO VIAGEM) ---
let previsoesCidadeCache = null;
let numDiasFiltroAtual = 5;

// --- Elementos do DOM ---
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

// ===================================================================
// FUNÇÕES QUE ESTAVAM FALTANDO
// ===================================================================

/**
 * Salva o array garagemDeVeiculos no Local Storage.
 */
function salvarGaragemNoLocalStorage() {
    try {
        const dadosSerializados = JSON.stringify(garagemDeVeiculos);
        localStorage.setItem(CHAVE_LOCAL_STORAGE, dadosSerializados);
        console.log("Garagem salva no Local Storage.");
    } catch (error) {
        console.error("Erro ao salvar garagem no Local Storage:", error);
    }
}

/**
 * Carrega os veículos do Local Storage e recria as instâncias das classes corretas.
 */
function carregarGaragemDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_LOCAL_STORAGE);
    if (!dadosSalvos) {
        console.log("Nenhum dado salvo encontrado. Criando carro padrão.");
        criarCarroPadraoSeNaoExistir();
        return;
    }

    try {
        const dadosDesserializados = JSON.parse(dadosSalvos);
        garagemDeVeiculos = dadosDesserializados.map(veiculoJson => {
            if (!veiculoJson) return null;
            // Usa a propriedade tipoVeiculo para decidir qual classe instanciar
            switch (veiculoJson.tipoVeiculo) {
                case 'Carro':
                    return Carro.fromJSON(veiculoJson);
                case 'CarroEsportivo':
                    return CarroEsportivo.fromJSON(veiculoJson);
                case 'Caminhao':
                    return Caminhao.fromJSON(veiculoJson);
                default:
                    console.warn("Tipo de veículo desconhecido no JSON:", veiculoJson);
                    return null;
            }
        }).filter(v => v !== null); // Remove qualquer entrada nula

        console.log("Garagem carregada do Local Storage:", garagemDeVeiculos);
    } catch (error) {
        console.error("Erro ao carregar e desserializar a garagem:", error);
        garagemDeVeiculos = []; // Reseta a garagem em caso de erro
    }
}

/**
 * Atualiza a exibição de informações do veículo selecionado e a seção de manutenção.
 */
function atualizarExibicaoInformacoes() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        secaoManutencaoVeiculo.style.display = 'block';
        nomeVeiculoManutencao.textContent = veiculoSelecionado.modelo;
        atualizarHistoricoEAgendamentosManutencao();
    } else {
        divInformacoesVeiculo.textContent = "Nenhum veículo selecionado. Crie ou selecione um veículo.";
        secaoManutencaoVeiculo.style.display = 'none';
        divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.';
    }
    // Atualiza a exibição individual dos veículos se necessário
    outputCarro.textContent = encontrarVeiculoPorApiId("carro-padrao-01")?.exibirInformacoes() || "Carro Padrão (Modelo: Volkswagen Gol gti, Cor: Branco).";
    const ultimoEsportivo = garagemDeVeiculos.filter(v => v instanceof CarroEsportivo).pop();
    outputEsportivo.textContent = ultimoEsportivo?.exibirInformacoes() || "Carro Esportivo ainda não criado.";
    const ultimoCaminhao = garagemDeVeiculos.filter(v => v instanceof Caminhao).pop();
    outputCaminhao.textContent = ultimoCaminhao?.exibirInformacoes() || "Caminhão ainda não criado.";
}

/**
 * Atualiza as listas de histórico e agendamentos de manutenção na UI.
 */
function atualizarHistoricoEAgendamentosManutencao() {
    if (!veiculoSelecionado) return;

    const agora = new Date();
    agora.setHours(0, 0, 0, 0); // Para comparar apenas a data

    const historico = [];
    const agendamentos = [];

    veiculoSelecionado.historicoManutencao.forEach(manutencao => {
        let dataManutencao;
        if (manutencao.data.includes('-')) {
            dataManutencao = new Date(manutencao.data + "T00:00:00");
        } else {
            const [dia, mes, ano] = manutencao.data.split('/');
            dataManutencao = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        }

        if (dataManutencao <= agora) {
            historico.push(manutencao);
        } else {
            agendamentos.push(manutencao);
        }
    });

    // Ordena por data, mais recente primeiro
    historico.sort((a, b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));
    agendamentos.sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')));

    divHistoricoManutencao.innerHTML = historico.length > 0 ? `<ul>${historico.map(m => `<li>${m.formatarManutencao()}</li>`).join('')}</ul>` : "Nenhum histórico.";
    divAgendamentosFuturos.innerHTML = agendamentos.length > 0 ? `<ul>${agendamentos.map(m => `<li>${m.formatarManutencao()}</li>`).join('')}</ul>` : "Nenhum agendamento futuro.";
}


/**
 * Define o veículo globalmente selecionado e atualiza a UI.
 * @param {Carro|null} instanciaVeiculo - A instância do veículo a ser selecionada, ou null.
 */
function selecionarVeiculoPorInstancia(instanciaVeiculo) {
    veiculoSelecionado = instanciaVeiculo;
    console.log("Veículo selecionado:", veiculoSelecionado);
    atualizarExibicaoInformacoes();
}

/**
 * Encontra um veículo na garagem pelo seu apiId.
 * @param {string} apiId - O ID do veículo a ser encontrado.
 * @returns {Carro|undefined} A instância do veículo ou undefined se não for encontrado.
 */
function encontrarVeiculoPorApiId(apiId) {
    return garagemDeVeiculos.find(v => v.apiId === apiId);
}

/**
 * Cria o carro padrão se ele ainda não existir na garagem.
 */
function criarCarroPadraoSeNaoExistir() {
    if (!encontrarVeiculoPorApiId("carro-padrao-01")) {
        const carroPadrao = new Carro("Volkswagen Gol gti", "Branco", "carro-padrao-01");
        garagemDeVeiculos.push(carroPadrao);
        console.log("Carro Padrão criado.");
        salvarGaragemNoLocalStorage();
    }
}

/**
 * [FUNÇÃO MODIFICADA]
 * Coleta dados do formulário e chama a função `criarVeiculo`.
 */
function criarCarroEsportivo() {
    // Aqui usamos os inputs do HTML para pegar os dados.
    // É importante que os campos `placa`, `marca`, `modelo` e `ano` existam no formulário ou sejam preenchidos de alguma forma.
    // Para este exemplo, vamos adicionar um prompt para a placa, que é única.
    const placa = prompt("Digite a PLACA do carro esportivo (ex: ESP0RTE):");
    if (!placa) {
        alert("A criação foi cancelada. A placa é obrigatória.");
        return;
    }

    const dadosVeiculo = {
        placa: placa,
        marca: document.getElementById("modeloEsportivo").value || "Toyota",
        modelo: "Esportivo Genérico", // Você pode ajustar isso
        ano: new Date().getFullYear(), // Ano atual como padrão
        cor: document.getElementById("corEsportivo").value || "Preto"
    };
    
    criarVeiculo(dadosVeiculo);
}

/**
 * [FUNÇÃO MODIFICADA]
 * Coleta dados do formulário e chama a função `criarVeiculo`.
 */
function criarCaminhao() {
    const placa = prompt("Digite a PLACA do caminhão (ex: CAM1NH4O):");
    if (!placa) {
        alert("A criação foi cancelada. A placa é obrigatória.");
        return;
    }

    const dadosVeiculo = {
        placa: placa,
        marca: document.getElementById("modeloCaminhao").value || "Volvo",
        modelo: "Caminhão Genérico",
        ano: new Date().getFullYear() - 2, // Ano um pouco mais antigo
        cor: document.getElementById("corCaminhao").value || "Vermelho"
    };
    
    criarVeiculo(dadosVeiculo);
}

// --- FUNÇÕES DE PREVISÃO DO TEMPO PARA VIAGEM ---
// (Estas funções estavam corretas, mantidas como estavam)

function formatarDataPrevisao(dataObj) {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return `${diasSemana[dataObj.getDay()]} ${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth() + 1).toString().padStart(2, '0')}`;
}

function processarDadosPrevisao(dadosApi) {
    if (!dadosApi || !dadosApi.list) return null;
    const previsoesDiarias = {};
    dadosApi.list.forEach(item => {
        const data = new Date(item.dt * 1000);
        const diaChave = data.toISOString().split('T')[0]; // Ex: "2024-05-21"

        if (!previsoesDiarias[diaChave]) {
            previsoesDiarias[diaChave] = {
                data: data,
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                descricoes: new Set(),
                icones: new Set(),
                chuva: 0,
                vento_max: 0,
                horarios: []
            };
        }
        previsoesDiarias[diaChave].temp_min = Math.min(previsoesDiarias[diaChave].temp_min, item.main.temp_min);
        previsoesDiarias[diaChave].temp_max = Math.max(previsoesDiarias[diaChave].temp_max, item.main.temp_max);
        previsoesDiarias[diaChave].descricoes.add(item.weather[0].description);
        previsoesDiarias[diaChave].icones.add(item.weather[0].icon.slice(0, 2));
        if (item.rain && item.rain['3h']) { previsoesDiarias[diaChave].chuva += item.rain['3h']; }
        previsoesDiarias[diaChave].vento_max = Math.max(previsoesDiarias[diaChave].vento_max, item.wind.speed);
        previsoesDiarias[diaChave].horarios.push({
            hora: data.getHours().toString().padStart(2, '0') + ':00',
            temp: item.main.temp,
            descricao: item.weather[0].description,
            icone: item.weather[0].icon
        });
    });
    return Object.values(previsoesDiarias);
}

function exibirPrevisaoTempo(previsoesDiariasProcessadas, numDiasParaExibir) {
    const cidade = previsoesCidadeCache ? previsoesCidadeCache[0].cidadeNome : "a cidade selecionada";
    if (!previsoesDiariasProcessadas || previsoesDiariasProcessadas.length === 0) {
        divPrevisaoContainer.innerHTML = `<p>Não foi possível obter a previsão para ${cidade}.</p>`;
        return;
    }

    const previsoesFiltradas = previsoesDiariasProcessadas.slice(0, numDiasParaExibir);
    let html = '';
    previsoesFiltradas.forEach((dia, index) => {
        const descricaoPrincipal = [...dia.descricoes].join(', ');
        const iconePrincipal = `${[...dia.icones][0]}d`;
        const classesDestaque = [];
        if ([...dia.descricoes].some(d => d.includes('chuva'))) classesDestaque.push('dia-chuvoso');
        if (dia.temp_min < 10) classesDestaque.push('dia-frio');
        if (dia.temp_max > 30) classesDestaque.push('dia-quente');
        if (dia.vento_max * 3.6 > 50) classesDestaque.push('dia-aviso-vento');

        let detalhesHtml = `<h5>Detalhes por horário:</h5><ul>`;
        dia.horarios.forEach(h => {
            detalhesHtml += `<li><strong>${h.hora}:</strong> ${h.temp.toFixed(1)}°C, ${h.descricao}</li>`;
        });
        detalhesHtml += `</ul>`;

        html += `
            <div class="previsao-dia-card ${classesDestaque.join(' ')}" onclick="toggleDetalhesDia(this)">
                <div class="sumario">
                    <div class="info-principal">
                        <img src="http://openweathermap.org/img/wn/${iconePrincipal}.png" alt="${descricaoPrincipal}">
                        <div>
                            <h4>${index === 0 ? 'Hoje' : formatarDataPrevisao(dia.data)}</h4>
                            <p>${descricaoPrincipal}</p>
                        </div>
                    </div>
                    <div class="temperaturas">
                        <p class="temp-max">${dia.temp_max.toFixed(1)}°C</p>
                        <p class="temp-min">${dia.temp_min.toFixed(1)}°C</p>
                    </div>
                </div>
                <div class="detalhes-horarios">${detalhesHtml}</div>
            </div>`;
    });

    divPrevisaoContainer.innerHTML = html;
}

function toggleDetalhesDia(cardElement) {
    const detalhes = cardElement.querySelector('.detalhes-horarios');
    if (detalhes) {
        detalhes.style.display = detalhes.style.display === 'block' ? 'none' : 'block';
    }
}


async function buscarDadosOpenWeatherMap(cidade) {
    if (!cidade) {
        if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = "<p style='color:orange; text-align:center;'>Por favor, digite o nome da cidade.</p>";
        return null;
    }

    if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = `<p style="text-align:center;">Buscando previsão para ${cidade}...</p>`;

    const backendUrl = 'https://carro-8fvo.onrender.com'; // MUDE AQUI SE SUA URL FOR DIFERENTE
    const urlApi = `${backendUrl}/api/previsao/${encodeURIComponent(cidade)}`;

    try {
        console.log(`[Frontend] Fazendo requisição para o backend na nuvem: ${urlApi}`);
        const response = await fetch(urlApi);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status} ao contatar o servidor.`);
        }

        const data = await response.json();
        console.log("[Frontend] Dados recebidos do backend na nuvem:", data);
        return data;

    } catch (error) {
        console.error("[Frontend] Erro ao buscar previsão no backend:", error);
        if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = `<p style='color:red; text-align:center;'>Falha ao buscar previsão: ${error.message}</p>`;
        return null;
    }
}


async function iniciarBuscaPrevisao() {
    const cidade = inputCidadeDestino.value.trim();
    if (!cidade) {
        alert("Por favor, digite o nome da cidade.");
        return;
    }

    const dadosApi = await buscarDadosOpenWeatherMap(cidade);
    if (dadosApi) {
        const previsoesProcessadas = processarDadosPrevisao(dadosApi);
        if (previsoesProcessadas) {
            // Adiciona o nome da cidade para uso posterior
            previsoesProcessadas.forEach(p => p.cidadeNome = dadosApi.city.name);
            previsoesCidadeCache = previsoesProcessadas;
            exibirPrevisaoTempo(previsoesCidadeCache, numDiasFiltroAtual);
        } else {
            if (divPrevisaoContainer) divPrevisaoContainer.innerHTML = "<p style='color:red; text-align:center;'>Não foi possível processar os dados da previsão.</p>";
        }
    }
}


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
                veiculoParaSelecionar = esportivos[esportivos.length - 1]; // Pega o último criado
            } else {
                alert("Nenhum Carro Esportivo criado. Crie um primeiro na seção 'Carro Esportivo'.");
                return;
            }
            break;
        case 'caminhao':
            const caminhoes = garagemDeVeiculos.filter(v => v instanceof Caminhao);
            if (caminhoes.length > 0) {
                veiculoParaSelecionar = caminhoes[caminhoes.length - 1]; // Pega o último criado
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
    }
}

function chamarInteragir(acao) {
    if (!veiculoSelecionado) {
        alert("Nenhum veículo selecionado para interagir!");
        return;
    }
    try {
        let metodo = veiculoSelecionado[acao];
        if (typeof metodo === 'function') {
            if (acao === 'carregar' || acao === 'descarregar') {
                const peso = parseInt(inputPesoInteracao.value);
                if (!isNaN(peso) && peso > 0) {
                    metodo.call(veiculoSelecionado, peso);
                } else {
                    alert(`Por favor, insira um peso válido para ${acao}.`);
                }
            } else {
                metodo.call(veiculoSelecionado);
            }
        } else {
            alert(`Ação '${acao}' não disponível para ${veiculoSelecionado.constructor.name}.`);
        }
    } catch (error) {
        console.error(`Erro ao executar a ação '${acao}' em ${veiculoSelecionado.constructor.name}:`, error);
        alert(`Ocorreu um erro ao tentar '${acao}'. Verifique o console.`);
    }
    atualizarExibicaoInformacoes();
    salvarGaragemNoLocalStorage();
}

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
        alert(`Erro no formulário: ${validacao.mensagem}`);
        return;
    }

    veiculoSelecionado.adicionarManutencao(novaManutencao);
    salvarGaragemNoLocalStorage();
    atualizarHistoricoEAgendamentosManutencao();

    // Limpa os campos do formulário
    manutencaoDataInput.value = "";
    flatpickr("#manutencaoData").clear(); // Limpa o flatpickr também
    manutencaoTipoInput.value = "";
    manutencaoCustoInput.value = "";
    manutencaoDescricaoInput.value = "";
    alert("Manutenção adicionada/agendada com sucesso!");
}

async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch('./dados_veiculos_api.json');
        if (!response.ok) {
            return null;
        }
        const todosVeiculosAPI = await response.json();
        return todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo) || null;
    } catch (error) {
        console.error("Falha ao buscar dados da API local de veículos:", error);
        return null;
    }
}


// --- EVENT LISTENERS E INICIALIZAÇÃO ---

document.getElementById("selectCarroBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('carro'));
document.getElementById("selectEsportivoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('esportivo'));
document.getElementById("selectCaminhaoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('caminhao'));

btnAdicionarManutencao.addEventListener("click", lidarComAdicaoManutencao);

btnBuscarDetalhes.addEventListener('click', async () => {
    if (!veiculoSelecionado || !veiculoSelecionado.apiId) {
        divDetalhesExtrasOutput.innerHTML = "Selecione um veículo para ver seus detalhes.";
        return;
    }
    divDetalhesExtrasOutput.innerHTML = `Buscando dados para ID: ${veiculoSelecionado.apiId}...`;
    const detalhes = await buscarDetalhesVeiculoAPI(veiculoSelecionado.apiId);
    if (detalhes) {
        let html = `<strong>Modelo Referência:</strong> ${detalhes.modeloReferencia}<br>
                    <strong>Valor FIPE:</strong> ${detalhes.valorFIPE}<br>
                    <strong>Última Revisão Oficial:</strong> ${detalhes.ultimaRevisao}<br>
                    <strong>Dica de Manutenção:</strong> ${detalhes.dicaManutencao}<br>`;
        if (detalhes.recallPendente) {
            html += `<strong style="color:red;">RECALL PENDENTE:</strong> ${detalhes.recallDescricao}`;
        } else {
            html += `<strong>Recalls:</strong> Nenhum recall pendente.`;
        }
        divDetalhesExtrasOutput.innerHTML = html;
    } else {
        divDetalhesExtrasOutput.innerHTML = "Não foram encontrados detalhes extras para este veículo.";
    }
});

if (btnBuscarPrevisao) {
    btnBuscarPrevisao.addEventListener("click", iniciarBuscaPrevisao);
}
if (inputCidadeDestino) {
    inputCidadeDestino.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            iniciarBuscaPrevisao();
        }
    });
}

// Event listener que executa quando o conteúdo do HTML é totalmente carregado
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Buscando veículos do backend...');
    carregarVeiculosDoBackend(); 

    // Seleciona o primeiro veículo da lista se nenhum estiver selecionado
    if (!veiculoSelecionado && garagemDeVeiculos.length > 0) {
        selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
    } else {
        atualizarExibicaoInformacoes();
    }

    // Inicializa o calendário se a biblioteca flatpickr estiver disponível
    if (typeof flatpickr !== "undefined") {
        flatpickr("#manutencaoData", {
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            locale: "pt" // Opcional: para traduzir para português, se o locale estiver carregado
        });
    }

    configurarFiltrosDeDias();
});
/**
 * [NOVA FUNÇÃO]
 * Busca todos os veículos do backend e atualiza a interface.
 * Substitui a necessidade de carregar do localStorage.
 */
async function carregarVeiculosDoBackend() {
    // IMPORTANTE: Certifique-se de que esta é a URL correta do seu backend no Render.
    const backendUrl = 'https://carro-8fvo.onrender.com'; 
    
    const listaVeiculosDiv = document.getElementById('outputCarro'); // Usando um div para mostrar a lista
    listaVeiculosDiv.innerHTML = '<p>Carregando veículos da garagem...</p>';

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.error || 'Não foi possível buscar os veículos.');
        }
        const veiculos = await response.json();
        
        let htmlLista = '<h4>Veículos na Garagem (Salvos no Banco de Dados):</h4><ul>';
        if (veiculos.length === 0) {
            htmlLista += '<li>Nenhum veículo encontrado na garagem. Adicione um!</li>';
        } else {
            veiculos.forEach(v => {
                // Monta uma string com os detalhes do veículo
                htmlLista += `<li><strong>Placa:</strong> ${v.placa} | <strong>Modelo:</strong> ${v.marca} ${v.modelo} | <strong>Ano:</strong> ${v.ano} | <strong>Cor:</strong> ${v.cor}</li>`;
            });
        }
        htmlLista += '</ul>';
        listaVeiculosDiv.innerHTML = htmlLista;

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        listaVeiculosDiv.innerHTML = `<p style="color:red;"><b>Erro ao carregar veículos:</b> ${error.message}</p>`;
    }
}

/**
 * [NOVA FUNÇÃO]
 * Envia dados para o endpoint de criação de veículo no backend.
 * Esta função será usada por `criarCarroEsportivo`, `criarCaminhao`, etc.
 */
async function criarVeiculo(dados) {
    // IMPORTANTE: Certifique-se de que esta é a URL correta do seu backend no Render.
    const backendUrl = 'https://carro-8fvo.onrender.com';
    
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });

        const resultado = await response.json();

        if (!response.ok) {
            // Se o servidor retornou um erro, ele virá no 'resultado.error'
            throw new Error(resultado.error || `Erro do servidor: ${response.status}`);
        }
        
        alert(`Veículo com placa ${resultado.placa} criado com sucesso!`);
        await carregarVeiculosDoBackend(); // ATUALIZA A LISTA NA TELA!

    } catch (error) {
        console.error('Falha ao criar veículo:', error);
        alert(`Erro ao criar veículo: ${error.message}`);
    }
}
