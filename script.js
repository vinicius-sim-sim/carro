// --- URL DO BACKEND ---
// Comente a linha do Render e descomente a do localhost para testar localmente
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


// ===================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ===================================================================

function updateUIForAuthState() {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (token && userEmail) {
        // Logado
        authContainer.style.display = 'none';
        garageContainer.style.display = 'block';
        userEmailSpan.textContent = `Logado como: ${userEmail}`;
        carregarVeiculosDoBackend();
    } else {
        // Deslogado
        authContainer.style.display = 'block';
        garageContainer.style.display = 'none';
        garagemDeVeiculos = [];
        veiculoSelecionado = null;
        atualizarExibicaoGeral(); // Limpa a tela
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) {
        return alert("Por favor, preencha e-mail e senha.");
    }
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
    if (!email || !password) {
        return alert("Por favor, preencha e-mail e senha.");
    }
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
// FUNÇÕES DE GERENCIAMENTO (COM AUTENTICAÇÃO)
// ===================================================================

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Token de autenticação não encontrado. Redirecionando para login.");
        handleLogout();
        return null;
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function carregarVeiculosDoBackend() {
    const headers = getAuthHeaders();
    if (!headers) return;

    divInformacoesVeiculo.innerHTML = '<p>Carregando veículos da sua garagem...</p>';
    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, { headers });
        if (response.status === 401) {
            alert("Sessão expirada. Por favor, faça login novamente.");
            return handleLogout();
        }
        if (!response.ok) throw new Error(`Erro ao buscar veículos: ${response.statusText}`);
        
        const veiculosDoDb = await response.json();
        garagemDeVeiculos = veiculosDoDb.map(json => {
            switch (json.tipoVeiculo) {
                case 'Carro': return Carro.fromJSON(json);
                case 'CarroEsportivo': return CarroEsportivo.fromJSON(json);
                case 'Caminhao': return Caminhao.fromJSON(json);
                default: return null;
            }
        }).filter(v => v);

        // Seleciona o primeiro veículo se houver algum, senão limpa a seleção
        veiculoSelecionado = garagemDeVeiculos.length > 0 ? garagemDeVeiculos[0] : null;

        atualizarExibicaoGeral();

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        divInformacoesVeiculo.innerHTML = `<p style="color:red;"><b>Erro ao carregar garagem:</b> ${error.message}</p>`;
        atualizarExibicaoGeral();
    }
}

async function criarVeiculo(dados) {
    const headers = getAuthHeaders();
    if (!headers) return;
    
    // Adiciona uma validação simples para a placa
    if (!dados.placa || dados.placa.trim() === "") {
        return; // Cancela se o usuário não digitar uma placa no prompt
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/veiculos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(dados),
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || "Erro ao criar veículo");

        alert(`Veículo com placa ${resultado.placa} criado com sucesso!`);
        await carregarVeiculosDoBackend();
    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        alert(`Erro: ${error.message}`);
    }
}

function atualizarExibicaoGeral() {
    if (veiculoSelecionado) {
        divInformacoesVeiculo.innerHTML = `<p>${veiculoSelecionado.exibirInformacoes()}</p>`;
    } else if (garagemDeVeiculos.length > 0) {
        divInformacoesVeiculo.textContent = "Selecione um veículo da lista abaixo.";
    } else {
        divInformacoesVeiculo.textContent = "Sua garagem está vazia. Crie um veículo para começar.";
    }

    const carrosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Carro')
        .map(c => `<li>${c.exibirInformacoes()} <button onclick="selecionarVeiculoPorId('${c._id}')">Selecionar</button></li>`).join('');
    outputCarro.innerHTML = carrosHTML ? `<ul>${carrosHTML}</ul>` : "Nenhum Carro Padrão na garagem.";

    const esportivosHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'CarroEsportivo')
        .map(e => `<li>${e.exibirInformacoes()} <button onclick="selecionarVeiculoPorId('${e._id}')">Selecionar</button></li>`).join('');
    outputEsportivo.innerHTML = esportivosHTML ? `<ul>${esportivosHTML}</ul>` : "Nenhum Carro Esportivo na garagem.";

    const caminhoesHTML = garagemDeVeiculos.filter(v => v.tipoVeiculo === 'Caminhao')
        .map(c => `<li>${c.exibirInformacoes()} <button onclick="selecionarVeiculoPorId('${c._id}')">Selecionar</button></li>`).join('');
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
    if (!veiculoSelecionado) {
        return alert("Por favor, selecione um veículo primeiro.");
    }
    try {
        if (typeof veiculoSelecionado[acao] === 'function') {
            if (acao === 'carregar' || aco === 'descarregar') {
                const peso = parseInt(document.getElementById("pesoInteracao").value, 10);
                if (isNaN(peso) || peso <= 0) return alert("Por favor, insira um peso válido.");
                veiculoSelecionado[acao](peso);
            } else {
                veiculoSelecionado[acao]();
            }
            // Atualiza a exibição APENAS do veículo selecionado para refletir a mudança
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
    if (!placa) return;
    criarVeiculo({ placa, tipoVeiculo: "CarroEsportivo", marca: "Toyota", modelo: "GR Corolla", ano: 2023, cor: "Preto", apiId: "esportivo-corolla-01"});
}

function criarCaminhao() {
    const placa = prompt("Digite a PLACA do caminhão:");
    if (!placa) return;
    criarVeiculo({ placa, tipoVeiculo: "Caminhao", marca: "Volvo", modelo: "FH", ano: 2022, cor: "Vermelho", capacidadeCarga: 10000, apiId: "caminhao-volvo-01"});
}


// ===================================================================
// EVENT LISTENERS
// ===================================================================

// --- Listeners de Autenticação ---
document.getElementById('loginBtn').addEventListener('click', handleLogin);
document.getElementById('registerBtn').addEventListener('click', handleRegister);
document.getElementById('logoutBtn').addEventListener('click', handleLogout);

document.getElementById('showRegisterLink').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

document.getElementById('showLoginLink').addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});


// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('[FRONTEND INFO] Página carregada. Verificando estado de autenticação...');
    console.log(`[FRONTEND DEBUG] BACKEND_URL configurada para: ${BACKEND_URL}`);
    updateUIForAuthState();
});