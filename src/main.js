// Lógica principal do jogo.
// Dados (mapas, peças, textos) ficam em src/dados/, constantes em src/config.js,
// e as classes Atlas, Camera e Input ficam em src/core/.

let canvas;
let ctx;

const camera = new Camera();
const input = new Input();

// ---- sprites ----
// Cada personagem tem uma imagem só (atlas), numa grade de células 16x24.
const COLUNAS_ATLAS = { down: 0, up: 1, left: 2, right: 2 };
const ATLAS_JOGADOR = new Atlas("assets/sprites/placeholderfajti.png", 16, 24, COLUNAS_ATLAS);
const ATLAS_PROFESSOR = new Atlas("assets/sprites/placeholderboneco.png", 16, 24, COLUNAS_ATLAS);

// ---- movimento ----
let correndoPasso = false;              // o passo atual é de corrida?
let duracaoPassoAtual = DURACAO_PASSO_ANDANDO;

// ---- área atual ----
let nomeArea = "sala";
let areaAtual = areas.sala;
let mapa = areaAtual.mapa;
let mundoLargura = areaAtual.largura;
let mundoAltura = areaAtual.altura;

// os NPCs voltam a olhar para a direção original
function resetarNpcs() {
    for (let n of npcs) n.direcao = n.direcaoInicial;
}

// troca a área atual (ao sair de uma área, os NPCs voltam à direção original)
function usarArea(nome) {
    if (nome !== nomeArea) resetarNpcs();
    nomeArea = nome;
    areaAtual = areas[nome];
    mapa = areaAtual.mapa;
    mundoLargura = areaAtual.largura;
    mundoAltura = areaAtual.altura;
}

// ---- professor (NPC na sala de aula) ----
// Fica 2 tiles abaixo da mesa dele, olhando para a esquerda, e bloqueia o caminho.
let professor = { x: 17, y: 6, direcao: "left", direcaoInicial: "left", falou: false, atlas: ATLAS_PROFESSOR };
let npcs = [professor];

// só vira true depois da conversa com o professor (aí aparecem o HUD e as peças)
let buscaAtiva = false;

// ---- estado das peças e do jogo ----
let pedidoAtual = null;     // pedido sorteado nesta partida
let itens = [];             // peças no mapa: { area, x, y, peca, coletado }
let mochila = {};           // peça que o player carrega de cada tipo: { tipo: peca }
let resultadoFinal = [];    // linhas de texto da tela de fim de jogo

let pausado = false;        // ESC pausa e despausa
let pausadoEm = 0;
let telaInicio = true;      // tela de START (aparece quando a página abre)
let gameOver = false;
let gameOverEm = 0;

// enquanto a caixa está aberta: { paginas, pagina, aoFechar, opcoes, cursor, aoEscolher }
// paginas = lista de textos (com mais de uma, aparece a setinha piscando)
// opcoes = menu de escolha (SIM / NÃO) que aparece na última página
let mensagem = null;

// ---- jogador ----
let jogador = {
    x: 0,
    y: 0,
    direcao: "up",
    atlas: ATLAS_JOGADOR,
};

let movendo = false;
let progressoPasso = 0;     // de 0 a 1 dentro do passo atual
let passoPar = true;        // alterna a cada tile (pé A / pé B)
let origemMovimento = { x: 0, y: 0 };
let destinoMovimento = { x: 0, y: 0 };
let inicioMovimento = 0;
let liberaGiroEm = 0;

// ---- portas e troca de área (fade para preto) ----
let transicao = null;       // { fase: "saindo" ou "entrando", inicio, porta }
// animação da porta de fora: "abrindo" -> "entrando" (player anda para dentro) -> "aguardando" (fade)
let portaAnim = null;       // { fase, inicio, porta, tileX, tileY, quadro }
let esperarSoltar = false;  // depois da mensagem de tile bloqueado, só repete ao soltar a tecla
let bumpDir = null;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    reiniciarJogo();

    window.addEventListener("resize", redimensionar);

    input.aoEspaco = aoApertarEspaco;
    input.aoEscape = aoApertarEscape;
    input.aoDirecao = aoApertarDirecao;
    input.aoNovaDirecao = aoNovaDirecao;
    input.instalar();

    redimensionar();
    requestAnimationFrame(desenhar);
}

// espaço na tela de START
function iniciarPartida() {
    telaInicio = false;
    comecarIntro();
}

// começa (ou recomeça) a partida
function comecarIntro() {
    reiniciarJogo();
    abrirMensagem(MSG_INTRO);
}

