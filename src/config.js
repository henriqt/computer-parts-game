// ---- tela e escala (inspirado no Pokémon Emerald) ----
// O jogo é desenhado em 240x160 e depois ampliado por um número inteiro (2x, 3x...),
// assim os pixels ficam nítidos e não aparecem frestas entre os tiles.
const LARGURA_TELA = 240;
const ALTURA_TELA = 160;
const tile = 16;                                // cada tile tem 16x16 pixels
const tilesVisiveisX = LARGURA_TELA / tile;     // 15 tiles na horizontal
const tilesVisiveisY = ALTURA_TELA / tile;      // 10 tiles na vertical

// false = pixels nítidos ao ampliar as imagens; true = suavizado
const suavizarImagens = false;

// ---- tempos (em milissegundos) ----
// O movimento usa o tempo real, então é igual em qualquer monitor.
const DURACAO_PASSO_ANDANDO = 268;      // tempo para andar 1 tile
const DURACAO_PASSO_CORRENDO = 134;     // tempo para correr 1 tile
const TEMPO_TOQUE_RAPIDO = 167;         // se soltar a tecla antes disso, o player só vira (não anda)
const ATRASO_CORRIDA = 84;              // atraso entre apertar o ALT e começar a correr
const DURACAO_FADE = 268;               // tempo para escurecer e para clarear
const DURACAO_QUADRO_PORTA = 134;       // tempo de cada quadro da porta abrindo

// ---- direções e teclas ----
const direcoes = {
    up:    { dx: 0, dy: -1 },
    down:  { dx: 0, dy: 1 },
    left:  { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
};
const direcaoOposta = { up: "down", down: "up", left: "right", right: "left" };
const teclaParaDirecao = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
};

// ---- cores dos tiles ----
const COR_ESCURA = "#262626";
const COR_TAPETE_FUNDO = "#1a2f6e";     // azul escuro (cores da UniFAJ)
const COR_TAPETE_LINHA = "#f5c400";     // amarelo
const COR_FADE_1 = "#8d8d8d";
const COR_FADE_2 = "#5a5a5a";
const COR_FADE_3 = "#2b2b2b";
const COR_PAREDE = "#a0a4a8";
const COR_PORTA = "#4a4a4a";
const COR_PORTA_VAO = "#1c1c1c";

// ---- caixa de mensagem ----
const COR_CAIXA_FUNDO = "#f8f0f4";
const COR_CAIXA_TEXTO = "#3c3a3b";
const COR_CAIXA_BORDA = "#262425";
const LARGURA_TEXTO_CAIXA = 198;    // largura útil do texto dentro da caixa
const LINHAS_POR_PAGINA = 2;        // linhas de texto que cabem na caixa

// ---- sprites ----
// Linhas do atlas: 0 parado | 1 e 2 andar (pé A e B) | 3 meio da corrida | 4 e 5 correr (A e B)
const LINHA_PARADO = 0, LINHA_ANDAR = 1, LINHA_INTERMEDIARIO = 3, LINHA_CORRER = 4;
const AJUSTE_Y_SPRITE = 0;      // sobe ou desce o personagem em pixels

// ---- NPC placeholder (quando a imagem não carrega) ----
const COR_NPC = "#1f9d8b";
const COR_SETA_NPC = "#e8203b";

// ângulo da seta de cada direção (a seta é desenhada apontando para baixo)
const ANGULO_SETA = { down: 0, left: Math.PI / 2, up: Math.PI, right: -Math.PI / 2 };

// evita reiniciar sem querer logo depois da última peça
const ATRASO_REINICIO = 500;
