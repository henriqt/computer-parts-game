// Atlas: uma imagem com vários quadros do personagem, numa grade de células.
// Colunas: frente | costas | lado esquerdo (o lado direito é o esquerdo espelhado).
// As imagens ficam em assets/sprites/.
class Atlas {
    constructor(src, larguraCelula, alturaCelula, coluna) {
        this.img = new Image();
        this.img.src = src;
        this.larguraCelula = larguraCelula;
        this.alturaCelula = alturaCelula;
        this.coluna = coluna;       // { down: 0, up: 1, left: 2, right: 2 }
    }

    // a imagem já carregou?
    pronto() {
        return this.img.complete && this.img.naturalWidth > 0;
    }

    // desenha um quadro com os pés na base do tile (cx, cy = centro do tile)
    desenhar(ctx, cx, cy, direcao, linha) {
        let sx = this.coluna[direcao] * this.larguraCelula;
        let sy = linha * this.alturaCelula;
        let dy = cy + tile / 2 - this.alturaCelula + AJUSTE_Y_SPRITE;
        ctx.save();
        ctx.translate(cx, 0);
        if (direcao === "right") ctx.scale(-1, 1);      // espelha o lado esquerdo
        ctx.drawImage(this.img, sx, sy, this.larguraCelula, this.alturaCelula,
                      -this.larguraCelula / 2, dy, this.larguraCelula, this.alturaCelula);
        ctx.restore();
    }
}