function reiniciarJogo() {
    usarArea(inicioAreaNome);
    transicao = null;
    portaAnim = null;
    jogador.x = inicioJogadorX;
    jogador.y = inicioJogadorY;
    jogador.direcao = inicioJogadorDirecao;
    movendo = false;
    camera.seguir(jogador.x, jogador.y);
    origemMovimento = { x: jogador.x, y: jogador.y };
    destinoMovimento = { x: jogador.x, y: jogador.y };

    mochila = {};
    pedidoAtual = null;
    resultadoFinal = [];
    gameOver = false;
    mensagem = null;
    esperarSoltar = false;
    itens = [];             // as peças só aparecem depois da conversa com o professor
    buscaAtiva = false;
    resetarNpcs();
    professor.falou = false;
}

// fim da conversa com o professor: mostra o HUD e sorteia as peças
function iniciarBusca() {
    professor.falou = true;
    buscaAtiva = true;
    gerarItens();
}

// ---- mapa e colisão ----
function tileSolido(x, y) {
    // fora do mapa conta como sólido
    if (x < 0 || y < 0 || x >= mundoLargura || y >= mundoAltura) return true;
    return tipoTile[mapa[y][x]].solido;
}

function podeAndar(x, y) {
    if (tileSolido(x, y)) return false;
    if (itemNoTile(x, y)) return false;     // a peça bloqueia o tile
    if (professorNoTile(x, y)) return false;
    return true;
}

// ---- peças no mapa ----
// embaralha uma lista (Fisher-Yates)
function embaralhar(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
}

// true se (x, y) está a 1 tile ou menos de uma porta, de onde o player chega ou do início do jogo
// (as peças bloqueiam o tile, então não podem ficar perto das entradas e saídas)
function pertoDePorta(nome, x, y) {
    let perto = (px, py) => Math.abs(px - x) <= 1 && Math.abs(py - y) <= 1;
    for (let p of areas[nome].portas) {
        if (perto(p.x, p.y)) return true;
    }
    for (let outra in areas) {
        for (let p of areas[outra].portas) {
            if (p.destino === nome && perto(p.destinoX, p.destinoY)) return true;
        }
    }
    return nome === inicioAreaNome && perto(inicioJogadorX, inicioJogadorY);
}

// lugares onde uma peça pode aparecer: na sala só nas mesas, nas outras áreas só no chão livre
function pontosDePeca(nome) {
    let area = areas[nome];
    let pontos = [];
    for (let y = 0; y < area.altura; y++) {
        for (let x = 0; x < area.largura; x++) {
            let tp = tipoTile[area.mapa[y][x]];
            if (nome === "sala") {
                if (tp.mesa && !ehMesaProfessor(x, y)) pontos.push({ x: x, y: y });
            } else if (tp.nome === "chao" && !pertoDePorta(nome, x, y)) {
                pontos.push({ x: x, y: y });
            }
        }
    }
    return pontos;
}

// sorteia as peças do catálogo entre as áreas e escolhe um lugar para cada uma
function gerarItens() {
    itens = [];
    let pecas = embaralhar(PECAS.slice());
    let proxima = 0;
    for (let nome in PECAS_POR_AREA) {
        let escolhidos = [];
        for (let ponto of embaralhar(pontosDePeca(nome))) {
            if (escolhidos.length >= PECAS_POR_AREA[nome]) break;
            // sem peças coladas, para nunca fecharem um caminho
            let colada = escolhidos.some(e => Math.abs(e.x - ponto.x) <= 1 && Math.abs(e.y - ponto.y) <= 1);
            if (!colada) escolhidos.push(ponto);
        }
        for (let ponto of escolhidos) {
            if (proxima >= pecas.length) break;
            itens.push({ area: nome, x: ponto.x, y: ponto.y, peca: pecas[proxima], coletado: false });
            proxima++;
        }
    }
}

function itemNoTile(x, y) {
    for (let it of itens) {
        if (!it.coletado && it.area === nomeArea && it.x === x && it.y === y) return it;
    }
    return null;
}

function professorNoTile(x, y) {
    return nomeArea === "sala" && professor.x === x && professor.y === y;
}

// ---- caixa de mensagem: abrir, avançar página, escolher e fechar ----
// divide um texto em páginas de 2 linhas (para caber na caixa)
function paginarTexto(texto) {
    ctx.font = "bold 10px monospace";
    let linhas = quebrarTexto(texto, LARGURA_TEXTO_CAIXA);
    let paginas = [];
    for (let i = 0; i < linhas.length; i += LINHAS_POR_PAGINA) {
        paginas.push(linhas.slice(i, i + LINHAS_POR_PAGINA).join(" "));
    }
    return paginas;
}

function abrirMensagem(conteudo, extras) {
    let textos = Array.isArray(conteudo) ? conteudo : [conteudo];
    let paginas = [];
    for (let t of textos) paginas.push(...paginarTexto(t));
    mensagem = Object.assign({
        paginas: paginas,
        pagina: 0,
        cursor: 0,
    }, extras || {});
}

