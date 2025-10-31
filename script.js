// --- URL DO BACKEND ---
// A URL base do seu servidor. As imagens serão carregadas a partir daqui.
const BACKEND_URL = 'http://localhost:3001'; 
// Se estiver usando o Render, mude para: const BACKEND_URL = 'https://carro-8fvo.onrender.com';

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
const secaoManutencao = document.getElementById('secaoManutencao');
const historicoManutencaoOutput = document.getElementById('historicoManutencaoOutput');
const adicionarManutencaoBtn = document.getElementById('adicionarManutencaoBtn');
const secaoCompartilhamento = document.getElementById('secaoCompartilhamento');
const compartilhamentoOutput = document.getElementById('compartilhamentoOutput');
const formCriarVeiculo = document.getElementById('formCriarVeiculo');


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
        if (!response.ok) {
            throw new Error(data.message || 'Erro desconhecido');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', data.user.email);
        
        alert('Login realizado com sucesso! Bem-vindo(a)!');
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
        if (!response.ok) {
            throw new Error(data.message || 'Erro desconhecido');
        }

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

function getAuthHeaders(isFormData = false) {
    const token = localStorage.getItem('token');
    if (!token) {
        handleLogout();
        return null;
    }
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
}

async function carregarVeiculosDoBackend() {
    const headers = getAuthHeaders();
    if (!headers) return;

    const veiculoSelecionadoId = veiculoSelecionado ? veiculoSelecionado._id : null;
    divInformacoesVeiculo.innerHTML = '<p>Carregando veículos...</p>';
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, { headers });
        if (response.status === 401) {
            alert("Sessão expirada.");
            return handleLogout();
        }
        if (!response.ok) throw new Error(`Erro ao buscar veículos: ${response.statusText}`);
        
        const veiculosDoDb = await response.json();
        
        garagemDeVeiculos = veiculosDoDb.map(json => {
            let veiculo;
            switch (json.tipoVeiculo) {
                case 'Carro': veiculo = Carro.fromJSON(json); break;
                case 'CarroEsportivo': veiculo = CarroEsportivo.fromJSON(json); break;
                case 'Caminhao': veiculo = Caminhao.fromJSON(json); break;
                default: return null;
            }
            if (veiculo) {
                veiculo.owner = json.owner; 
                veiculo.sharedWith = json.sharedWith;
                veiculo.imageUrl = json.imageUrl;
            }
            return veiculo;
        }).filter(Boolean); // filter(Boolean) remove quaisquer valores nulos

        veiculoSelecionado = garagemDeVeiculos.find(v => v._id === veiculoSelecionadoId) || (garagemDeVeiculos[0] || null);
        
        atualizarExibicaoGeral();
    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        divInformacoesVeiculo.innerHTML = `<p style="color:red;"><b>Erro ao carregar garagem:</b> ${error.message}</p>`;
        garagemDeVeiculos = [];
        veiculoSelecionado = null;
        atualizarExibicaoGeral();
    }
}

async function handleCriarVeiculo(event) {
    event.preventDefault(); 
    const headers = getAuthHeaders(true);
    if (!headers) return;

    const formData = new FormData(formCriarVeiculo);

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.message || "Erro ao criar veículo");

        alert(`Veículo ${resultado.marca} criado com sucesso!`);
        formCriarVeiculo.reset();
        await carregarVeiculosDoBackend();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

