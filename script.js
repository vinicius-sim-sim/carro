// script.js (VERSÃO FINAL COMPLETA - SUBSTITUA TODO O ARQUIVO)

// --- URL DO BACKEND ---
const BACKEND_URL = 'https://carro-8fvo.onrender.com';
// const BACKEND_URL = 'http://localhost:3001';

// --- Variáveis Globais ---
let garagemDeVeiculos = [];
let veiculoSelecionado = null;

// --- Elementos do DOM ---
const authContainer = document.getElementById('authContainer');
const garageContainer = document.getElementById('garageContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const divInformacoesVeiculo = document.getElementById("informacoesVeiculo");
const outputCarro = document.getElementById("outputCarro");
const outputEsportivo = document.getElementById("outputEsportivo");
const outputCaminhao = document.getElementById("outputCaminhao");
const userEmailSpan = document.getElementById('userEmailSpan');
// Novos elementos para Manutenção
const secaoManutencao = document.getElementById('secaoManutencao');
const historicoManutencaoOutput = document.getElementById('historicoManutencaoOutput');
const adicionarManutencaoBtn = document.getElementById('adicionarManutencaoBtn');


// ===================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ===================================================================

function updateUIForAuthState() {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (token && userEmail) {
        authContainer.style.display = 'none';
        garageContainer.style.display = 'block';
        userEmailSpan.textContent = `Logado como: ${userEmail}`;
        carregarVeiculosDoBackend();
    } else {
        authContainer.style.display = 'block';
        garageContainer.style.display = 'none';
        garagemDeVeiculos = [];
        veiculoSelecionado = null;
        atualizarExibicaoGeral();
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) return alert("Por favor, preencha e-mail e senha.");
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro desconhecido');
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        updateUIForAuthState();
    } catch (error) {
        alert(`Erro de Login: ${error.message}`);
    }
}

async function handleRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    if (!email || !password) return alert("Por favor, preencha e-mail e senha.");
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Erro desconhecido');
        alert(data.message);
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    } catch (error) {
        alert(`Erro de Registro: ${error.message}`);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    updateUIForAuthState();
}

// ===================================================================
// FUNÇÕES DE GERENCIAMENTO (VEÍCULOS E MANUTENÇÃO)
// ===================================================================

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        handleLogout();
        return null;
    }
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

async function carregarVeiculosDoBackend() {
    const headers = getAuthHeaders();
    if (!headers) return;

    divInformacoesVeiculo.innerHTML = '<p>Carregando veículos...</p>';
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, { headers });
        if (response.status === 401) {
            alert("Sessão expirada.");
            return handleLogout();
        }
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        
        const veiculosDoDb = await response.json();
        garagemDeVeiculos = veiculosDoDb.map(json => {
            let veiculo;
            switch (json.tipoVeiculo) {
                case 'Carro': veiculo = Carro.fromJSON(json); break;
                case 'CarroEsportivo': veiculo = CarroEsportivo.fromJSON(json); break;
                case 'Caminhao': veiculo = Caminhao.fromJSON(json); break;
                default: return null;
            }
            if (veiculo) veiculo.owner = json.owner; // CORREÇÃO APLICADA
            return veiculo;
        }).filter(v => v);

        veiculoSelecionado = garagemDeVeiculos.length > 0 ? garagemDeVeiculos[0] : null;
        atualizarExibicaoGeral();

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        divInformacoesVeiculo.innerHTML = `<p style="color:red;"><b>Erro ao carregar garagem:</b> ${error.message}</p>`;
    }
}

async function criarVeiculo(dados) {
    const headers = getAuthHeaders();
    if (!headers) return;
    if (!dados.placa || dados.placa.trim() === "") return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, {
            method: 'POST', headers, body: JSON.stringify(dados),
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || "Erro ao criar veículo");
        alert(`Veículo ${resultado.placa} criado!`);
        await carregarVeiculosDoBackend();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

function atualizarExibicaoGeral() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        secaoManutencao.style.display = 'block'; // Mostra a seção de manutenção
        carregarEExibirManutencoes(veiculoSelecionado._id); // Carrega os dados
    } else {
        divInformacoesVeiculo.textContent = garagemDeVeiculos.length > 0 ? "Selecione um veículo." : "Sua garagem está vazia.";
        secaoManutencao.style.display = 'none'; // Esconde a seção
    }

    const loggedInUserEmail = localStorage.getItem('userEmail');
    const gerarHtmlVeiculo = (v) => {
        const isOwner = v.owner && v.owner.email === loggedInUserEmail;
        const shareButton = isOwner ? `<button onclick="compartilharVeiculo('${v._id}')">Compartilhar</button>` : '';
        const sharedLabel = !isOwner ? `<span style="font-size: 0.8em; color: #555;"> (Compartilhado por ${v.owner?.email || 'desconhecido'})</span>` : '';
        return `<li>${v.exibirInformacoes()} ${sharedLabel}<button onclick="selecionarVeiculoPorId('${v._id}')">Selecionar</button>${shareButton}</li>`;
    };

    const carrosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro').map(gerarHtmlVeiculo).join('');
    outputCarro.innerHTML = carrosHTML ? `<ul>${carrosHTML}</ul>` : "Nenhum Carro Padrão na garagem.";

    const esportivosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo').map(gerarHtmlVeiculo).join('');
    outputEsportivo.innerHTML = esportivosHTML ? `<ul>${esportivosHTML}</ul>` : "Nenhum Carro Esportivo na garagem.";

    const caminhoesHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao').map(gerarHtmlVeiculo).join('');
    outputCaminhao.innerHTML = caminhoesHTML ? `<ul>${caminhoesHTML}</ul>` : "Nenhum Caminhão na garagem.";
}