// o menu SIM / NÃO está aparecendo? (só na última página)
function menuAberto() {
    return !!mensagem && !!mensagem.opcoes && mensagem.pagina === mensagem.paginas.length - 1;
}

function avancarMensagem() {
    if (mensagem.pagina < mensagem.paginas.length - 1) mensagem.pagina++;
    else if (mensagem.opcoes) escolherOpcao();
    else fecharMensagem();
}

// espaço no menu: fecha a caixa e avisa qual opção foi escolhida (0 = SIM, 1 = NÃO)
function escolherOpcao() {
    let m = mensagem;
    mensagem = null;
    if (m.aoEscolher) m.aoEscolher(m.cursor);
}

function falarComProfessor() {
    professor.direcao = direcaoOposta[jogador.direcao];     // o professor vira para o player
    if (!professor.falou) {
        // primeira conversa: sorteia o pedido e conta a história
        pedidoAtual = PEDIDOS[Math.floor(Math.random() * PEDIDOS.length)];
        abrirMensagem([pedidoAtual.fala, pedidoAtual.pedido + " Encontre as peças."], { aoFechar: iniciarBusca });
    } else {
        abrirMensagem(MSG_PROFESSOR_REPETE);
    }
}

// pegar ou trocar uma peça: mostra a descrição e pergunta se o player quer
function interagirComPeca(it) {
    let peca = it.peca;
    let atual = mochila[peca.tipo];
    let pergunta = atual
        ? "Você já tem " + atual.nome + ". Trocar por " + peca.nome + "?"
        : "Pegar " + peca.nome + "?";
    abrirMensagem([peca.nome + ": " + peca.descricao, pergunta], {
        opcoes: ["SIM", "NÃO"],
        aoEscolher: function (escolha) { if (escolha === 0) pegarPeca(it); },
    });
}

function pegarPeca(it) {
    let peca = it.peca;
    let antiga = mochila[peca.tipo];
    mochila[peca.tipo] = peca;
    if (antiga) {
        it.peca = antiga;       // a peça antiga fica no lugar da que foi pega
        abrirMensagem("Você pegou " + peca.nome + " e deixou " + antiga.nome + " no lugar.");
    } else {
        it.coletado = true;
        abrirMensagem("Você pegou " + peca.nome + "!");
    }
}

// mesa do professor (depois da conversa): pergunta se o player quer montar o computador
function interagirMesaProfessor() {
    let faltam = TIPOS_PECA.filter(tipo => !mochila[tipo]);
    let paginas = [];
    if (faltam.length > 0) paginas.push("Ainda faltam peças: " + faltam.join(", ") + ".");
    paginas.push("Montar o computador com as peças que você pegou?");
    abrirMensagem(paginas, {
        opcoes: ["SIM", "NÃO"],
        aoEscolher: function (escolha) { if (escolha === 0) montarComputador(); },
    });
}

// maior nota possível no pedido (melhor peça de cada tipo x peso do tipo)
function notaMaxima(pedido) {
    let total = 0;
    for (let tipo of TIPOS_PECA) {
        let melhor = Math.max(...PECAS.filter(p => p.tipo === tipo).map(p => p.notas[pedido.id]));
        total += pedido.pesos[tipo] * melhor;
    }
    return total;
}

// soma (nota da peça x peso do tipo) para o pedido e mostra a tela de fim de jogo
function montarComputador() {
    let pontos = 0;
    for (let tipo of TIPOS_PECA) {
        if (mochila[tipo]) pontos += pedidoAtual.pesos[tipo] * mochila[tipo].notas[pedidoAtual.id];
    }
    let maximo = notaMaxima(pedidoAtual);
    let frase;
    if (pontos >= maximo * 0.85) frase = "Montagem perfeita!";
    else if (pontos >= maximo * 0.6) frase = "Boa montagem.";
    else if (pontos >= maximo * 0.4) frase = "Funciona, mas dava para melhorar.";
    else frase = "Esse computador não serve para a prova...";
    resultadoFinal = ["Pedido: " + pedidoAtual.nome, "Nota: " + pontos + " de " + maximo, frase];
    gameOver = true;
    gameOverEm = performance.now();
}

