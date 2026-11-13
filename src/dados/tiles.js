// ---- tipos de tile ----
// Cada número é um tipo de tile (a posição na lista tipoTile). Por enquanto são só cores.
const TILE_CHAO = 0;
const TILE_MESA = 1;
const TILE_MESA_PC = 2;
const TILE_MESA_PC_INVERTIDO = 3;
const TILE_TAPETE = 4;
const TILE_CHAO_FADE_1 = 5;       // pontas do corredor: o chão vai escurecendo (1 = claro, 3 = escuro)
const TILE_CHAO_FADE_2 = 6;
const TILE_CHAO_FADE_3 = 7;
const TILE_PAREDE = 8;            // parede (2 tiles de altura no topo de cada área)
const TILE_PORTA = 9;             // porta de fora (no corredor)
const TILE_JANELA = 10;           // vidro na parede (linha de cima)
const TILE_MESA_PC_TI = 11;       // computador da sala de TI (mesmo visual do aluno, outra mensagem)
const TILE_CADEIRA_ALUNO = 12;        // cadeira virada para a direita (aluno e computadores da TI)
const TILE_CADEIRA_PROFESSOR = 13;    // cadeira virada para a esquerda

// Porta de fora: um quadrado cinza escuro de 1 tile, com 3 quadros:
// 0 = fechada | 1 = entreaberta | 2 = totalmente aberta
// "detalhes" são retângulos (x, y, largura, altura) desenhados em cima da cor do tile
const DETALHES_PORTA = [
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA } ],
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA }, { x: 0, y: 0, w: 6, h: 16, cor: COR_PORTA_VAO } ],
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA_VAO } ],
];

// ---- desenho de tiles em texto ----
// Cada caractere é 1 pixel do tile (16x16). "." = transparente.
// Os desenhos viram a lista "detalhes" (retângulos) que o main.js já sabe desenhar.
const PALETA_SETUP = {
    K: "#141414",    // contorno
    w: "#5b606a",    // topo do monitor
    y: "#2e3138",    // moldura da tela
    b: "#6f9bd1",    // tela
    B: "#b0d0f2",    // brilho da tela
    g: "#43474f",    // lateral do monitor
    p: "#4a4e56",    // pé do monitor
    k: "#4a4e57",    // parte de cima do teclado e do mouse
    m: "#6e737d",    // teclas (detalhe claro)
    n: "#26282d",    // frente do teclado
    c: "#4a4e57",    // mouse
};

function pixelsParaDetalhes(linhas, paleta, yInicio) {
    let detalhes = [];
    for (let i = 0; i < linhas.length; i++) {
        let x = 0;
        while (x < linhas[i].length) {
            let c = linhas[i][x];
            if (c === ".") { x++; continue; }
            let inicio = x;
            while (x < linhas[i].length && linhas[i][x] === c) x++;
            detalhes.push({ x: inicio, y: yInicio + i, w: x - inicio, h: 1, cor: paleta[c] });
        }
    }
    return detalhes;
}

// aluno: senta à esquerda, tela virada para a esquerda (16 linhas: a 1ª fica 4 px acima do tile)
const PIXELS_SETUP_ALUNO = [
    ".......KK.......",
    "......KwwKK.....",
    ".....KywwwwKK...",
    ".....KyyyywwgK..",
    ".....KyBbbyggK..",
    ".....KybbbyggK..",
    ".....KyyyyyggK..",
    "......KKKKKggK..",
    ".......KppKKK...",
    "......KKKKK.....",
    "...KKKKKK.......",
    "..KkmkmkKK......",
    "..KkkkkkkK.KK...",
    "..KnnnnnnK.KcK..",
    "...KKKKKKK.KKK..",
    "................",
];

// professor: o espelho do aluno, tela virada para a direita
const PIXELS_SETUP_PROFESSOR = [
    ".......KK.......",
    ".....KKwwK......",
    "...KKwwwwyK.....",
    "..KgwwyyyyK.....",
    "..KggybbByK.....",
    "..KggybbbyK.....",
    "..KggyyyyyK.....",
    "..KggKKKKK......",
    "...KKKppK.......",
    ".....KKKKK......",
    ".......KKKKKK...",
    "......KKkmkmkK..",
    "...KK.KkkkkkkK..",
    "..KcK.KnnnnnnK..",
    "..KKK.KKKKKKK...",
    "................",
];

