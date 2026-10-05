// Câmera: guarda a posição (em tiles, pode ter casas decimais) e calcula
// onde desenhar cada tile na tela.
class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    // centraliza a câmera em (x, y)
    seguir(x, y) {
        this.x = x;
        this.y = y;
    }

    // canto superior esquerdo da parte visível do mapa, em tiles
    get origemX() { return this.x - tilesVisiveisX / 2 + 0.5; }
    get origemY() { return this.y - tilesVisiveisY / 2 + 0.5; }

    // só o deslocamento da câmera é arredondado, então os tiles ficam sem frestas
    // posição na tela (px) de um tile = tileX * tile - deslocX
    get deslocX() { return Math.round(this.origemX * tile); }
    get deslocY() { return Math.round(this.origemY * tile); }
}