// espaço com a caixa fechada: interage com o que está na frente do player
function interagir() {
    if (movendo) return;
    let d = direcoes[jogador.direcao];
    let fx = jogador.x + d.dx;
    let fy = jogador.y + d.dy;

    if (professorNoTile(fx, fy)) {
        falarComProfessor();
        return;
    }

    let it = itemNoTile(fx, fy);
    if (it) {
        interagirComPeca(it);
        return;
    }
    if (buscaAtiva && nomeArea === "sala" && ehMesaProfessor(fx, fy)) {
        interagirMesaProfessor();
        return;
    }
    if (fx >= 0 && fy >= 0 && fx < mundoLargura && fy < mundoAltura) {
        let texto = tipoTile[mapa[fy][fx]].mensagem;
        if (texto) abrirMensagem(texto);
    }
}

// espaço na última página de uma mensagem sem menu: fecha a caixa
function fecharMensagem() {
    let m = mensagem;
    if (m.aoAndar) esperarSoltar = true;     // não reabre a mensagem enquanto a tecla continuar apertada
    mensagem = null;
    if (m.aoFechar) m.aoFechar();
}

function redimensionar() {
    // maior número inteiro de ampliação (1x, 2x, 3x...) que cabe na janela
    let escala = Math.max(1, Math.floor(Math.min(window.innerWidth / LARGURA_TELA,
                                                 window.innerHeight / ALTURA_TELA)));
    // o canvas já tem o tamanho final; o jogo continua usando coordenadas 240x160 por causa do setTransform
    canvas.width = LARGURA_TELA * escala;
    canvas.height = ALTURA_TELA * escala;
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    ctx.imageSmoothingEnabled = suavizarImagens;   // mudar o tamanho do canvas reseta isso
}

// ---- reações ao teclado (o Input chama estas funções) ----
function aoApertarEscape(repeticao) {
    if (repeticao || telaInicio || gameOver || transicao || portaAnim) return;
    alternarPausa();
}

function aoApertarEspaco(repeticao) {
    if (repeticao) return;
    if (transicao || portaAnim || pausado) return;
    if (telaInicio) {
        iniciarPartida();
    } else if (gameOver) {
        if (performance.now() - gameOverEm >= ATRASO_REINICIO) comecarIntro();
    } else if (mensagem) {
        avancarMensagem();
    } else {
        interagir();
    }
}

// com o menu SIM / NÃO aberto, cima e baixo mexem o cursor (e o player não anda)
function aoApertarDirecao(dir, repeticao) {
    if (!menuAberto()) return false;
    if (!repeticao) {
        if (dir === "up") mensagem.cursor = Math.max(0, mensagem.cursor - 1);
        if (dir === "down") mensagem.cursor = Math.min(mensagem.opcoes.length - 1, mensagem.cursor + 1);
    }
    return true;
}

// durante um passo a direção não muda; a troca acontece em atualizar(), quando o passo terminar
function aoNovaDirecao(dir) {
    if (!movendo && !mensagem && !telaInicio && !transicao && !portaAnim && !pausado && jogador.direcao !== dir) {
        jogador.direcao = dir;
        liberaGiroEm = performance.now() + TEMPO_TOQUE_RAPIDO;
    }
}

function alternarPausa() {
    let agora = performance.now();
    if (!pausado) {
        pausado = true;
        pausadoEm = agora;
    } else {
        pausado = false;
        // o tempo parado não conta, então o passo continua de onde parou
        let parado = agora - pausadoEm;
        inicioMovimento += parado;
        liberaGiroEm += parado;
        input.inicioCorrer += parado;
    }
}

function iniciarMovimento(dir, inicio) {
    let d = direcoes[dir];
    let nx = jogador.x + d.dx;
    let ny = jogador.y + d.dy;
    // andar em direção a uma porta: não anda, só começa a transição
    let porta = portaNaDirecao(jogador.x, jogador.y, dir);
    if (porta) {
        if (porta.animada) {
            // porta de fora: abre, o player entra e depois vem o fade
            portaAnim = { fase: "abrindo", inicio: performance.now(), porta: porta, tileX: nx, tileY: ny, quadro: 1 };
        } else {
            transicao = { fase: "saindo", inicio: performance.now(), porta: porta };
        }
        return;
    }
    // tile que mostra mensagem ao tentar andar para ele (pontas do corredor)
    if (nx >= 0 && ny >= 0 && nx < mundoLargura && ny < mundoAltura) {
        let msgAndar = tipoTile[mapa[ny][nx]].mensagemAoAndar;
        if (msgAndar && !esperarSoltar) {
            abrirMensagem(msgAndar, { aoAndar: true });
            bumpDir = dir;
            return;
        }
    }
    if (!podeAndar(nx, ny)) return;
    // andar ou correr é decidido quando o passo começa
    let correr = input.correr && (performance.now() - input.inicioCorrer) >= ATRASO_CORRIDA;
    correndoPasso = correr;
    duracaoPassoAtual = correr ? DURACAO_PASSO_CORRENDO : DURACAO_PASSO_ANDANDO;
    movendo = true;
    passoPar = !passoPar;
    progressoPasso = 0;
    origemMovimento = { x: jogador.x, y: jogador.y };
    destinoMovimento = { x: nx, y: ny };
    inicioMovimento = (inicio !== undefined) ? inicio : performance.now();
}

