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

// Porta de fora: um quadrado cinza escuro de 1 tile, com 3 quadros:
// 0 = fechada | 1 = entreaberta | 2 = totalmente aberta
// "detalhes" são retângulos (x, y, largura, altura) desenhados em cima da cor do tile
const DETALHES_PORTA = [
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA } ],
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA }, { x: 0, y: 0, w: 6, h: 16, cor: COR_PORTA_VAO } ],
    [ { x: 0, y: 0, w: 16, h: 16, cor: COR_PORTA_VAO } ],
];

// solido = bloqueia o player | mesa = pode ter peça | mensagem = texto ao interagir
const tipoTile = [
    { nome: "chao", cor: "#c4c4c4", solido: false, mesa: false },
    { nome: "mesa", cor: "#ffffff", solido: true, mesa: true },
    { nome: "mesa com computador", cor: "#ffffff", solido: true, mesa: true,
      mensagem: "Este é um computador de ALUNO.", detalhes: [
        { x: 9,  y: 2,  w: 5,  h: 12, cor: COR_ESCURA },   // monitor
        { x: 3,  y: 1,  w: 3,  h: 10, cor: COR_ESCURA },   // teclado
        { x: 4,  y: 13, w: 3,  h: 2, cor: COR_ESCURA },    // mouse
    ] },
    // computador do professor: igual ao do aluno, mas virado para o outro lado
    { nome: "mesa com computador invertido", cor: "#ffffff", solido: true, mesa: true,
      mensagem: "Este é um computador do PROFESSOR.", detalhes: [
        { x: 2,  y: 2,  w: 5,  h: 12, cor: COR_ESCURA },   // monitor
        { x: 10, y: 1,  w: 3,  h: 10, cor: COR_ESCURA },   // teclado
        { x: 9,  y: 13, w: 3,  h: 2, cor: COR_ESCURA },    // mouse
    ] },
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
];

// cada letra dos mapas vira um tile
const charParaTile = {
    ".": TILE_CHAO, "D": TILE_MESA, "C": TILE_MESA_PC, "E": TILE_MESA_PC_INVERTIDO,
    "T": TILE_TAPETE, "1": TILE_CHAO_FADE_1, "2": TILE_CHAO_FADE_2, "3": TILE_CHAO_FADE_3,
    "W": TILE_PAREDE, "P": TILE_PORTA,
};