function atualizarExibicaoGeral() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
        secaoManutencao.style.display = 'block';
        secaoCompartilhamento.style.display = 'block';
        carregarEExibirManutencoes(veiculoSelecionado._id);
        exibirGerenciamentoCompartilhamento(veiculoSelecionado);
    } else {
        divInformacoesVeiculo.textContent = garagemDeVeiculos.length > 0 ? "Selecione um veículo." : "Sua garagem está vazia. Adicione um veículo no formulário acima.";
        secaoManutencao.style.display = 'none';
        secaoCompartilhamento.style.display = 'none';
    }

    const loggedInUserEmail = localStorage.getItem('userEmail');
    const gerarHtmlVeiculo = (v) => {
        const isOwner = v.owner && v.owner.email === loggedInUserEmail;
        const shareButton = isOwner ? `<button onclick="compartilharVeiculo('${v._id}')">Compartilhar</button>` : '';
        const sharedLabel = !isOwner ? `<span style="font-size: 0.8em; color: #555;"> (de ${v.owner?.email})</span>` : '';
        
        const imagemHTML = v.imageUrl 
            ? `<img src="${BACKEND_URL}/${v.imageUrl}" alt="Foto de ${v.modelo}" class="veiculo-img">`
            : `<div class="veiculo-img" style="display:flex; align-items:center; justify-content:center; height:180px; text-align:center; color: #888; border: 1px dashed #ccc; background-color: #f9f9f9; border-radius: 8px;">(Sem Imagem)</div>`;

        return `<li style="list-style-type: none; margin-bottom: 20px; text-align: center;">
                    ${imagemHTML}
                    <p>${v.exibirInformacoes()}${sharedLabel}</p>
                    <button onclick="selecionarVeiculoPorId('${v._id}')">Selecionar</button>
                    ${shareButton}
                </li>`;
    };

    const carrosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro').map(gerarHtmlVeiculo).join('');
    outputCarro.innerHTML = carrosHTML ? `<ul style="padding: 0;">${carrosHTML}</ul>` : "Nenhum Carro Padrão na garagem.";

    const esportivosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo').map(gerarHtmlVeiculo).join('');
    outputEsportivo.innerHTML = esportivosHTML ? `<ul style="padding: 0;">${esportivosHTML}</ul>` : "Nenhum Carro Esportivo na garagem.";

    const caminhoesHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao').map(gerarHtmlVeiculo).join('');
    outputCaminhao.innerHTML = caminhoesHTML ? `<ul style="padding: 0;">${caminhoesHTML}</ul>` : "Nenhum Caminhão na garagem.";
}

function selecionarVeiculoPorId(id) {
    veiculoSelecionado = garagemDeVeiculos.find(v => v._id === id) || null;
    atualizarExibicaoGeral();
}

function chamarInteragir(acao) {
    if (!veiculoSelecionado) return alert("Por favor, selecione um veículo.");
    try {
        if (typeof veiculoSelecionado[acao] === 'function') {
            if (['carregar', 'descarregar'].includes(acao)) {
                const peso = parseInt(document.getElementById("pesoInteracao").value, 10);
                veiculoSelecionado[acao](peso);
            } else {
                veiculoSelecionado[acao]();
            }
            atualizarExibicaoGeral();
        } else {
            alert(`Ação '${acao}' não é válida para este tipo de veículo.`);
        }
    } catch (error) {
        alert(`Ocorreu um erro: ${error.message}`);
    }
}

// Funções antigas que não são mais chamadas pelos botões, mas mantidas para referência.
function criarCarroEsportivo() {
    const placa = prompt("Digite a PLACA do carro esportivo:");
    if (!placa) return;
    const dados = { placa, tipoVeiculo: "CarroEsportivo", marca: "Toyota", modelo: "GR Corolla", ano: 2023, cor: "Preto", apiId: "esportivo-corolla-01"};
    handleCriarVeiculoComPrompt(dados); // Chama uma função helper para evitar duplicação
}
function criarCaminhao() {
    const placa = prompt("Digite a PLACA do caminhão:");
    if (!placa) return;
    const dados = { placa, tipoVeiculo: "Caminhao", marca: "Volvo", modelo: "FH", ano: 2022, cor: "Vermelho", capacidadeCarga: 10000, apiId: "caminhao-volvo-01"};
    handleCriarVeiculoComPrompt(dados);
}
// Função helper para as chamadas via prompt (se ainda quiser usar)
async function handleCriarVeiculoComPrompt(dados) {
    alert("Recomendado usar o formulário principal que suporta imagens.");
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, { method: 'POST', headers, body: JSON.stringify(dados) });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.message || "Erro ao criar veículo");
        alert(`Veículo ${resultado.placa} criado!`);
        await carregarVeiculosDoBackend();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

async function compartilharVeiculo(veiculoId) {
    const email = prompt("Digite o e-mail do usuário para compartilhar:");
    if (!email) return;
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/share`, { method: 'POST', headers, body: JSON.stringify({ email }) });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.message);
        alert(resultado.message);
        await carregarVeiculosDoBackend();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

async function handleUnshare(veiculoId, userIdToRemove) {
    if (!confirm('Tem certeza?')) return;
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/unshare`, { method: 'POST', headers, body: JSON.stringify({ userIdToRemove }) });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.message);
        alert(resultado.message);
        await carregarVeiculosDoBackend();
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}

