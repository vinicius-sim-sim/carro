// script.js

// --- [MELHORIA] Centralizar a URL do Backend ---
// Use esta URL para o servidor no ar.
const BACKEND_URL = 'https://carro-8fvo.onrender.com'; // ESTA DEVE SER A URL DO SEU BACKEND DEPLOYADO!
// Para testar localmente, comente a linha acima e descomente a linha abaixo:
// const BACKEND_URL = 'http://localhost:3001';

// DEBUG: Confirma qual URL do backend está sendo usada
console.log(`[FRONTEND DEBUG] BACKEND_URL configurada para: ${BACKEND_URL}`);


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

// --- Elementos do DOM para o NOVO formulário de manutenção ---
const manutencaoDataInput = document.getElementById("manutencaoData");
const manutencaoDescricaoInput = document.getElementById("manutencaoDescricao");
const manutencaoCustoInput = document.getElementById("manutencaoCusto");
const manutencaoQuilometragemInput = document.getElementById("manutencaoQuilometragem");


// ===================================================================
// FUNÇÕES DE GERENCIAMENTO DE ESTADO (VINDAS DO BACKEND)
// ===================================================================

async function carregarVeiculosDoBackend() {
    garagemDeVeiculos = [];
    divInformacoesVeiculo.innerHTML = '<p>Carregando veículos da garagem...</p>';

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`);
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.error || `Erro ao buscar veículos: ${response.status} ${response.statusText}`);
        }
        const veiculosDoDb = await response.json();

        garagemDeVeiculos = veiculosDoDb.map(veiculoJson => {
            switch (veiculoJson.tipoVeiculo) {
                case 'Carro':
                    return Carro.fromJSON(veiculoJson);
                case 'CarroEsportivo':
                    return CarroEsportivo.fromJSON(veiculoJson);
                case 'Caminhao':
                    return Caminhao.fromJSON(veiculoJson);
                default:
                    console.warn("[FRONTEND WARN] Tipo de veículo desconhecido do DB:", veiculoJson);
                    return null;
            }
        }).filter(v => v !== null);

        console.log("[FRONTEND DEBUG] Garagem carregada e instanciada a partir do DB:", garagemDeVeiculos);

        if (!veiculoSelecionado && garagemDeVeiculos.length > 0) {
            selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
        } else if (veiculoSelecionado) {
            // Se já havia um veículo selecionado, tentar re-selecioná-lo para atualizar estado
            const reSelected = garagemDeVeiculos.find(v => v._id === veiculoSelecionado._id);
            if (reSelected) {
                selecionarVeiculoPorInstancia(reSelected);
            } else {
                // Se o veículo selecionado anterior não existe mais, selecionar o primeiro
                selecionarVeiculoPorInstancia(garagemDeVeiculos[0]);
            }
        } else {
            atualizarExibicaoGeral();
        }

    } catch (error) {
        console.error("[FRONTEND ERROR] Erro ao carregar veículos:", error);
        divInformacoesVeiculo.innerHTML = `<p style="color:red;"><b>Erro ao carregar veículos:</b> ${error.message}</p>`;
        atualizarExibicaoGeral();
    }
}

async function criarVeiculo(dados) {
    try {
        console.log("[FRONTEND DEBUG] Enviando dados para criar veículo:", dados);
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados),
        });

        const resultado = await response.json();
        if (!response.ok) {
            throw new Error(resultado.error || `Erro do servidor: ${response.status} ${response.statusText}`);
        }

        alert(`Veículo com placa ${resultado.placa} criado com sucesso!`);
        await carregarVeiculosDoBackend(); // Recarrega para ver o novo veículo
        selecionarVeiculoPorInstancia(garagemDeVeiculos.find(v => v._id === resultado._id)); // Seleciona o recém-criado

    } catch (error) {
        console.error('[FRONTEND ERROR] Falha ao criar veículo:', error);
        alert(`Erro ao criar veículo: ${error.message}`);
    }
}

function atualizarExibicaoGeral() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        secaoManutencaoVeiculo.style.display = 'block';
        nomeVeiculoManutencao.textContent = `${veiculoSelecionado.marca} ${veiculoSelecionado.modelo}`;
        // Chamada crucial para carregar as manutenções do veículo selecionado
        console.log(`[FRONTEND DEBUG] Carregando manutenções para o veículo ID: ${veiculoSelecionado._id}`);
        carregarManutencoes(veiculoSelecionado._id);
    } else {
        divInformacoesVeiculo.textContent = "Nenhum veículo selecionado. Crie ou selecione um.";
        secaoManutencaoVeiculo.style.display = 'none';
        divDetalhesExtrasOutput.innerHTML = 'Clique em "Ver Detalhes Extras" após selecionar um veículo.';
    }

    const carrosPadrao = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro');
    outputCarro.innerHTML = carrosPadrao.length > 0 ?
        `<ul>${carrosPadrao.map(c => `<li>${c.exibirInformacoes()} <button onclick="selecionarVeiculoPorInstancia(garagemDeVeiculos.find(v => v._id === '${c._id}'))">Selecionar</button></li>`).join('')}</ul>` :
        "Nenhum Carro Padrão na garagem.";

    const esportivos = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo');
    outputEsportivo.innerHTML = esportivos.length > 0 ?
        `<ul>${esportivos.map(e => `<li>${e.exibirInformacoes()} <button onclick="selecionarVeiculoPorInstancia(garagemDeVeiculos.find(v => v._id === '${e._id}'))">Selecionar</button></li>`).join('')}</ul>` :
        "Nenhum Carro Esportivo na garagem.";

    const caminhoes = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao');
    outputCaminhao.innerHTML = caminhoes.length > 0 ?
        `<ul>${caminhoes.map(c => `<li>${c.exibirInformacoes()} <button onclick="selecionarVeiculoPorInstancia(garagemDeVeiculos.find(v => v._id === '${c._id}'))">Selecionar</button></li>`).join('')}</ul>` :
        "Nenhum Caminhão na garagem.";
}

// --- Funções `criar...` ---

function criarCarroEsportivo() {
    const placa = prompt("Digite a PLACA do carro esportivo (ex: ESP0RT3):");
    if (!placa) return alert("Criação cancelada.");

    criarVeiculo({
        placa: placa,
        marca: document.getElementById("modeloEsportivo").value || "Toyota",
        modelo: "GR Corolla", // Ajustado para ser mais específico
        ano: new Date().getFullYear(),
        cor: document.getElementById("corEsportivo").value || "Preto",
        tipoVeiculo: "CarroEsportivo",
        apiId: "esportivo-corolla-01" // Mantido como exemplo
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
        tipoVeiculo: "Caminhao",
        apiId: "caminhao-volvo-01" // Mantido como exemplo
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
        selecionarVeiculoPorInstancia(veiculosDoTipo[veiculosDoTipo.length - 1]); // Seleciona o mais recente
    } else {
        alert(`Nenhum veículo do tipo '${tipo}' na garagem. Crie um primeiro ou use o botão específico!`);
    }
}

function selecionarVeiculoPorInstancia(instanciaVeiculo) {
    veiculoSelecionado = instanciaVeiculo;
    console.log("[FRONTEND DEBUG] Veículo selecionado:", veiculoSelecionado);
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
        console.error(`[FRONTEND ERROR] Erro ao executar a ação '${acao}':`, error);
        alert(`Ocorreu um erro: ${error.message}`);
    }
    atualizarExibicaoGeral(); // Atualiza a exibição após qualquer interação
}

// ------------------- [NOVAS] FUNÇÕES DE MANUTENÇÃO (COM API) -------------------

/**
 * Carrega e exibe as manutenções de um veículo específico a partir do backend.
 * @param {string} veiculoId - O ID do veículo no MongoDB.
 */
async function carregarManutencoes(veiculoId) {
    if (!veiculoId) {
        divHistoricoManutencao.innerHTML = "<p>ID do veículo não disponível para carregar manutenções.</p>";
        console.warn("[FRONTEND WARN] carregarManutencoes: veiculoId é nulo ou indefinido.");
        return;
    }

    divHistoricoManutencao.innerHTML = "Buscando histórico de manutenções...";

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/manutencoes`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Falha ao buscar manutenções: ${response.status} ${response.statusText}`);
        }
        const manutencoes = await response.json();
        console.log(`[FRONTEND DEBUG] Manutenções carregadas para o veículo ${veiculoId}:`, manutencoes);

        if (manutencoes.length === 0) {
            divHistoricoManutencao.innerHTML = "Nenhum histórico de manutenção encontrado para este veículo.";
            return;
        }

        const html = `<ul>${manutencoes.map(m => {
            // Garante que 'm.data' seja um formato de data válido para Date()
            const dataObj = new Date(m.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR', {timeZone: 'UTC'}); // Assegura formato brasileiro
            return `<li>
                <strong>${dataFormatada}</strong>: ${m.descricaoServico} - R$${parseFloat(m.custo).toFixed(2)}
                ${m.quilometragem ? `(${m.quilometragem} km)` : ''}
            </li>`;
        }).join('')}</ul>`;

        divHistoricoManutencao.innerHTML = html;

    } catch (error) {
        console.error("[FRONTEND ERROR] Erro ao carregar manutenções:", error);
        divHistoricoManutencao.innerHTML = `<p style="color:red;">Erro ao carregar o histórico: ${error.message}</p>`;
    }
}


/**
 * Pega os dados do formulário e envia para a API para criar uma nova manutenção.
 */
async function adicionarManutencao() {
    if (!veiculoSelecionado || !veiculoSelecionado._id) {
        alert("Selecione um veículo para adicionar uma manutenção.");
        console.warn("[FRONTEND WARN] Tentativa de adicionar manutenção sem veículo selecionado ou ID.");
        return;
    }

    const dadosFormulario = {
        data: manutencaoDataInput.value,
        descricaoServico: manutencaoDescricaoInput.value.trim(),
        custo: parseFloat(manutencaoCustoInput.value),
        // Adiciona quilometragem apenas se o valor for preenchido e for um número válido
        quilometragem: manutencaoQuilometragemInput.value ? parseInt(manutencaoQuilometragemInput.value) : undefined
    };

    // Validação básica no frontend antes de enviar
    if (!dadosFormulario.data || dadosFormulario.descricaoServico === "" || isNaN(dadosFormulario.custo) || dadosFormulario.custo < 0) {
        alert("Por favor, preencha a Data, a Descrição do Serviço e um Custo válido (não negativo).");
        return;
    }

    const veiculoId = veiculoSelecionado._id;
    console.log("[FRONTEND DEBUG] Enviando nova manutenção para veículo:", veiculoId, "com dados:", dadosFormulario);

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/manutencoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosFormulario),
        });

        const resultado = await response.json();
        if (!response.ok) {
            throw new Error(resultado.error || `Erro do servidor ao adicionar manutenção: ${response.status} ${response.statusText}`);
        }

        alert("Manutenção adicionada com sucesso!");

        // Limpa os campos do formulário
        manutencaoDataInput.value = "";
        manutencaoDescricaoInput.value = "";
        manutencaoCustoInput.value = "";
        manutencaoQuilometragemInput.value = "";

        await carregarManutencoes(veiculoId); // Recarrega o histórico após adicionar
    } catch (error) {
        console.error('[FRONTEND ERROR] Falha ao adicionar manutenção:', error);
        alert(`Erro ao salvar manutenção: ${error.message}`);
    }
}


// --- Funções de Detalhes Extras (API) ---
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) {
    try {
        const response = await fetch('./dados_veiculos_api.json');
        if (!response.ok) {
            console.error(`[FRONTEND ERROR] Falha ao carregar dados_veiculos_api.json: ${response.status}`);
            return null;
        }
        const todosVeiculosAPI = await response.json();
        const detalhes = todosVeiculosAPI.find(veiculo => veiculo.id === identificadorVeiculo);
        console.log(`[FRONTEND DEBUG] Detalhes API local para ${identificadorVeiculo}:`, detalhes);
        return detalhes || null;
    } catch (error) {
        console.error("[FRONTEND ERROR] Falha ao buscar dados da API local de veículos:", error);
        return null;
    }
}


// --- Funções de Previsão do Tempo ---
function formatarDataPrevisao(dataObj) {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return `${diasSemana[dataObj.getDay()]} ${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth() + 1).toString().padStart(2, '0')}`;
}

function processarDadosPrevisao(dadosApi) {
    if (!dadosApi || !dadosApi.list) {
        console.warn("[FRONTEND WARN] processarDadosPrevisao: dadosApi ou dadosApi.list são nulos/indefinidos.");
        return null;
    }
    const previsoesDiarias = {};
    dadosApi.list.forEach(item => {
        const data = new Date(item.dt * 1000);
        // Garante que a chave do dia seja baseada na data local, ou GMT para consistência
        const diaChave = data.toISOString().split('T')[0];

        if (!previsoesDiarias[diaChave]) {
            previsoesDiarias[diaChave] = {
                data: data,
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                descricoes: new Set(),
                icones: new Set(),
                horarios: []
            };
        }
        previsoesDiarias[diaChave].temp_min = Math.min(previsoesDiarias[diaChave].temp_min, item.main.temp_min);
        previsoesDiarias[diaChave].temp_max = Math.max(previsoesDiarias[diaChave].temp_max, item.main.temp_max);
        previsoesDiarias[diaChave].descricoes.add(item.weather[0].description);
        previsoesDiarias[diaChave].icones.add(item.weather[0].icon.slice(0, 2));
        previsoesDiarias[diaChave].horarios.push({
            hora: data.getHours().toString().padStart(2, '0') + ':00',
            temp: item.main.temp,
            descricao: item.weather[0].description,
            icone: item.weather[0].icon
        });
    });
    // Converte Set para Array para facilitar a exibição
    Object.values(previsoesDiarias).forEach(dia => {
        dia.descricoes = Array.from(dia.descricoes);
        dia.icones = Array.from(dia.icones);
    });
    return Object.values(previsoesDiarias);
}

function exibirPrevisaoTempo(previsoesDiariasProcessadas, numDiasParaExibir) {
    const cidade = previsoesCidadeCache && previsoesCidadeCache.length > 0 ? previsoesCidadeCache[0].cidadeNome : "a cidade selecionada";
    if (!previsoesDiariasProcessadas || previsoesDiariasProcessadas.length === 0) {
        divPrevisaoContainer.innerHTML = `<p>Não foi possível obter a previsão para ${cidade}.</p>`;
        return;
    }

    const previsoesFiltradas = previsoesDiariasProcessadas.slice(0, numDiasParaExibir);
    let html = '';
    previsoesFiltradas.forEach((dia, index) => {
        const descricaoPrincipal = dia.descricoes.join(', ');
        const iconePrincipal = `${dia.icones[0]}d`; // Pega o primeiro ícone, adiciona 'd' para dia
        let detalhesHtml = `<h5>Detalhes por horário:</h5><ul>`;
        dia.horarios.forEach(h => {
            detalhesHtml += `<li><strong>${h.hora}:</strong> ${h.temp.toFixed(1)}°C, ${h.descricao} <img src="http://openweathermap.org/img/wn/${h.icone}.png" alt="${h.descricao}" style="width:25px; height:25px; vertical-align: middle;"></li>`;
        });
        detalhesHtml += `</ul>`;

        html += `
            <div class="previsao-dia-card" onclick="toggleDetalhesDia(this)">
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
                <div class="detalhes-horarios" style="display: none;">${detalhesHtml}</div> <!-- Detalhes ocultos por padrão -->
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

    const urlApi = `${BACKEND_URL}/api/previsao/${encodeURIComponent(cidade)}`;
    console.log(`[FRONTEND DEBUG] Chamando API de previsão em: ${urlApi}`);
    try {
        const response = await fetch(urlApi);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erro ${response.status} ao contatar o servidor.`);
        }
        const data = await response.json();
        console.log(`[FRONTEND DEBUG] Resposta da API de previsão para ${cidade}:`, data);
        return data;
    } catch (error) {
        console.error("[FRONTEND ERROR] Erro ao buscar previsão no backend:", error);
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

// Adiciona botões de seleção individual para cada veículo listado
document.getElementById("selectCarroBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('carro'));
document.getElementById("selectEsportivoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('esportivo'));
document.getElementById("selectCaminhaoBtn").addEventListener("click", () => selecionarVeiculoPorTipoOuCriar('caminhao'));
btnAdicionarManutencao.addEventListener("click", adicionarManutencao); // <-- ATUALIZADO

btnBuscarDetalhes.addEventListener('click', async () => {
    if (!veiculoSelecionado || !veiculoSelecionado.apiId) {
        divDetalhesExtrasOutput.innerHTML = "Selecione um veículo para ver seus detalhes.";
        console.warn("[FRONTEND WARN] Tentativa de buscar detalhes extras sem veículo selecionado ou apiId.");
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

window.addEventListener('DOMContentLoaded', () => {
    console.log('[FRONTEND INFO] DOM carregado. Buscando veículos do backend...');
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