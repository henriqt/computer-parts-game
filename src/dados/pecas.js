// ---- peças ----
const ALFA_PECA = 0.45;     // peças meio transparentes para ficarem mais difíceis de ver

// Tipos de peça: o player pode carregar 1 peça de cada tipo
const TIPOS_PECA = ["processador", "placa de vídeo", "monitor", "memória RAM"];

// Cada tipo tem uma cor (placeholder) e a letra indica o modelo dentro do tipo
const COR_TIPO = {
    "processador": "#ff7a00",       // laranja
    "placa de vídeo": "#00bcd4",    // ciano
    "monitor": "#ff4fa3",           // rosa
    "memória RAM": "#8e44ff",       // roxo
};
const NOME_TIPO = {
    "processador": "Processador",
    "placa de vídeo": "Placa de vídeo",
    "monitor": "Monitor",
    "memória RAM": "Memória RAM",
};

// Descrições gerais de cada tipo (ainda sem uso no jogo)
const DESCRICAO_TIPO = {
    "processador": "Executa instruções e cálculos do sistema. O número de núcleos, a arquitetura, a frequência e o desempenho por núcleo influenciam a velocidade em diferentes tipos de tarefas.",
    "placa de vídeo": "Processa operações gráficas e paralelas. É essencial para renderização 3D e jogos, além de acelerar determinados filtros e efeitos em aplicativos de edição.",
    "monitor": "Dispositivo de saída visual. A resolução, a taxa de atualização, o tempo de resposta e a reprodução de cores influenciam diferentes usos, como jogos e edição profissional.",
    "memória RAM": "Armazena temporariamente os dados e recursos dos programas em uso. A capacidade disponível influencia o tamanho dos projetos que podem ser manipulados sem recorrer excessivamente à memória virtual.",
};

// ideal = lista dos pedidos (ids) para os quais a peça é a certa
function criarPeca(tipo, letra, nome, ideal, descricao) {
    return { tipo: tipo, letra: letra, nome: nome, ideal: ideal, descricao: descricao };
}

const PECAS = [
    // processadores
    criarPeca("processador", "A", "AMD Ryzen 9 9950X", ["blender"],
        "Processador com 16 núcleos e 32 threads, baseado na arquitetura Zen 5. O processamento multithread favorece simulações físicas, cálculos de geometria e tarefas de renderização por CPU em projetos tridimensionais complexos."),
    criarPeca("processador", "B", "AMD Ryzen 7 9800X3D", ["games"],
        "Processador com 8 núcleos e 16 threads, baseado na arquitetura Zen 5 e equipado com a tecnologia AMD 3D V-Cache. O cache L3 ampliado pode reduzir os acessos à memória principal em jogos compatíveis, contribuindo para taxas de quadros elevadas e desempenho consistente."),
    criarPeca("processador", "C", "AMD Ryzen 7 9700X", ["photoshop"],
        "Processador com 8 núcleos e 16 threads, baseado na arquitetura Zen 5. Sua capacidade de processamento favorece operações de edição, a aplicação de filtros e a execução simultânea de tarefas durante a manipulação de documentos gráficos."),

    // placas de vídeo
    criarPeca("placa de vídeo", "A", "NVIDIA GeForce RTX 5080 16 GB", ["blender"],
        "Placa gráfica baseada na arquitetura NVIDIA Blackwell, equipada com 16 GB de memória GDDR7. Os núcleos CUDA aceleram a renderização por GPU, enquanto os RT Cores auxiliam no cálculo de iluminação, sombras e reflexos por ray tracing."),
    criarPeca("placa de vídeo", "B", "NVIDIA GeForce RTX 5070 Ti 16 GB", ["games"],
        "Placa gráfica baseada na arquitetura NVIDIA Blackwell, com 16 GB de memória GDDR7. Seus recursos de ray tracing simulam efeitos de iluminação, enquanto tecnologias como o DLSS podem reconstruir imagens e aumentar o desempenho em jogos compatíveis."),
    criarPeca("placa de vídeo", "C", "NVIDIA GeForce RTX 5060 Ti 16 GB", ["photoshop"],
        "Placa gráfica baseada na arquitetura NVIDIA Blackwell, equipada com 16 GB de memória GDDR7. A GPU pode acelerar filtros e efeitos compatíveis com o processamento gráfico do Photoshop, além de oferecer memória de vídeo dedicada para operações que utilizam recursos gráficos."),

    // monitores (o PC de modelagem 3D não usa monitor)
    criarPeca("monitor", "A", "Monitor gamer de 27 polegadas QHD 240 Hz", ["games"],
        "Monitor com resolução QHD de 2560 × 1440 pixels e taxa de atualização de até 240 Hz. A frequência elevada permite exibir mais quadros por segundo quando o computador consegue produzi-los, o que proporciona movimento mais fluido e menor intervalo entre as atualizações da imagem. O benefício depende do jogo, da configuração e da conexão utilizada."),
    criarPeca("monitor", "B", "Monitor ASUS ProArt de 27 polegadas 4K", ["photoshop"],
        "Monitor profissional voltado a fluxos de trabalho que exigem alta definição e precisão visual. A resolução 4K UHD (3840 × 2160 pixels) permite visualizar detalhes finos em imagens de alta resolução. A cobertura de espaços de cor e a calibração variam conforme o modelo específico e são importantes para avaliar as cores com maior consistência."),
    criarPeca("monitor", "C", "Monitor de 32 polegadas 4K UHD IPS", ["blender"],
        "Monitor de 32 polegadas com resolução 4K UHD de 3840 × 2160 pixels e painel IPS. A tela ampla e a alta resolução permitem manter a viewport 3D, o outliner, o painel de propriedades e a linha do tempo do Blender abertos ao mesmo tempo, com boa nitidez para avaliar a geometria, as malhas poligonais e as texturas. A precisão das cores varia conforme o modelo e a calibração."),

    // memórias RAM (as duas de 32 GB servem para games e para Photoshop)
    criarPeca("memória RAM", "A", "64 GB DDR5", ["blender"],
        "Conjunto de módulos DDR5 que armazena temporariamente os dados usados pelos programas. A capacidade de 64 GB permite trabalhar com cenas extensas, malhas com muitos polígonos, texturas de alta resolução e vários recursos de produção 3D ao mesmo tempo."),
    criarPeca("memória RAM", "B", "32 GB DDR5", ["games", "photoshop"],
        "Memória principal que mantém os dados do jogo, os recursos carregados e os processos do sistema disponíveis para acesso rápido. A capacidade de 32 GB atende a muitos jogos atuais e permite executar aplicativos em segundo plano sem depender excessivamente da memória virtual."),
    criarPeca("memória RAM", "C", "32 GB DDR5", ["games", "photoshop"],
        "Memória de acesso aleatório que mantém temporariamente os dados de documentos, camadas, máscaras e operações em andamento. A capacidade de 32 GB favorece a edição de imagens de alta resolução, documentos com muitas camadas e vários arquivos abertos ao mesmo tempo."),
];

