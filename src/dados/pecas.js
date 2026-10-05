// ---- peças ----
const ALFA_PECA = 0.45;     // peças meio transparentes para ficarem mais difíceis de ver

// Tipos de peça: o player pode carregar 1 peça de cada tipo
const TIPOS_PECA = ["processador", "placa de vídeo", "monitor", "armazenamento"];

// Cada tipo tem uma cor (placeholder) e a letra A, B ou C indica o modelo
const COR_TIPO = {
    "processador": "#ff7a00",       // laranja
    "placa de vídeo": "#00bcd4",    // ciano
    "monitor": "#ff4fa3",           // rosa
    "armazenamento": "#8e44ff",     // roxo
};
const NOME_TIPO = {
    "processador": "Processador",
    "placa de vídeo": "Placa de vídeo",
    "monitor": "Monitor",
    "armazenamento": "Armazenamento",
};

// Catálogo (placeholders). notas = quanto a peça combina com cada pedido (1 a 3).
// Quando tivermos as peças reais, é só trocar nome, descrição e notas.
function criarPeca(tipo, letra, blender, photoshop, ia) {
    return {
        tipo: tipo,
        letra: letra,
        nome: NOME_TIPO[tipo] + " " + letra,
        descricao: "Peça de teste. A descrição real vai aparecer aqui.",
        notas: { blender: blender, photoshop: photoshop, ia: ia },
    };
}
const PECAS = [
    criarPeca("processador", "A", 3, 1, 2),
    criarPeca("processador", "B", 1, 3, 1),
    criarPeca("processador", "C", 2, 2, 3),
    criarPeca("placa de vídeo", "A", 1, 3, 2),
    criarPeca("placa de vídeo", "B", 2, 1, 3),
    criarPeca("placa de vídeo", "C", 3, 2, 1),
    criarPeca("monitor", "A", 1, 1, 2),
    criarPeca("monitor", "B", 2, 3, 2),
    criarPeca("monitor", "C", 3, 2, 2),
    criarPeca("armazenamento", "A", 1, 2, 3),
    criarPeca("armazenamento", "B", 2, 3, 1),
    criarPeca("armazenamento", "C", 3, 1, 2),
];

// Pedidos do professor (um deles é sorteado). Ele só diz o tipo de computador,
// quem escolhe as peças certas é o player.
// pesos = o quanto cada tipo de peça importa nesse pedido (0 = não importa)
const PEDIDOS = [
    { id: "blender", nome: "MODELAGEM 3D",
      fala: "Boa noite, preciso da sua ajuda! Algum rato-aluno desmontou os computadores. Acho que isso tem a ver com a prova de modelagem 3D no Blender que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      pedido: "Preciso que você monte um computador para modelagem 3D.",
      pesos: { "processador": 2, "placa de vídeo": 3, "monitor": 1, "armazenamento": 1 } },
    { id: "photoshop", nome: "EDIÇÃO DE IMAGEM",
      fala: "Boa noite, preciso da sua ajuda! Algum anta-aluno desmontou os computadores. Acho que isso tem a ver com a prova de edição de imagens no Photoshop que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      pedido: "Preciso que você monte um computador para edição de imagens.",
      pesos: { "processador": 2, "placa de vídeo": 1, "monitor": 3, "armazenamento": 2 } },
    { id: "ia", nome: "DESENVOLVIMENTO DE IA",
      fala: "Boa noite, preciso da sua ajuda! Algum rato-aluno desmontou os computadores. Acho que isso tem a ver com a prova de desenvolvimento de IA que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      pedido: "Preciso que você monte um computador para desenvolvimento de IA.",
      pesos: { "processador": 2, "placa de vídeo": 3, "monitor": 0, "armazenamento": 2 } },
];

// quantas peças ficam em cada área (a soma deve ser igual ao tamanho do catálogo)
const PECAS_POR_AREA = { sala: 6, ti: 3, corredor: 3 };
