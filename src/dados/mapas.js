// ---- mapa da sala de aula ----
// . = chão | D = mesa vazia | C = mesa com computador | E = computador do professor
// T = tapete da saída | W = parede
// Tamanho: 19 colunas x 16 linhas (2 de parede no topo). A mesa do professor fica na coluna 17.
// A coluna 0 (fundo da sala) fica só com mesas, sem computadores.
// O corredor da sala são as linhas 8 e 9. A saída é embaixo, no tapete (coluna 17).
const layoutSala = [
    "WWWWWWWWWWWWWWWWWWW",   //  0  parede
    "WWWWWWWWWWWWWWWWWWW",   //  1  parede
    "D.D.D.D.D.D.D.D..D.",   //  2
    "D.C.C.C.C.C.C.C..E.",   //  3
    "D.D.D.D.D.D.D.D..D.",   //  4
    "D.C.C.C.C.C.C.C....",   //  5
    "D.D.D.D.D.D.D.D....",   //  6
    "D.C.C.C.C.C.C.C....",   //  7
    "...................",   //  8  corredor da sala
    "...................",   //  9  corredor da sala
    "D.C.C.C.C.C.C.C....",   // 10
    "D.D.D.D.D.D.D.D....",   // 11
    "D.C.C.C.C.C.C.C....",   // 12
    "D.D.D.D.D.D.D.D....",   // 13
    "D.C.C.C.C.C.C.C....",   // 14
    "D.D.D.D.D.D.D.D..T.",   // 15  tapete da saída (a porta fica logo abaixo, fora do mapa)
];

// Corredor (área aberta): 25 x 5 tiles. P = porta de uma sala (colunas 7 e 17).
// Nas pontas, 3 tiles de degradê escuro.
const layoutCorredor = [
    "WWWWWWWWWWWWWWWWWWWWWWWWW",   //  0  parede
    "WWWWWWWPWWWWWWWWWPWWWWWWW",   //  1  portas das salas
    "321...................123",   //  2
    "321...................123",   //  3
    "321...................123",   //  4
];

// Sala de TI: 6 x 9 tiles, com 2 tapetes de saída (colunas 2 e 3)
const layoutTI = [
    "WWWWWW",   //  0  parede
    "WWWWWW",   //  1  parede
    "......",   //  2
    "......",   //  3
    "......",   //  4
    "......",   //  5
    "......",   //  6
    "......",   //  7
    "..TT..",   //  8  tapetes de saída
];

// ---- áreas ----
// Cada área é um mapa separado. As portas ligam uma área a outra.
// Cada porta tem: posição (x, y), direção (dir) e o destino (onde o player aparece).
// animada = true: porta de fora do corredor (abre com animação).
// animada = false: saída com tapete (só faz o fade).

// transforma o layout (texto) em uma área com matriz de tiles
function criarArea(layout, portas) {
    return {
        mapa: layout.map(linha => [...linha].map(c => charParaTile[c])),
        largura: layout[0].length,
        altura: layout.length,
        portas: portas,
    };
}

const areas = {
    sala: criarArea(layoutSala, [
        { x: 17, y: 15, dir: "down", destino: "corredor", destinoX: 17, destinoY: 2, destinoDir: "down" },
    ]),
    ti: criarArea(layoutTI, [
        { x: 2, y: 8, dir: "down", destino: "corredor", destinoX: 7, destinoY: 2, destinoDir: "down" },
        { x: 3, y: 8, dir: "down", destino: "corredor", destinoX: 7, destinoY: 2, destinoDir: "down" },
    ]),
    corredor: criarArea(layoutCorredor, [
        { x: 7,  y: 2, dir: "up", animada: true, destino: "ti",   destinoX: 2,  destinoY: 8,  destinoDir: "up" },
        { x: 17, y: 2, dir: "up", animada: true, destino: "sala", destinoX: 17, destinoY: 15, destinoDir: "up" },
    ]),
};

// começo do jogo: o player aparece na sala de TI, olhando para a direita
const inicioAreaNome = "ti";
const inicioJogadorX = 1;
const inicioJogadorY = 5;
const inicioJogadorDirecao = "right";

// mesa do professor (coluna 17, linhas 2 a 4): não tem peças e é onde o computador é montado
function ehMesaProfessor(x, y) {
    return x === 17 && y >= 2 && y <= 4;
}
