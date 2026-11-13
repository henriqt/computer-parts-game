// Textos do jogo
const MSG_INTRO = "Você ouve o professor chamando na sala ao lado!";
const MSG_BORDA_CORREDOR = "Nada para esse lado...";

// ---- professor ----
// segunda parte da primeira conversa (a fala do pedido fica em PEDIDOS, no pecas.js)
const FALA_PROFESSOR_TECNICO = "Você, como técnico, deve saber quais são as peças certas e remontá-las. Vou adorar ver a cara de desespero desse garoto! HAHAHAHA!";
// quando o player fala com ele de novo durante a busca (uma das duas é sorteada)
const FALAS_PROFESSOR_REPETE = [
    "Vamos rápido! Não quero ter que ficar esperando.",
    "Precisa de algo?",
];

// ---- conferência das peças (o professor comenta cada peça ao montar o PC) ----
const FALA_PECA_CERTA = "Essa é a certa.";
const FALA_PECA_ERRADA = "Essa peça não é ideal.";
const FALA_PECA_FALTANDO = "Cadê a peça?";

// ---- alunos (ainda sem NPC no jogo) ----
const FALA_ALUNO_1 = "Só vim hoje porque achei que seria dia de prova. Como não é, vou ficar jogando Clash Royale.";
const FALA_ALUNO_2 = "Queria só marcar presença e vazar.";

// controles mostrados nas telas de START e de pausa
const LINHAS_CONTROLES = [
    "SETAS ou WASD: andar",
    "ALT esquerdo (segurar): correr",
    "ESPAÇO: interagir / fechar mensagem",
];

// ---- fim de jogo por tempo esgotado ----
const TITULO_TEMPO_ESGOTADO = "GAME OVER";
const LINHAS_TEMPO_ESGOTADO = [
    "Você não conseguiu montar o PC",
    "a tempo para o professor.",
];