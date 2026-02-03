class BeSmartApp {
    constructor() {
        this.cliente = null;
        this.seguradoras = [
            {
                nome: "Azos",
                pontuacao: 8.5,
                especialidade: ["Porte de Armas", "Profissões de Risco", "DIT"],
                vantagens: ["Aceita porte de armas", "Cobertura DIT ampla", "Perfis especiais"],
                cor: "#7C3AED",
                tempoAprovacao: "24h",
                precoMedio: "R$ 89,90",
                perfilIdeal: "Profissionais com porte de armas"
            },
            {
                nome: "Prudential",
                pontuacao: 9.0,
                especialidade: ["Doenças Graves", "Planejamento Sucessório"],
                vantagens: ["Cobertura ampliada doenças graves", "Solução sucessória"],
                cor: "#1E40AF",
                tempoAprovacao: "48h",
                precoMedio: "R$ 199,90",
                perfilIdeal: "Clientes com foco em proteção"
            },
            {
                nome: "Omint",
                pontuacao: 9.4,
                especialidade: ["Alta Renda", "Executivos", "Saúde Premium"],
                vantagens: ["Rede médica exclusiva", "Atendimento concierge"],
                cor: "#FF6B35",
                tempoAprovacao: "24-72h",
                precoMedio: "R$ 299+",
                perfilIdeal: "Executivos de alta renda"
            }
        ];

        this.perfisCliente = [
            "Profissão com porte de armas",
            "70 anos + Doenças Graves",
            "Só quer DIT",
            "Baixa renda",
            "Alta renda",
            "Pagamento Unico",
            "Resgate",
            "Jovem com filho pequeno",
            "85 anos",
            "Modular"
        ];

        this.init();
    }

    init() {
        // Inicializar navegação
        this.initNavigation();
        
        // Carregar perfis
        this.carregarPerfis();
        
        // Carregar dados salvos
        this.carregarDados();
        
        // Inicializar formulário
        this.initForm();
    }

    initNavigation() {
        // Navegação por hash
        window.addEventListener('hashchange', () => this.showTabFromHash());
        
        // Links da sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showTab(target);
            });
        });
        
        // Mostrar aba inicial
        if (!window.location.hash || window.location.hash === '#') {
            this.showTab('dashboard');
        } else {
            this.showTabFromHash();
        }
    }

    showTabFromHash() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.showTab(hash);
    }

    showTab(tabName) {
        // Atualizar URL
        window.location.hash = tabName;
        
        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${tabName}`) {
                link.classList.add('active');
            }
        });
        
        // Mostrar conteúdo
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Atualizar conteúdo específico
        switch(tabName) {
            case 'dashboard':
                this.atualizarDashboard();
                break;
            case 'comparativo':
                this.carregarComparativo();
                break;
            case 'coberturas':
                this.carregarCoberturas();
                break;
        }
    }

    carregarPerfis() {
        const container = document.getElementById('perfis-container');
        if (!container) return;

        container.innerHTML = '';
        this.perfisCliente.forEach((perfil, index) => {
            const col = document.createElement('div');
            col.className = 'col-md-6 mb-2';
            col.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="perfil-${index}">
                    <label class="form-check-label" for="perfil-${index}">
                        ${perfil}
                    </label>
                </div>
            `;
            container.appendChild(col);
        });
    }

    initForm() {
        const form = document.getElementById('cadastro-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processarCadastro();
            });
        }
    }

    carregarDados() {
        try {
            const dados = localStorage.getItem('besmart-cliente');
            if (dados) {
                this.cliente = JSON.parse(dados);
                this.atualizarDashboard();
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    }

    processarCadastro() {
        try {
            // Coletar dados
            const nome = document.getElementById('nome').value.trim();
            const idade = parseInt(document.getElementById('idade').value);
            const profissao = document.getElementById('profissao').value.trim();
            const estadoCivil = document.getElementById('estado-civil').value;
            const renda = parseFloat(document.getElementById('renda').value);
            const patrimonio = parseFloat(document.getElementById('patrimonio').value) || 0;
            const dependentes = parseInt(document.getElementById('dependentes').value);
            const pilarFinanceiro = document.getElementById('pilar-financeiro').value === 'true';

            // Validar
            if (!nome || !profissao || !estadoCivil || isNaN(renda) || isNaN(idade) || isNaN(dependentes)) {
                alert('Por favor, preencha todos os campos obrigatórios!');
                return;
            }

            // Coletar perfis
            const perfis = [];
            this.perfisCliente.forEach((_, index) => {
                const checkbox = document.getElementById(`perfil-${index}`);
                if (checkbox && checkbox.checked) {
                    perfis.push(this.perfisCliente[index]);
                }
            });

            // Calcular capital
            const capitalSugerido = this.calcularCapitalSegurado({
                idade,
                renda,
                patrimonio,
                dependentes,
                pilarFinanceiro
            });

            // Salvar cliente
            this.cliente = {
                nome,
                idade,
                profissao,
                estadoCivil,
                renda,
                patrimonio,
                dependentes,
                pilarFinanceiro,
                perfis,
                capitalSugerido
            };

            localStorage.setItem('besmart-cliente', JSON.stringify(this.cliente));

            // Atualizar interface
            this.atualizarDashboard();
            this.showTab('dashboard');
            
            // Mostrar sucesso
            alert(`✅ Cadastro realizado com sucesso!\n\nCapital sugerido: R$ ${this.formatarMoeda(capitalSugerido)}`);
            
            // Resetar progresso visual
            document.getElementById('cadastro-progress').style.width = '100%';

        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro ao processar cadastro. Verifique os dados.');
        }
    }

    calcularCapitalSegurado(dados) {
        let capital = 0;
        
        // Doenças Graves: 36x despesas (60% da renda)
        const despesasMensais = dados.renda * 0.6;
        capital += despesasMensais * 36;
        
        // Whole Life: 20% ou 15% do patrimônio
        const percentualPatrimonio = dados.pilarFinanceiro ? 0.20 : 0.15;
        capital += dados.patrimonio * percentualPatrimonio;
        
        // Term Life: Despesas com filhos x 20 anos
        if (dados.dependentes > 0) {
            const despesasFilhos = despesasMensais * 0.3;
            capital += despesasFilhos * 12 * 20;
        }
        
        // Invalidez Permanente: 100x renda
        capital += dados.renda * 100;
        
        // DIT e DIH: despesas/30 (valor diário)
        capital += (despesasMensais / 30) * 2;
        
        return Math.round(capital);
    }

    atualizarDashboard() {
        const metricsContainer = document.getElementById('dashboard-metrics');
        const clienteInfo = document.getElementById('cliente-info');

        if (!this.cliente) {
            // Estado sem cliente
            if (metricsContainer) {
                metricsContainer.innerHTML = `
                    <div class="col-md-12">
                        <div class="alert alert-info">
                            <h5>👋 Bem-vindo ao BeSmart PRO!</h5>
                            <p>Complete seu cadastro para ver suas métricas personalizadas.</p>
                        </div>
                    </div>
                `;
            }
            return;
        }

        // Atualizar métricas
        if (metricsContainer) {
            const riskScore = this.calcularScoreRisco();
            
            metricsContainer.innerHTML = `
                <div class="col-md-3">
                    <div class="metric-card">
                        <div class="text-muted mb-2">💰 Capital Sugerido</div>
                        <div class="h3 text-primary">R$ ${this.formatarMoeda(this.cliente.capitalSugerido || 0)}</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="metric-card">
                        <div class="text-muted mb-2">🛡️ Score de Risco</div>
                        <div class="h3 ${riskScore < 50 ? 'text-danger' : riskScore < 70 ? 'text-warning' : 'text-success'}">
                            ${riskScore}/100
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="metric-card">
                        <div class="text-muted mb-2">👨‍👩‍👧‍👦 Dependentes</div>
                        <div class="h3 text-info">${this.cliente.dependentes}</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="metric-card">
                        <div class="text-muted mb-2">📊 Coberturas</div>
                        <div class="h3" style="color: #6f42c1;">6/6</div>
                    </div>
                </div>
            `;
        }

        // Atualizar info do cliente
        if (clienteInfo) {
            clienteInfo.innerHTML = `
                <div class="card-body">
                    <h4 class="card-title">👤 ${this.cliente.nome}</h4>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <p><strong>Idade:</strong> ${this.cliente.idade} anos</p>
                            <p><strong>Profissão:</strong> ${this.cliente.profissao}</p>
                            <p><strong>Estado Civil:</strong> ${this.cliente.estadoCivil}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Renda Mensal:</strong> R$ ${this.formatarMoeda(this.cliente.renda)}</p>
                            <p><strong>Patrimônio:</strong> R$ ${this.formatarMoeda(this.cliente.patrimonio)}</p>
                            <p><strong>Pilar Financeiro:</strong> ${this.cliente.pilarFinanceiro ? 'Sim' : 'Não'}</p>
                        </div>
                    </div>
                    ${this.cliente.perfis.length > 0 ? `
                        <div class="mt-3">
                            <strong>Perfis identificados:</strong>
                            <div class="mt-2">
                                ${this.cliente.perfis.map(perfil => 
                                    `<span class="badge bg-primary me-1">${perfil}</span>`
                                ).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="mt-4">
                        <button class="btn btn-primary me-2" onclick="app.showTab('coberturas')">
                            <i class="fas fa-shield-alt"></i> Ver Coberturas
                        </button>
                        <button class="btn btn-outline-primary" onclick="app.showTab('comparativo')">
                            <i class="fas fa-chart-bar"></i> Comparar Seguradoras
                        </button>
                    </div>
                </div>
            `;
        }
    }

    calcularScoreRisco() {
        if (!this.cliente) return 100;
        
        let score = 100;
        if (this.cliente.idade > 50) score -= 20;
        else if (this.cliente.idade > 40) score -= 10;
        
        if (this.cliente.dependentes > 3) score -= 15;
        
        return Math.max(30, score);
    }

    carregarComparativo() {
        const container = document.getElementById('comparativo-container');
        if (!container) return;

        let html = '<div class="row">';
        
        const seguradorasOrdenadas = [...this.seguradoras]
            .map(seg => ({
                ...seg,
                compatibilidade: this.calcularCompatibilidade(seg)
            }))
            .sort((a, b) => b.compatibilidade - a.compatibilidade);

        seguradorasOrdenadas.forEach((seg, index) => {
            const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
            html += `
                <div class="col-md-12 mb-3">
                    <div class="seguradora-card" style="border-color: ${seg.cor}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h4>${emoji} ${seg.nome}</h4>
                                <p class="text-muted">${seg.perfilIdeal}</p>
                            </div>
                            <div class="text-end">
                                <div class="badge" style="background: ${seg.cor}; font-size: 1rem;">
                                    ${seg.compatibilidade}% Match
                                </div>
                                <div class="text-muted small mt-1">Pontuação: ${seg.pontuacao}/10</div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <strong>Especialidades:</strong>
                            <div class="mt-2">
                                ${seg.especialidade.map(esp => 
                                    `<span class="coverage-badge" style="background: ${seg.cor}">${esp}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <strong>Vantagens:</strong>
                                <ul class="mb-0">
                                    ${seg.vantagens.map(v => `<li>${v}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Preço Médio:</strong> ${seg.precoMedio}</p>
                                <p><strong>Tempo de Aprovação:</strong> ${seg.tempoAprovacao}</p>
                                <p><strong>Compatibilidade:</strong> ${seg.compatibilidade}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    calcularCompatibilidade(seguradora) {
        if (!this.cliente) return Math.floor(Math.random() * 30) + 60; // Random para demonstração
        
        let compatibilidade = 50;
        
        // Lógica de compatibilidade simplificada
        if (this.cliente.renda > 25000 && seguradora.especialidade.some(e => e.includes('Alta'))) {
            compatibilidade += 20;
        }
        
        if (this.cliente.dependentes > 0 && seguradora.nome.includes('Prudential')) {
            compatibilidade += 15;
        }
        
        if (this.cliente.perfis.some(p => p.includes('armas')) && seguradora.nome.includes('Azos')) {
            compatibilidade += 25;
        }
        
        if (this.cliente.idade > 65 && seguradora.nome.includes('MAG')) {
            compatibilidade += 20;
        }
        
        return Math.min(100, compatibilidade);
    }

    carregarCoberturas() {
        const container = document.getElementById('coberturas-container');
        if (!container) return;

        if (!this.cliente) {
            container.innerHTML = `
                <div class="col-md-12">
                    <div class="alert alert-info">
                        <p>Complete seu cadastro para ver suas coberturas personalizadas.</p>
                        <button class="btn btn-primary mt-2" onclick="app.showTab('cadastro')">
                            Fazer Cadastro
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        const coberturas = [
            { 
                nome: 'Doenças Graves', 
                valor: this.cliente.renda * 0.6 * 36, 
                icone: '🦠',
                desc: 'Proteção para tratamento de doenças graves'
            },
            { 
                nome: 'Whole Life', 
                valor: this.cliente.patrimonio * (this.cliente.pilarFinanceiro ? 0.20 : 0.15), 
                icone: '🏠',
                desc: 'Proteção patrimonial vitalícia'
            },
            { 
                nome: 'Term Life', 
                valor: this.cliente.dependentes > 0 ? this.cliente.renda * 0.3 * 12 * 20 : 0, 
                icone: '📚',
                desc: 'Proteção educacional para filhos'
            },
            { 
                nome: 'Invalidez Permanente', 
                valor: this.cliente.renda * 100, 
                icone: '♿',
                desc: 'Proteção contra invalidez'
            },
            { 
                nome: 'Diária Incapacidade', 
                valor: this.cliente.renda * 0.6 / 30, 
                icone: '💼',
                desc: 'Proteção de renda diária'
            },
            { 
                nome: 'Diária Internação', 
                valor: this.cliente.renda * 0.6 / 30, 
                icone: '🏥',
                desc: 'Diária por internação hospitalar'
            }
        ];

        let html = '<div class="row">';
        
        coberturas.forEach(cobertura => {
            const valorFormatado = cobertura.nome.includes('Diária') 
                ? `R$ ${this.formatarMoeda(cobertura.valor)}/dia`
                : `R$ ${this.formatarMoeda(cobertura.valor)}`;
                
            html += `
                <div class="col-md-4 mb-3">
                    <div class="metric-card h-100">
                        <div class="h1 mb-3">${cobertura.icone}</div>
                        <h5>${cobertura.nome}</h5>
                        <div class="h4 text-primary mb-2">${valorFormatado}</div>
                        <p class="text-muted small">${cobertura.desc}</p>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }

    formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

    gerarRelatorio() {
        if (!this.cliente) {
            alert('Complete o cadastro primeiro!');
            return;
        }

        const relatorio = `
            RELATÓRIO BESMART PRO
            ====================
            
            Cliente: ${this.cliente.nome}
            Idade: ${this.cliente.idade} anos
            Profissão: ${this.cliente.profissao}
            
            Capital Sugerido: R$ ${this.formatarMoeda(this.cliente.capitalSugerido)}
            
            Gerado em: ${new Date().toLocaleString('pt-BR')}
        `;

        // Criar blob para download
        const blob = new Blob([relatorio], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-besmart-${this.cliente.nome.replace(/\s+/g, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert('Relatório gerado com sucesso!');
    }

    novaSimulacao() {
        if (confirm('Deseja iniciar uma nova simulação? Os dados atuais serão perdidos.')) {
            localStorage.removeItem('besmart-cliente');
            this.cliente = null;
            this.atualizarDashboard();
            
            // Resetar formulário
            const form = document.getElementById('cadastro-form');
            if (form) form.reset();
            
            document.getElementById('cadastro-progress').style.width = '0%';
            
            this.showTab('dashboard');
            alert('Nova simulação iniciada!');
        }
    }
}

// Inicializar aplicação
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new BeSmartApp();
});

// Funções globais para acesso via HTML
function showTab(tabName) {
    if (app) app.showTab(tabName);
}

function gerarRelatorio() {
    if (app) app.gerarRelatorio();
}

function novaSimulacao() {
    if (app) app.novaSimulacao();
}

// Expor app globalmente
window.app = app;