function selecionarVeiculoPorId(id) {
    const veiculo = garagemDeVeiculos.find(v => v._id === id);
    if (veiculo) {
        veiculoSelecionado = veiculo;
        atualizarExibicaoGeral();
    }
}

function chamarInteragir(acao) {
    if (!veiculoSelecionado) return alert("Selecione um veículo.");
    try {
        if (typeof veiculoSelecionado[acao] === 'function') {
            if (['carregar', 'descarregar'].includes(acao)) {
                const peso = parseInt(document.getElementById("pesoInteracao").value, 10);
                if (isNaN(peso) || peso <= 0) return alert("Por favor, insira um peso válido.");
                veiculoSelecionado[acao](peso);
            } else {
                veiculoSelecionado[acao]();
            }
            divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        } else {
             alert(`Ação '${acao}' não é válida para este tipo de veículo.`);
        }
    } catch (error) {
        console.error(`Erro na ação '${acao}':`, error);
        alert(`Ocorreu um erro: ${error.message}`);
    }
}

function criarCarroEsportivo() {
    const placa = prompt("Digite a PLACA do carro esportivo:");
    if (placa) criarVeiculo({ placa, tipoVeiculo: "CarroEsportivo", marca: "Toyota", modelo: "GR Corolla", ano: 2023, cor: "Preto", apiId: "esportivo-corolla-01"});
}

function criarCaminhao() {
    const placa = prompt("Digite a PLACA do caminhão:");
    if (placa) criarVeiculo({ placa, tipoVeiculo: "Caminhao", marca: "Volvo", modelo: "FH", ano: 2022, cor: "Vermelho", capacidadeCarga: 10000, apiId: "caminhao-volvo-01"});
}

async function compartilharVeiculo(veiculoId) {
    const headers = getAuthHeaders();
    if (!headers) return;
    const email = prompt("Digite o e-mail do usuário com quem você deseja compartilhar este veículo:");
    if (!email || email.trim() === "") return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/share`, {
            method: 'POST', headers, body: JSON.stringify({ email }),
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error);
        alert(resultado.message);
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

// ===================================================================
// [NOVO] FUNÇÕES DE MANUTENÇÃO
// ===================================================================
async function carregarEExibirManutencoes(veiculoId) {
    const headers = getAuthHeaders();
    if (!headers) return;
    historicoManutencaoOutput.innerHTML = 'Carregando histórico...';
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/manutencoes`, { headers });
        if (!response.ok) {
            // Se o erro for 'não autorizado', pode ser um veículo compartilhado
            if (response.status === 403 || response.status === 404) {
                 historicoManutencaoOutput.innerHTML = 'Você não tem permissão para ver as manutenções deste veículo compartilhado.';
                 adicionarManutencaoBtn.style.display = 'none'; // Esconde o botão de adicionar
                 return;
            }
            throw new Error('Falha ao buscar manutenções.');
        }

        adicionarManutencaoBtn.style.display = 'inline-block'; // Mostra o botão
        const manutencoes = await response.json();

        if (manutencoes.length === 0) {
            historicoManutencaoOutput.innerHTML = 'Nenhuma manutenção registrada.';
            return;
        }

        const manutencoesHTML = manutencoes.map(m => {
            const dataFmt = new Date(m.data).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
            return `<li><strong>${m.descricaoServico}</strong> em ${dataFmt} - Custo: R$${(m.custo || 0).toFixed(2)}</li>`;
        }).join('');
        historicoManutencaoOutput.innerHTML = `<ul>${manutencoesHTML}</ul>`;

    } catch (error) {
        historicoManutencaoOutput.innerHTML = `<span style="color:red;">${error.message}</span>`;
    }
}