function exibirGerenciamentoCompartilhamento(veiculo) {
    const loggedInUserEmail = localStorage.getItem('userEmail');
    if (!veiculo || !veiculo.owner || loggedInUserEmail !== veiculo.owner.email) {
        secaoCompartilhamento.style.display = 'none';
        return;
    }
    secaoCompartilhamento.style.display = 'block';
    if (!veiculo.sharedWith || veiculo.sharedWith.length === 0) {
        compartilhamentoOutput.innerHTML = 'Este veículo não está compartilhado.';
        return;
    }
    const listaHTML = veiculo.sharedWith.map(user => 
        `<li>${user.email} <button onclick="handleUnshare('${veiculo._id}', '${user._id}')">Remover</button></li>`
    ).join('');
    compartilhamentoOutput.innerHTML = `<ul>${listaHTML}</ul>`;
}

async function carregarEExibirManutencoes(veiculoId) {
    const headers = getAuthHeaders();
    if (!headers) return;
    const veiculo = garagemDeVeiculos.find(v => v._id === veiculoId);
    if (!veiculo) return;
    const loggedInUserEmail = localStorage.getItem('userEmail');
    if (veiculo.owner.email !== loggedInUserEmail) {
        adicionarManutencaoBtn.style.display = 'none';
        historicoManutencaoOutput.innerHTML = 'Apenas o proprietário pode gerenciar manutenções.';
        return;
    }
    adicionarManutencaoBtn.style.display = 'inline-block';
    historicoManutencaoOutput.innerHTML = 'Carregando...';
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoId}/manutencoes`, { headers });
        if (!response.ok) throw new Error('Falha ao buscar manutenções.');
        const manutencoes = await response.json();
        if (manutencoes.length === 0) {
            historicoManutencaoOutput.innerHTML = 'Nenhuma manutenção registrada.';
            return;
        }
        const manutencoesHTML = manutencoes.map(m => `<li><strong>${m.descricaoServico}</strong> em ${new Date(m.data).toLocaleDateString('pt-BR',{timeZone:'UTC'})} - R$${(m.custo||0).toFixed(2)}</li>`).join('');
        historicoManutencaoOutput.innerHTML = `<ul>${manutencoesHTML}</ul>`;
    } catch (error) {
        historicoManutencaoOutput.innerHTML = `<span style="color:red;">${error.message}</span>`;
    }
}

async function adicionarManutencao() {
    if (!veiculoSelecionado) return alert('Selecione um veículo.');
    const descricaoServico = prompt("Descrição do serviço:");
    if (!descricaoServico) return;
    const data = prompt("Data (AAAA-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!data) return;
    const custo = prompt("Custo (ex: 150.50):");
    if (!custo) return;
    const manutencaoData = { descricaoServico, data, custo: parseFloat(custo) };
    if (isNaN(manutencaoData.custo)) return alert('Custo inválido.');
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos/${veiculoSelecionado._id}/manutencoes`, {
            method: 'POST', headers, body: JSON.stringify(manutencaoData)
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.message || 'Erro ao salvar.');
        alert('Manutenção adicionada!');
        carregarEExibirManutencoes(veiculoSelecionado._id);
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
formCriarVeiculo.addEventListener('submit', handleCriarVeiculo);

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', updateUIForAuthState);

// ===================================================================
// LÓGICA DA PREVISÃO DO TEMPO
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
        if (!response.ok) throw new Error(data.message || 'Cidade não encontrada.');
        exibirPrevisaoFormatada(data);
    } catch (error) {
        outputPrevisao.innerHTML = `<p style="color: red;"><b>Erro:</b> ${error.message}</p>`;
    }
}

function exibirPrevisaoFormatada(data) {
    let htmlFinal = `<h3>Previsão para ${data.city.name}</h3>`;
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
    for (const dia in previsoesDiarias) {
        const diaInfo = previsoesDiarias[dia];
        const temp_min = Math.min(...diaInfo.temps).toFixed(0);
        const temp_max = Math.max(...diaInfo.temps).toFixed(0);
        const descPrincipal = Object.keys(diaInfo.descs).reduce((a, b) => diaInfo.descs[a] > diaInfo.descs[b] ? a : b);
        const iconPrincipal = Object.keys(diaInfo.icons).reduce((a, b) => diaInfo.icons[a] > diaInfo.icons[b] ? a : b);
        htmlFinal += `
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
    outputPrevisao.innerHTML = htmlFinal;
}

buscarPrevisaoBtn.addEventListener('click', buscarEExibirPrevisao);
cidadeInput.addEventListener('keyup', (event) => { if (event.key === "Enter") buscarEExibirPrevisao(); });