// cadeira: virada para a direita, empurrada para a mesa (o assento passa por baixo da mesa à direita)
// ela termina na borda do tile, então a mesa vizinha parece cobrir o assento
const PALETA_CADEIRA = {
    K: "#141414",    // contorno e perna
    N: "#3b78c4",    // tecido (topo do assento e luz do encosto)
    n: "#2a5ea8",    // tecido
    d: "#1c447d",    // tecido escuro (frente do assento)
    S: "#a6a6a6",    // sombra no chão
};
const PIXELS_CADEIRA_ALUNO = [
    "................",
    "................",
    ".............KK.",
    "............KNnK",
    "............KNnK",
    "............KNnK",
    "............KddK",
    ".............K..",
    ".............KKK",
    ".............KNN",
    ".............Knn",
    ".............Kdd",
    ".............KKK",
    "..............K.",
    "..............K.",
    "..............KS",
];
// a do professor é a mesma, espelhada
const PIXELS_CADEIRA_PROFESSOR = PIXELS_CADEIRA_ALUNO.map(linha => [...linha].reverse().join(""));

// solido = bloqueia o player | mesa = pode ter peça | mensagem = texto ao interagir
const tipoTile = [
    { nome: "chao", cor: "#c4c4c4", solido: false, mesa: false },
    { nome: "mesa", cor: "#ffffff", solido: true, mesa: true },
    { nome: "mesa com computador", cor: "#ffffff", solido: true, mesa: true, computador: true,
    mensagem: "Este é um computador de ALUNO.",
    detalhes: pixelsParaDetalhes(PIXELS_SETUP_ALUNO, PALETA_SETUP, -4) },
    // computador do professor: igual ao do aluno, mas virado para o outro lado
    { nome: "mesa com computador invertido", cor: "#ffffff", solido: true, mesa: true, computador: true,
    mensagem: "Este é um computador do PROFESSOR.",
    detalhes: pixelsParaDetalhes(PIXELS_SETUP_PROFESSOR, PALETA_SETUP, -4) },
    // tapete na frente da porta de saída das salas
    { nome: "tapete", cor: COR_TAPETE_FUNDO, solido: false, mesa: false, detalhes: [
        { x: 3,  y: 3,  w: 10, h: 1,  cor: COR_TAPETE_LINHA },   // linha de cima
        { x: 3,  y: 12, w: 10, h: 1,  cor: COR_TAPETE_LINHA },   // linha de baixo
        { x: 3,  y: 4,  w: 1,  h: 8,  cor: COR_TAPETE_LINHA },   // linha da esquerda
        { x: 12, y: 4,  w: 1,  h: 8,  cor: COR_TAPETE_LINHA },   // linha da direita
    ] },
    // pontas do corredor: o 1º degrau dá para andar; o 2º mostra uma mensagem; o 3º é só o final do degradê
    { nome: "chao fade 1", cor: COR_FADE_1, solido: false, mesa: false },
    { nome: "chao fade 2", cor: COR_FADE_2, solido: true, mesa: false, mensagemAoAndar: MSG_BORDA_CORREDOR },
    { nome: "chao fade 3", cor: COR_FADE_3, solido: true, mesa: false },
    { nome: "parede", cor: COR_PAREDE, solido: true, mesa: false },
    { nome: "porta", cor: COR_PAREDE, solido: true, mesa: false, porta: true },
    { nome: "janela", cor: COR_JANELA, solido: true, mesa: false, janela: true },
    // computador da sala de TI: igual ao do aluno, só muda a mensagem
    { nome: "mesa com computador TI", cor: "#ffffff", solido: true, mesa: true, computador: true,
    mensagem: "Este é um computador da TI.",
    detalhes: pixelsParaDetalhes(PIXELS_SETUP_ALUNO, PALETA_SETUP, -4) },
    // cadeiras: chão sem colisão, com o desenho por cima
    { nome: "cadeira", cor: "#c4c4c4", solido: false, mesa: false,
    detalhes: pixelsParaDetalhes(PIXELS_CADEIRA_ALUNO, PALETA_CADEIRA, 0) },
    { nome: "cadeira professor", cor: "#c4c4c4", solido: false, mesa: false,
    detalhes: pixelsParaDetalhes(PIXELS_CADEIRA_PROFESSOR, PALETA_CADEIRA, 0) },
];

// cada letra dos mapas vira um tile
const charParaTile = {
    ".": TILE_CHAO, "D": TILE_MESA, "C": TILE_MESA_PC, "E": TILE_MESA_PC_INVERTIDO,
    "T": TILE_TAPETE, "1": TILE_CHAO_FADE_1, "2": TILE_CHAO_FADE_2, "3": TILE_CHAO_FADE_3,
    "W": TILE_PAREDE, "P": TILE_PORTA, "J": TILE_JANELA,
    "I": TILE_MESA_PC_TI, ">": TILE_CADEIRA_ALUNO, "<": TILE_CADEIRA_PROFESSOR,
};