// ---- portas ----
// procura uma porta na posição (x, y) com a direção dir
function portaNaDirecao(x, y, dir) {
    for (let p of areaAtual.portas) {
        if (p.x === x && p.y === y && p.dir === dir) return p;
    }
    return null;
}

// porta abrindo: quadro 1 (entreaberta), quadro 2 (aberta) e depois o player entra
function atualizarPortaAbrindo(agora) {
    let t = agora - portaAnim.inicio;
    if (t < DURACAO_QUADRO_PORTA) { portaAnim.quadro = 1; return; }
    if (t < 2 * DURACAO_QUADRO_PORTA) { portaAnim.quadro = 2; return; }
    portaAnim.quadro = 2;
    portaAnim.fase = "entrando";
    // um passo normal (andando) para dentro da porta; quando terminar, começa o fade
    correndoPasso = false;
    duracaoPassoAtual = DURACAO_PASSO_ANDANDO;
    movendo = true;
    passoPar = !passoPar;
    progressoPasso = 0;
    origemMovimento = { x: jogador.x, y: jogador.y };
    destinoMovimento = { x: portaAnim.tileX, y: portaAnim.tileY };
    inicioMovimento = agora;
}

function atualizarTransicao(agora) {
    let t = (agora - transicao.inicio) / DURACAO_FADE;
    if (t < 1) return;
    if (transicao.fase === "saindo") {
        // tela toda preta: troca de área e coloca o player do outro lado
        let p = transicao.porta;
        usarArea(p.destino);
        jogador.x = p.destinoX;
        jogador.y = p.destinoY;
        jogador.direcao = p.destinoDir;
        camera.seguir(jogador.x, jogador.y);
        movendo = false;
        origemMovimento = { x: jogador.x, y: jogador.y };
        destinoMovimento = { x: jogador.x, y: jogador.y };
        portaAnim = null;
        transicao = { fase: "entrando", inicio: agora, porta: null };
    } else {
        transicao = null;
    }
}

// ---- loop principal: atualiza o jogo ----
function atualizar(agora) {
    if (pausado) return;
    if (transicao) { atualizarTransicao(agora); return; }
    if (portaAnim && portaAnim.fase === "abrindo") { atualizarPortaAbrindo(agora); return; }
    if (gameOver || mensagem || telaInicio) return;     // com a caixa aberta o player fica parado
    if (movendo) {
        // se apertar o ALT no meio de um passo, o resto do passo vira corrida
        if (input.correr && !correndoPasso && agora - input.inicioCorrer >= ATRASO_CORRIDA) {
            let feito = Math.min(1, (agora - inicioMovimento) / duracaoPassoAtual);
            correndoPasso = true;
            duracaoPassoAtual = DURACAO_PASSO_CORRENDO;
            inicioMovimento = agora - feito * duracaoPassoAtual;
        }
        // progresso do passo (de 0 a 1) calculado pelo tempo
        let t = Math.min(1, (agora - inicioMovimento) / duracaoPassoAtual);
        progressoPasso = t;
        camera.seguir(origemMovimento.x + (destinoMovimento.x - origemMovimento.x) * t,
                      origemMovimento.y + (destinoMovimento.y - origemMovimento.y) * t);
        if (t >= 1) {
            jogador.x = destinoMovimento.x;
            jogador.y = destinoMovimento.y;
            camera.seguir(jogador.x, jogador.y);
            movendo = false;

            // entrou no tile da porta: começa o fade para a outra área
            if (portaAnim && portaAnim.fase === "entrando") {
                portaAnim.fase = "aguardando";
                transicao = { fase: "saindo", inicio: agora, porta: portaAnim.porta };
                return;
            }

            // se ainda tem tecla apertada, o próximo passo já começa direto
            let dir = input.direcaoAtiva();
            if (dir) {
                jogador.direcao = dir;
                iniciarMovimento(dir, inicioMovimento + duracaoPassoAtual);
            }
        }
    } else {
        let dir = input.direcaoAtiva();
        if (esperarSoltar && dir !== bumpDir) esperarSoltar = false;
        if (dir) {
            if (jogador.direcao !== dir) {
                jogador.direcao = dir;
                liberaGiroEm = agora + TEMPO_TOQUE_RAPIDO;
            } else if (agora >= liberaGiroEm) {
                iniciarMovimento(dir);
            }
        }
    }
}

