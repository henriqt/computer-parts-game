// Input: guarda o estado do teclado (direções e correr) e avisa o jogo por callbacks.
// Callbacks (definidos pelo main.js):
//   aoDirecao(dir, repeticao)  -> devolve true se o jogo "consumiu" a tecla (ex.: cursor do menu)
//   aoNovaDirecao(dir)         -> direção apertada pela primeira vez (para virar sem andar)
//   aoEspaco(repeticao), aoEscape(repeticao)
class Input {
    constructor() {
        this.teclasAtivas = new Set();   // direções apertadas agora
        this.ordemTeclas = [];           // ordem em que foram apertadas (vale a última)
        this.correr = false;             // ALT esquerdo está apertado?
        this.inicioCorrer = 0;           // momento em que o ALT foi apertado

        this.aoDirecao = null;
        this.aoNovaDirecao = null;
        this.aoEspaco = null;
        this.aoEscape = null;
    }

    instalar() {
        window.addEventListener("keydown", (ev) => this.aoPressionar(ev));
        window.addEventListener("keyup", (ev) => this.aoSoltar(ev));
        // não fica correndo se trocar de janela
        window.addEventListener("blur", () => { this.correr = false; });
    }

    aoPressionar(ev) {
        if (ev.code === "AltLeft") {
            ev.preventDefault();        // impede o ALT de abrir o menu do navegador
            if (!this.correr) this.inicioCorrer = performance.now();     // ignora a tecla repetindo
            this.correr = true;
            return;
        }
        if (ev.code === "Escape") {
            ev.preventDefault();
            if (this.aoEscape) this.aoEscape(ev.repeat);
            return;
        }
        if (ev.code === "Space") {
            ev.preventDefault();
            if (this.aoEspaco) this.aoEspaco(ev.repeat);
            return;
        }
        let dir = teclaParaDirecao[ev.code];
        if (!dir) return;
        ev.preventDefault();
        if (this.aoDirecao && this.aoDirecao(dir, ev.repeat)) return;
        if (!this.teclasAtivas.has(dir)) {
            this.teclasAtivas.add(dir);
            this.ordemTeclas.push(dir);
            if (this.aoNovaDirecao) this.aoNovaDirecao(dir);
        }
    }

    aoSoltar(ev) {
        if (ev.code === "AltLeft") {
            ev.preventDefault();
            this.correr = false;
            return;
        }
        let dir = teclaParaDirecao[ev.code];
        if (!dir) return;
        this.teclasAtivas.delete(dir);
        let indice = this.ordemTeclas.indexOf(dir);
        if (indice !== -1) this.ordemTeclas.splice(indice, 1);
    }

    // direção apertada mais recentemente (ou null se nenhuma)
    direcaoAtiva() {
        for (let i = this.ordemTeclas.length - 1; i >= 0; i--) {
            if (this.teclasAtivas.has(this.ordemTeclas[i])) return this.ordemTeclas[i];
        }
        return null;
    }
}