async function adicionarManutencao() {
    if (!veiculoSelecionado) return alert('Selecione um veículo primeiro.');
    
    const descricaoServico = prompt("Descrição do serviço (ex: Troca de óleo):");
    if (!descricaoServico) return;
    const data = prompt("Data da manutenção (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!data) return;
    const custo = prompt("Custo do serviço (ex: 150.50):");
    if (!custo) return;

    const manutencaoData = {
        descricaoServico,
        data,
        custo: parseFloat(custo)
    };

    if (isNaN(manutencaoData.custo)) return alert('Custo inválido. Use apenas números e ponto para centavos.');

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoSelecionado._id}/manutencoes`, {
            method: 'POST',
            headers,
            body: JSON.stringify(manutencaoData)
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || 'Erro ao salvar manutenção.');
        
        alert('Manutenção adicionada com sucesso!');
        carregarEExibirManutencoes(veiculoSelecionado._id); // Atualiza a lista

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================
document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('registerBtn').addEventListener('click', handleRegister);
document.getElementById('logoutBtn').addEventListener('click', handleLogout);
document.getElementById('showRegisterLink').addEventListener('click', (e) => { e.preventDefault(); loginForm.style.display = 'none'; registerForm.style.display = 'block'; });
document.getElementById('showLoginLink').addEventListener('click', (e) => { e.preventDefault(); registerForm.style.display = 'none'; loginForm.style.display = 'block'; });
adicionarManutencaoBtn.addEventListener('click', adicionarManutencao);

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', updateUIForAuthState);

// ===================================================================
// LÓGICA DA PREVISÃO DO TEMPO (sem alterações)
// ===================================================================
const cidadeInput = document.getElementById('cidadeDestino');
const buscarPrevisaoBtn = document.getElementById('buscarPrevisaoBtn');
const outputPrevisao = document.getElementById('outputPrevisao');

async function buscarEExibirPrevisao() {
    const cidade = cidadeInput.value.trim();
    if (!cidade) return alert("Por favor, digite o nome de uma cidade.");
    outputPrevisao.innerHTML = `<p>Buscando previsão para ${cidade}...</p>`;
    try {
        const response = await fetch(`${BACKEND_URL}/api/previsao/${cidade}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Cidade não encontrada.');
        exibirPrevisaoFormatada(data);
    } catch (error) {
        outputPrevisao.innerHTML = `<p style="color: red;"><b>Erro:</b> ${error.message}</p>`;
    }
}

function exibirPrevisaoFormatada(data) {
    outputPrevisao.innerHTML = `<h3>Previsão para ${data.city.name}</h3>`;
    const previsoesDiarias = {};
    data.list.forEach(previsao => {
        const dataObj = new Date(previsao.dt * 1000);
        const dia = dataObj.toISOString().split('T')[0];
        if (!previsoesDiarias[dia]) {
            previsoesDiarias[dia] = {
                temps: [], descs: {}, icons: {},
                diaSemana: dataObj.toLocaleDateString('pt-BR', { weekday: 'long' }),
                dataFmt: dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            };
        }
        previsoesDiarias[dia].temps.push(previsao.main.temp);
        const desc = previsao.weather[0].description, icon = previsao.weather[0].icon;
        previsoesDiarias[dia].descs[desc] = (previsoesDiarias[dia].descs[desc] || 0) + 1;
        previsoesDiarias[dia].icons[icon] = (previsoesDiarias[dia].icons[icon] || 0) + 1;
    });

    outputPrevisao.innerHTML = ''; // Limpa antes de adicionar os novos cards
    for (const dia in previsoesDiarias) {
        const diaInfo = previsoesDiarias[dia];
        const temp_min = Math.min(...diaInfo.temps).toFixed(0);
        const temp_max = Math.max(...diaInfo.temps).toFixed(0);
        const descPrincipal = Object.keys(diaInfo.descs).reduce((a, b) => diaInfo.descs[a] > diaInfo.descs[b] ? a : b);
        const iconPrincipal = Object.keys(diaInfo.icons).reduce((a, b) => diaInfo.icons[a] > diaInfo.icons[b] ? a : b);
        outputPrevisao.innerHTML += `
            <div class="previsao-dia-card">
                <div class="sumario">
                    <div class="info-principal">
                        <img src="https://openweathermap.org/img/wn/${iconPrincipal}@2x.png" alt="Ícone do tempo">
                        <div>
                            <h4>${diaInfo.diaSemana}, ${diaInfo.dataFmt}</h4><p>${descPrincipal}</p>
                        </div>
                    </div>
                    <div class="temperaturas">
                        <span class="temp-max">Máx: ${temp_max}°C</span><br><span class="temp-min">Mín: ${temp_min}°C</span>
                    </div>
                </div>
            </div>`;
    }
}

buscarPrevisaoBtn.addEventListener('click', buscarEExibirPrevisao);
cidadeInput.addEventListener('keyup', (event) => { if (event.key === "Enter") buscarEExibirPrevisao(); });