// ---- desenho ----
function desenharMundo() {
    // fundo preto
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    let origemX = camera.origemX;
    let origemY = camera.origemY;

    // só desenha os tiles que aparecem na tela
    let inicioX = Math.max(0, Math.floor(origemX));
    let inicioY = Math.max(0, Math.floor(origemY));
    let fimX = Math.min(mundoLargura - 1, Math.ceil(origemX + tilesVisiveisX));
    let fimY = Math.min(mundoAltura - 1, Math.ceil(origemY + tilesVisiveisY));

    let deslocX = camera.deslocX;
    let deslocY = camera.deslocY;

    for (let wy = inicioY; wy <= fimY; wy++) {
        for (let wx = inicioX; wx <= fimX; wx++) {
            let tp = tipoTile[mapa[wy][wx]];
            let tx = wx * tile - deslocX;
            let ty = wy * tile - deslocY;
            ctx.fillStyle = tp.cor;
            ctx.fillRect(tx, ty, tile, tile);
            if (tp.detalhes) {
                for (let d of tp.detalhes) {
                    ctx.fillStyle = d.cor;
                    ctx.fillRect(tx + d.x, ty + d.y, d.w, d.h);
                }
            }
            if (tp.porta) {
                // porta fechada, a não ser que seja a que está abrindo agora
                let quadro = (portaAnim && portaAnim.tileX === wx && portaAnim.tileY === wy) ? portaAnim.quadro : 0;
                for (let d of DETALHES_PORTA[quadro]) {
                    ctx.fillStyle = d.cor;
                    ctx.fillRect(tx + d.x, ty + d.y, d.w, d.h);
                }
            }
        }
    }
}

function desenharItens() {
    let deslocX = camera.deslocX;
    let deslocY = camera.deslocY;
    let tamanho = 10;       // quadrado de 10x10 no meio do tile
    for (let it of itens) {
        if (it.coletado || it.area !== nomeArea) continue;
        let px = it.x * tile - deslocX + (tile - tamanho) / 2;
        let py = it.y * tile - deslocY + (tile - tamanho) / 2;
        // quadrado meio transparente na cor do tipo, com a letra do modelo no meio
        ctx.globalAlpha = ALFA_PECA;
        ctx.fillStyle = COR_TIPO[it.peca.tipo];
        ctx.fillRect(px, py, tamanho, tamanho);
        ctx.globalAlpha = 0.9;
        desenharLetraPeca(it.peca.letra, px + tamanho / 2, py + tamanho / 2, 8);
    }
    ctx.globalAlpha = 1;
}

// letra branca com sombra preta, centralizada em (cx, cy)
function desenharLetraPeca(letra, cx, cy, tamanhoFonte) {
    ctx.font = "bold " + tamanhoFonte + "px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#000000";
    ctx.fillText(letra, cx + 1, cy + 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(letra, cx, cy);
}

// seta branca no tile da porta, quando o player está parado no tapete
function desenharSetasPorta() {
    let deslocX = camera.deslocX;
    let deslocY = camera.deslocY;
    for (let p of areaAtual.portas) {
        if (p.animada) continue;     // portas de fora não têm seta
        // só a seta da porta onde o player está parado
        if (movendo || jogador.x !== p.x || jogador.y !== p.y) continue;
        let d = direcoes[p.dir];
        let cx = (p.x + d.dx) * tile - deslocX + tile / 2;
        let cy = (p.y + d.dy) * tile - deslocY + tile / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(ANGULO_SETA[p.dir]);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-2, -6, 4, 6);         // haste
        for (let i = 0; i < 5; i++) {       // ponta da seta
            ctx.fillRect(-5 + i, i, 10 - 2 * i, 1);
        }
        ctx.restore();
    }
}

// escurece a tela durante a troca de área
function desenharFade(agora) {
    if (!transicao) return;
    let t = Math.min(1, Math.max(0, (agora - transicao.inicio) / DURACAO_FADE));
    let alfa = transicao.fase === "saindo" ? t : 1 - t;
    alfa = Math.round(alfa * 8) / 8;       // em degraus, para parecer jogo antigo
    if (alfa <= 0) return;
    ctx.fillStyle = "rgba(0, 0, 0, " + alfa + ")";
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);
}

// escolhe a linha do atlas pela animação:
//  andando: metade do tile com o pé levantado e metade parado
//  correndo: 5/8 do tile com o pé e o resto no quadro do meio
// o pé alterna entre A e B a cada tile
function linhaDoJogador() {
    if (!movendo) return LINHA_PARADO;
    let pe = passoPar ? 1 : 0;
    if (correndoPasso) {
        return progressoPasso < 5 / 8 ? LINHA_CORRER + pe : LINHA_INTERMEDIARIO;
    }
    return progressoPasso < 0.5 ? LINHA_ANDAR + pe : LINHA_PARADO;
}

