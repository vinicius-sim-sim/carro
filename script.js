// script.js

// --- Constantes e Variáveis Globais ---
let garagemDeVeiculos = []; // Array para armazenar todos os veículos INSTANCIADOS
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
// FUNÇÕES DE GERENCIAMENTO DE ESTADO (AGORA VINDAS DO BACKEND)
// ===================================================================

/**
 * Busca todos os veículos do backend, recria as instâncias de classe
 * e atualiza a garagem local e a UI.
 */
async function carregarVeiculosDoBackend() {
    const backendUrl = 'https://carro-8fvo.onrender.com';
    
    garagemDeVeiculos = []; 
    divInformacoesVeiculo.innerHTML = '<p>Carregando veículos da garagem...</p>';

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`);
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.error || 'Não foi possível buscar os veículos.');
        }
        const veiculosDoDb = await response.json();
        
        // Converte o JSON do DB em instâncias de classes
        garagemDeVeiculos = veiculosDoDb.map(veiculoJson => {
            switch (veiculoJson.tipoVeiculo) {
                case 'Carro':
                    // É crucial que as classes tenham o método fromJSON correto
                    return Carro.fromJSON(veiculoJson); 
                case 'CarroEsportivo':
                    return CarroEsportivo.fromJSON(veiculoJson);
                case 'Caminhao':
                    return Caminhao.fromJSON(veiculoJson);
                default:
                    console.warn("Tipo de veículo desconhecido do DB:", veiculoJson);
                    return null;
            }
        }).filter(v => v !== null); // Remove qualquer resultado nulo

        console.log("Garagem carregada e instanciada a partir do DB:", garagemDeVeiculos);
        
        // Se nenhum veículo estiver selecionado, seleciona o primeiro da lista
        if (!veiculoSelecionado && garagemDeVeiculos.length > 0) {
            selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
        } else {
             atualizarExibicaoGeral();
        }

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        divInformacoesVeiculo.innerHTML = `<p style="color:red;"><b>Erro ao carregar veículos:</b> ${error.message}</p>`;
        atualizarExibicaoGeral(); // Limpa as outras seções mesmo em caso de erro
    }
}

/**
 * Envia dados para o endpoint de criação de veículo no backend.
 */
async function criarVeiculo(dados) {
    const backendUrl = 'https://carro-8fvo.onrender.com';
    
    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        const resultado = await response.json();
        if (!response.ok) {
            throw new Error(resultado.error || `Erro do servidor: ${response.status}`);
        }
        
        alert(`Veículo com placa ${resultado.placa} criado com sucesso!`);
        await carregarVeiculosDoBackend(); // RECARREGA TUDO DO BANCO PARA ATUALIZAR!

    } catch (error)
        {
        console.error('Falha ao criar veículo:', error);
        alert(`Erro ao criar veículo: ${error.message}`);
    }
}

/**
 * Atualiza todas as exibições da UI com base no estado atual da 'garagemDeVeiculos'.
 */
function atualizarExibicaoGeral() {
    // Exibição do veículo selecionado
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        secaoManutencaoVeiculo.style.display = 'block';
        nomeVeiculoManutencao.textContent = `${veiculoSelecionado.marca} ${veiculoSelecionado.modelo}`;
        atualizarHistoricoEAgendamentosManutencao();
    } else {
        divInformacoesVeiculo.textContent = "Nenhum veículo selecionado. Crie ou selecione um.";
        secaoManutencaoVeiculo.style.display = 'none';
        divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.';
    }

    // Atualiza as seções individuais de cada tipo de veículo
    const carrosPadrao = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro');
    outputCarro.innerHTML = carrosPadrao.length > 0 
        ? `<ul>${carrosPadrao.map(c => `<li>${c.exibirInformacoes()}</li>`).join('')}</ul>`
        : "Nenhum Carro Padrão na garagem.";

    const esportivos = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo');
    outputEsportivo.innerHTML = esportivos.length > 0
        ? `<ul>${esportivos.map(e => `<li>${e.exibirInformacoes()}</li>`).join('')}</ul>`
        : "Nenhum Carro Esportivo na garagem.";

    const caminhoes = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao');
    outputCaminhao.innerHTML = caminhoes.length > 0
        ? `<ul>${caminhoes.map(c => `<li>${c.exibirInformacoes()}</li>`).join('')}</ul>`
        : "Nenhum Caminhão na garagem.";
}

// --- Funções `criar...` que preparam os dados para `criarVeiculo` ---

function criarCarroEsportivo() {
    const placa = prompt("Digite a PLACA do carro esportivo (ex: ESP0RT3):");
    if (!placa) return alert("Criação cancelada.");

    criarVeiculo({
        placa: placa,
        marca: document.getElementById("modeloEsportivo").value || "Toyota",
        modelo: "GR Corolla",
        ano: new Date().getFullYear(),
        cor: document.getElementById("corEsportivo").value || "Preto",
        tipoVeiculo: "CarroEsportivo", // Define o tipo para o DB
        apiId: "esportivo-corolla-01"
    });
}

function criarCaminhao() {
    const placa = prompt("Digite a PLACA do caminhão (ex: CAM1NH40):");
    if (!placa) return alert("Criação cancelada.");

    criarVeiculo({
        placa: placa,
        marca: document.getElementById("modeloCaminhao").value || "Volvo",
        modelo: "FH",
        ano: new Date().getFullYear() - 2,
        cor: document.getElementById("corCaminhao").value || "Vermelho",
        capacidadeCarga: parseInt(document.getElementById("capacidadeCaminhao").value) || 10000,
        tipoVeiculo: "Caminhao", // Define o tipo para o DB
        apiId: "caminhao-volvo-01"
    });
}

// --- Funções de Seleção ---

function selecionarVeiculoPorTipoOuCriar(tipo) {
    let veiculosDoTipo = [];
    switch (tipo) {
        case 'carro':
            veiculosDoTipo = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro');
            break;
        case 'esportivo':
            veiculosDoTipo = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo');
            break;
        case 'caminhao':
            veiculosDoTipo = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao');
            break;
    }

    if (veiculosDoTipo.length > 0) {
        selecionarVeiculoPorInstancia(veiculosDoTipo[veiculosDoTipo.length - 1]); // Pega o último adicionado
    } else {
        alert(`Nenhum veículo do tipo '${tipo}' na garagem. Crie um primeiro!`);
    }
}

function selecionarVeiculoPorInstancia(instanciaVeiculo) {
    veiculoSelecionado = instanciaVeiculo;
    console.log("Veículo selecionado:", veiculoSelecionado);
    atualizarExibicaoGeral();
}

// --- Funções de Interação ---

function chamarInteragir(acao) {
    if (!veiculoSelecionado) {
        alert("Nenhum veículo selecionado para interagir!");
        return;
    }
    try {
        let metodo = veiculoSelecionado[acao];
        if (typeof metodo === 'function') {
            if (acao === 'carregar' || acao === 'descarregar') {
                const peso = parseInt(inputPesoInteracao.value, 10);
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
        console.error(`Erro ao executar a ação '${acao}':`, error);
        alert(`Ocorreu um erro: ${error.message}`);
    }
    // NOTA: O estado (ligado, velocidade) só é atualizado na tela.
    // Para persistir, seria necessário salvar no DB a cada ação.
    atualizarExibicaoGeral(); 
}

// --- Funções de Manutenção (Lógica do Frontend) ---
// (Estas funções permanecem as mesmas, pois a manutenção ainda não está no DB)

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
    // NOTA: Isto não salva no DB. É apenas local.
    atualizarHistoricoEAgendamentosManutencao();

    manutencaoDataInput.value = "";
    if (typeof flatpickr !== "undefined") { flatpickr("#manutencaoData").clear(); }
    manutencaoTipoInput.value = "";
    manutencaoCustoInput.value = "";
    manutencaoDescricaoInput.value = "";
    alert("Manutenção adicionada/agendada com sucesso (localmente)!");
}


function atualizarHistoricoEAgendamentosManutencao() {
    if (!veiculoSelecionado) return;

    const agora = new Date();
    agora.setHours(0, 0, 0, 0);

    const historico = [];
    const agendamentos = [];

    (veiculoSelecionado.historicoManutencao || []).forEach(manutencao => {
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

    historico.sort((a, b) => new Date(b.data.split('/').reverse().join('-')) - new Date(a.data.split('/').reverse().join('-')));
    agendamentos.sort((a, b) => new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-')));

    divHistoricoManutencao.innerHTML = historico.length > 0 ? `<ul>${historico.map(m => `<li>${m.formatarManutencao()}</li>`).join('')}</ul>` : "Nenhum histórico.";
    divAgendamentosFuturos.innerHTML = agendamentos.length > 0 ? `<ul>${agendamentos.map(m => `<li>${m.formatarManutencao()}</li>`).join('')}</ul>` : "Nenhum agendamento futuro.";
}


// --- Funções de Detalhes Extras (API) ---
// (Nenhuma mudança necessária aqui)
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch('./dados_veiculos_api.json');
        if (!response.ok) return null;
        const todosVeiculosAPI = await response.json();
        return todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo) || null;
    } catch (error) {
        console.error("Falha ao buscar dados da API local de veículos:", error);
        return null;
    }
}


// --- Funções de Previsão do Tempo ---
// (Nenhuma mudança necessária aqui, elas são independentes)
// ... (COLE AQUI TODAS AS SUAS FUNÇÕES DE PREVISÃO DO TEMPO, DESDE `formatarDataPrevisao` ATÉ `configurarFiltrosDeDias`)

// ===================================================================
// FUNÇÕES DE PREVISÃO DO TEMPO PARA VIAGEM
// ===================================================================

function formatarDataPrevisao(dataObj) {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return `${diasSemana[dataObj.getDay()]} ${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth() + 1).toString().padStart(2, '0')}`;
}

function processarDadosPrevisao(dadosApi) {
    if (!dadosApi || !dadosApi.list) return null;
    const previsoesDiarias = {};
    dadosApi.list.forEach(item => {
        const data = new Date(item.dt * 1000);
        const diaChave = data.toISOString().split('T')[0];

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

    const backendUrl = 'https://carro-8fvo.onrender.com';
    const urlApi = `${backendUrl}/api/previsao/${encodeURIComponent(cidade)}`;

    try {
        const response = await fetch(urlApi);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status} ao contatar o servidor.`);
        }
        const data = await response.json();
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

if (btnBuscarPrevisao) btnBuscarPrevisao.addEventListener("click", iniciarBuscaPrevisao);
if (inputCidadeDestino) {
    inputCidadeDestino.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            iniciarBuscaPrevisao();
        }
    });
}

// Event listener principal que inicia a aplicação
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Buscando veículos do backend...');
    carregarVeiculosDoBackend(); 

    if (typeof flatpickr !== "undefined") {
        flatpickr("#manutencaoData", {
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "d/m/Y",
            locale: "pt"
        });
    }

    configurarFiltrosDeDias();
});

// PS: Lembre-se de colar suas funções de previsão do tempo onde indicado.
// Se elas já estiverem no código que você vai colar, não precisa fazer nada.