// Pedidos do professor (um deles é sorteado). Ele só diz a prova de amanhã;
// quem descobre o tipo de PC e escolhe as peças certas é o player.
// tipos = os tipos de peça que esse PC confere | kit = o que aparece quando a montagem é perfeita
const PEDIDOS = [
    { id: "blender", nome: "MODELAGEM 3D",
      fala: "Boa noite, preciso da sua ajuda! Algum rato-aluno desmontou os PCs. Acho que isso tem a ver com uma prova de modelagem 3D no Blender que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      tipos: ["processador", "placa de vídeo", "monitor", "memória RAM"],
      kit: { nome: "Arsenal de Modelador",
             descricao: "Você montou o Arsenal de Modelador! Este conjunto foi preparado para modelagem, simulação e renderização de cenas tridimensionais. O processador oferece alto desempenho em tarefas paralelas, a placa de vídeo acelera a renderização por GPU, o monitor 4K mostra com nitidez a geometria e as texturas, e a memória RAM comporta cenas complexas e texturas de alta resolução." } },
    { id: "photoshop", nome: "EDIÇÃO DE IMAGEM",
      fala: "Boa noite, preciso da sua ajuda! Algum anta-aluno desmontou os PCs. Acho que isso tem a ver com uma prova de edição de imagens no Photoshop que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      tipos: ["processador", "placa de vídeo", "monitor", "memória RAM"],
      kit: { nome: "Kit do Artista",
             descricao: "Você montou o Kit do Artista! Este conjunto foi projetado para edição e composição de imagens. O processador executa filtros e demais operações, a placa de vídeo acelera os efeitos compatíveis, o monitor profissional favorece a visualização de detalhes e a avaliação das cores, e a memória RAM mantém documentos grandes, camadas e máscaras disponíveis durante a edição." } },
    { id: "games", nome: "DESENVOLVIMENTO DE JOGOS",
      fala: "Boa noite, preciso da sua ajuda! Algum rato-aluno desmontou os PCs. Acho que isso tem a ver com uma prova de desenvolvimento de jogos que eu aplicaria amanhã: ele quis sabotar a avaliação.",
      tipos: ["processador", "placa de vídeo", "monitor", "memória RAM"],
      kit: { nome: "Núcleo do Jogador",
             descricao: "Você montou o Núcleo do Jogador! Este conjunto foi otimizado para jogos que exigem alta taxa de quadros e resposta rápida. O processador favorece o desempenho por núcleo e a taxa de quadros, a placa de vídeo renderiza os gráficos e aplica efeitos visuais, o monitor de 240 Hz exibe o movimento com fluidez e a memória RAM mantém os recursos do jogo acessíveis durante a execução." } },
];

// quantas peças ficam em cada área (a soma deve ser igual ao tamanho do catálogo: 12)
const PECAS_POR_AREA = { sala: 6, ti: 3, corredor: 3 };