function desenharJogador() {
    // o player sempre fica no centro da tela (120, 80)
    if (jogador.atlas.pronto()) {
        jogador.atlas.desenhar(ctx, LARGURA_TELA / 2, ALTURA_TELA / 2, jogador.direcao, linhaDoJogador());
        return;
    }
    // se a imagem não carregou: quadrado colorido (seta verde ao correr)
    let correndoAgora = movendo && input.correr && correndoPasso;
    desenharBoneco(LARGURA_TELA / 2, ALTURA_TELA / 2, jogador.direcao, "#a233c9", correndoAgora ? "#00ff07" : "#e8203b");
}

// desenha o professor na posição dele (só aparece na sala de aula)
function desenharProfessor() {
    if (nomeArea !== "sala") return;
    let cx = professor.x * tile - camera.deslocX + tile / 2;
    let cy = professor.y * tile - camera.deslocY + tile / 2;
    if (professor.atlas.pronto()) professor.atlas.desenhar(ctx, cx, cy, professor.direcao, LINHA_PARADO);
    else desenharBoneco(cx, cy, professor.direcao, COR_NPC, COR_SETA_NPC);
}

// quadrado 10x10 com uma seta mostrando a direção
function desenharBoneco(cx, cy, direcao, corCorpo, corSeta) {
    let tamanho = 10;
    let m = tamanho / 2;

    ctx.fillStyle = corCorpo;
    ctx.fillRect(cx - m, cy - m, tamanho, tamanho);

    ctx.fillStyle = corSeta;
    let a = 3;
    ctx.beginPath();
    if (direcao === "up") {
        ctx.moveTo(cx, cy - m - a);
        ctx.lineTo(cx - a, cy - m);
        ctx.lineTo(cx + a, cy - m);
    } else if (direcao === "down") {
        ctx.moveTo(cx, cy + m + a);
        ctx.lineTo(cx - a, cy + m);
        ctx.lineTo(cx + a, cy + m);
    } else if (direcao === "left") {
        ctx.moveTo(cx - m - a, cy);
        ctx.lineTo(cx - m, cy - a);
        ctx.lineTo(cx - m, cy + a);
    } else {
        ctx.moveTo(cx + m + a, cy);
        ctx.lineTo(cx + m, cy - a);
        ctx.lineTo(cx + m, cy + a);
    }
    ctx.closePath();
    ctx.fill();
}

function desenharHud() {
    let tamanho = 12;
    let espaco = 4;
    let margem = 4;
    let y = margem;
    // um quadrado para cada tipo de peça, só depois da conversa com o professor
    // com a peça: cor cheia e a letra do modelo | sem a peça: cor transparente e sem letra
    if (buscaAtiva) {
        for (let i = 0; i < TIPOS_PECA.length; i++) {
            let peca = mochila[TIPOS_PECA[i]];
            let hx = margem + i * (tamanho + espaco);
            ctx.fillStyle = COR_TIPO[TIPOS_PECA[i]];
            ctx.globalAlpha = peca ? 1 : 0.4;
            ctx.fillRect(hx, y, tamanho, tamanho);
            ctx.globalAlpha = 1;
            if (peca) desenharLetraPeca(peca.letra, hx + tamanho / 2, y + tamanho / 2, 9);
        }
    }

    // "R" aparece ao segurar o ALT (só com o jogo rodando)
    if (input.correr && !telaInicio && !gameOver && !pausado) {
        let rx = margem + (buscaAtiva ? TIPOS_PECA.length * (tamanho + espaco) : 0);
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000000";
        ctx.fillText("R", rx + 1, y + tamanho / 2 + 1);     // sombra
        ctx.fillStyle = "#ffffff";
        ctx.fillText("R", rx, y + tamanho / 2);
    }
}

// quebra o texto em linhas que cabem na largura máxima (em pixels)
function quebrarTexto(texto, larguraMax) {
    let linhas = [];
    let atual = "";
    for (let palavra of texto.split(" ")) {
        let tentativa = atual ? atual + " " + palavra : palavra;
        if (atual && ctx.measureText(tentativa).width > larguraMax) {
            linhas.push(atual);
            atual = palavra;
        } else {
            atual = tentativa;
        }
    }
    if (atual) linhas.push(atual);
    return linhas;
}

