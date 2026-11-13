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
// animação de pegar a peça: tempo de cada um dos 5 quadros do atlas (ms)
// o último quadro (peça levantada) fica parado um pouco mais
const DURACOES_COLETA = [134, 134, 134, 134, 500];

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

// ---- janelas (vidro contínuo na parede) ----
const COR_JANELA = "#1d2c57";            // vidro (azul navy)
const COR_JANELA_SOMBRA = "#16224a";     // sombra logo abaixo do topo
const COR_JANELA_REFLEXO_1 = "#34508f";  // reflexo forte
const COR_JANELA_REFLEXO_2 = "#2a4078";  // reflexo suave
const COR_JANELA_CONTORNO = "#1a1a1a";   // contorno (topo e pontas)
const JANELA_CONTORNO_EMBAIXO = true;   // linha embaixo do vidro, igual ao topo e às pontas

// ---- mesas na diagonal (perspectiva do Pokémon Emerald) ----
const SOBRA_TOPO_MESA = 4;          // pixels que o topo da mesa invade o tile de cima
const ALTURA_FRENTE_MESA = 4;       // altura da frente da mesa, dentro do último tile
const COR_MESA_BORDA = "#8f949c";   // contorno
const COR_MESA_FRENTE = "#b9bec6";  // lateral (frente) da mesa
const COR_MESA_BASE = "#7c818a";    // linha escura embaixo da frente

// ---- computadores ----
const COR_TELA = "#6f9bd1";         // tela do monitor
const COR_SUPORTE = "#7a7a7a";      // pé do monitor
const COR_TECLAS = "#6a6a6a";       // fileira clara do teclado
const COR_COSTAS_MONITOR = "#4a4a4a";

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
// peça na mão do player durante a coleta (quadrado da cor do tipo + letra, como no mapa)
const TAMANHO_PECA_MAO = 8;
const ALFA_PECA_MAO = 1;        // 1 = cor cheia (como no HUD); use ALFA_PECA para ficar igual ao mapa
// centro da peça dentro da célula 24x24 de cada quadro da coleta (null = sem peça na mão)
const PECA_NA_MAO = [null, null, { x: 12, y: 16 }, { x: 4, y: 11 }, { x: 5, y: 10 }];

// ---- NPC placeholder (quando a imagem não carrega) ----
const COR_NPC = "#1f9d8b";
const COR_SETA_NPC = "#e8203b";

// ângulo da seta de cada direção (a seta é desenhada apontando para baixo)
const ANGULO_SETA = { down: 0, left: Math.PI / 2, up: Math.PI, right: -Math.PI / 2 };

// evita reiniciar sem querer logo depois da última peça
const ATRASO_REINICIO = 500;

// ---- HUD das peças ----
const HUD_SLOT_L = 22;          // largura de cada slot (cabe a maior célula, 21)
const HUD_SLOT_A = 26;          // altura de cada slot (cabe a maior célula, 26)
const HUD_ESPACO = 3;           // espaço entre slots
const COR_HUD_FUNDO = "#000000";
const HUD_ALFA_FUNDO = 0;     // fundo do slot meio transparente
const HUD_ALFA_VAZIO = 0.5;           // slot vazio com cor cheia
const COR_HUD_VAZIO = "#303030";    // interior do slot vazio (cor do contorno das peças)

const MOSTRAR_R_CORRER = false;     // true = mostra o "R" no HUD ao segurar o ALT (indicador de teste)

// cores do placeholder (mesma ordem dos atlas: vermelho, azul, amarelo, verde)
const COR_PECA_HUD = ["#990030", "#2f3699", "#ffcc00", "#22b14c"];
// texto do placeholder, para tipos que ainda não têm atlas
const TEXTO_PLACEHOLDER_HUD = { "placa de vídeo": "GPU" };

// ---- timer da coleta ----
const TEMPO_LIMITE_SEGUNDOS = 120;      // tempo para achar as peças e montar o PC (180 = 3 minutos)
const TIMER_PARA_NA_MENSAGEM = true;    // true = o tempo congela enquanto a caixa de mensagem está aberta

// ---- caixas no chão ----
// pequenos desvios (em pixels) dentro do tile; cada caixa sorteia um deles ao ser gerada
const DESVIOS_CAIXA = [
    { x: 0,  y: 0 },
    { x: -2, y: 1 },
    { x: 2,  y: -1 },
    { x: 1,  y: 2 },
    { x: -1, y: -2 },
];