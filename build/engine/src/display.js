export default class Display {
    constructor(drawLoop, canvas, bufferWidth, bufferHeight) {
        this.aspectRatio = 0;
        this.width = 0;
        this.height = 0;
        this.wRatio = 0;
        this.hRatio = 0;
        this.drawLoop = drawLoop;
        this.can = canvas;
        let ctx = canvas.getContext("2d");
        let buf = document.createElement("canvas").getContext("2d");
        if (ctx == null || buf == null)
            throw new Error("Could not create canvas context");
        this.ctx = ctx;
        this.buf = buf;
        this._resize = () => this.resize();
        window.onresize = this._resize;
        this.updateBufSize(bufferWidth, bufferHeight);
    }
    setDrawLoop(drawLoop) {
        this.drawLoop = drawLoop;
    }
    updateRatios() {
        this.aspectRatio = this.width / this.height;
        this.wRatio = this.width / this.can.offsetWidth;
        this.hRatio = this.height / this.can.offsetHeight;
    }
    updateBufSize(_width, _height) {
        this.width = _width;
        this.height = _height;
        this.buf.canvas.width = _width;
        this.buf.canvas.height = _height;
        this.resize();
    }
    render(alpha) {
        this.ctx.clearRect(0, 0, this.can.width, this.can.height);
        this.buf.clearRect(0, 0, this.width, this.height);
        this.drawLoop(alpha);
        this.ctx.drawImage(this.buf.canvas, 0, 0, this.width, this.height, 0, 0, this.can.width, this.can.height);
    }
    resize() {
        let ar = this.width / this.height;
        let bufSmoothing = this.buf.imageSmoothingEnabled;
        let ctxSmoothing = this.ctx.imageSmoothingEnabled;
        if (window.innerWidth / window.innerHeight > ar) {
            this.can.width = window.innerHeight * ar;
            this.can.height = window.innerHeight;
        }
        else {
            this.can.width = window.innerWidth;
            this.can.height = window.innerWidth / ar;
        }
        this.ctx.imageSmoothingEnabled = ctxSmoothing;
        this.buf.imageSmoothingEnabled = bufSmoothing;
        this.updateRatios();
    }
}