function desenharCaixaMensagem() {
    let x = 1, y = 113, w = 238, h = 44;
    let borda = 4;

    // borda com os cantos cortados
    ctx.fillStyle = COR_CAIXA_BORDA;
    ctx.fillRect(x + 2, y, w - 4, h);
    ctx.fillRect(x, y + 2, w, h - 4);

    // fundo
    ctx.fillStyle = COR_CAIXA_FUNDO;
    let ix = x + borda, iy = y + borda, iw = w - 2 * borda, ih = h - 2 * borda;
    ctx.fillRect(ix + 1, iy, iw - 2, ih);
    ctx.fillRect(ix, iy + 1, iw, ih - 2);

    // texto (aparece inteiro de uma vez)
    ctx.fillStyle = COR_CAIXA_TEXTO;
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let linhas = quebrarTexto(mensagem.paginas[mensagem.pagina], LARGURA_TEXTO_CAIXA);
    for (let i = 0; i < linhas.length; i++) {
        ctx.fillText(linhas[i], x + 15, y + 14 + i * 16);
    }

    if (menuAberto()) desenharMenuEscolha();

    // setinha piscando quando ainda tem mais páginas
    if (mensagem.pagina < mensagem.paginas.length - 1 && Math.floor(performance.now() / 400) % 2 === 0) {
        let ax = x + w - 18, ay = y + h - 16;
        ctx.fillStyle = COR_CAIXA_TEXTO;
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(ax + i, ay + i, 8 - 2 * i, 1);
        }
    }
}

// menu de escolha (SIM / NÃO) no canto de cima da caixa de mensagem, com o cursor na opção atual
function desenharMenuEscolha() {
    let w = 44, h = 40;
    let x = 239 - w, y = 113 - h;       // encostado na caixa de mensagem, alinhado à direita
    let borda = 4;

    // borda e fundo (mesmo visual da caixa de mensagem)
    ctx.fillStyle = COR_CAIXA_BORDA;
    ctx.fillRect(x + 2, y, w - 4, h);
    ctx.fillRect(x, y + 2, w, h - 4);
    ctx.fillStyle = COR_CAIXA_FUNDO;
    let ix = x + borda, iy = y + borda, iw = w - 2 * borda, ih = h - 2 * borda;
    ctx.fillRect(ix + 1, iy, iw - 2, ih);
    ctx.fillRect(ix, iy + 1, iw, ih - 2);

    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = COR_CAIXA_TEXTO;
    for (let i = 0; i < mensagem.opcoes.length; i++) {
        let cy = iy + 8 + i * 16;
        ctx.fillText(mensagem.opcoes[i], ix + 13, cy);
        if (i === mensagem.cursor) {
            for (let k = 0; k < 4; k++) {       // cursor: triângulo apontando para a direita
                ctx.fillRect(ix + 3 + k, cy - 3 + k, 1, 7 - 2 * k);
            }
        }
    }
}

// tela escura com título, subtítulo e (opcional) linhas de texto pequeno
function desenharTela(titulo, subtitulo, linhas) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, LARGURA_TELA, ALTURA_TELA);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px monospace";
    ctx.fillText(titulo, LARGURA_TELA / 2, ALTURA_TELA / 2);

    ctx.font = "8px monospace";
    ctx.fillText(subtitulo, LARGURA_TELA / 2, ALTURA_TELA / 2 + 14);

    if (linhas) {
        ctx.font = "7px monospace";
        ctx.fillStyle = "#d0d0d0";
        for (let i = 0; i < linhas.length; i++) {
            ctx.fillText(linhas[i], LARGURA_TELA / 2, ALTURA_TELA / 2 + 36 + i * 10);
        }
    }
}

// Ordem de desenho: quem está mais embaixo no mapa (y maior) é desenhado por último e fica na frente.
// O sprite é mais alto que o tile (24 px), então a cabeça de quem está embaixo cobre os pés de quem está em cima.
// Para um NPC novo, é só colocar ele na lista.
function desenharPersonagens() {
    let lista = [{ y: camera.y, desenhar: desenharJogador }];
    if (!telaInicio) lista.push({ y: professor.y, desenhar: desenharProfessor });
    lista.sort((a, b) => a.y - b.y);
    for (let e of lista) e.desenhar();
}

// chamado a cada quadro da tela
function desenhar(agora) {
    atualizar(agora);
    desenharMundo();
    if (!telaInicio) desenharItens();
    if (!telaInicio) desenharSetasPorta();
    desenharPersonagens();
    desenharHud();
    if (mensagem) desenharCaixaMensagem();
    desenharFade(agora);
    if (telaInicio) desenharTela("ENCONTRE AS PEÇAS", "barra de espaço para iniciar", LINHAS_CONTROLES);
    if (gameOver) desenharTela("FIM DE JOGO", "barra de espaço para reiniciar", resultadoFinal);
    if (pausado) desenharTela("JOGO PAUSADO", "pressione esc para despausar", LINHAS_CONTROLES);
    requestAnimationFrame(desenhar);
}

window.addEventListener("load", init);
