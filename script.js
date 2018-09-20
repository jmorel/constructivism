const vertexLength = function (x, y) {
    return Math.sqrt(Math.pow(x, 2) +  Math.pow(y, 2));
}
class Circle {
    constructor(ctx, centerX, centerY, color) {
        this.ctx = ctx;
        this.centerX = centerX;
        this.centerY = centerY;
        this.color = color;
        this.radius = 10;
    }

    increaseRadius () {
        this.radius += 5;
    }

    redraw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}

class Rectangle {
    constructor(ctx, angle, centerX, centerY, color) {
        this.ctx = ctx;
        this.centerX = centerX;
        this.centerY = centerY;
        this.color = color;
        this.angle = angle;

        this.length = 30;
        this.width = 10;
        this.lengthSkew = 0;
        this.widthSkew = 0;
    }

    increaseLength() {
        this.length += 5;
    }

    increaseWidth() {
        this.width += 5;
    }

    increaseLengthSkew() {
        this.lengthSkew += 1;
    }

    increaseWidthSkew() {
        this.widthSkew += 1;
    }

    redraw() {
        const vertices = [
            [ this.length/2 + this.lengthSkew,  this.width/2 + this.widthSkew],
            [ this.length/2 - this.lengthSkew, -this.width/2 + this.widthSkew],
            [-this.length/2 - this.lengthSkew, -this.width/2 - this.widthSkew],
            [-this.length/2 + this.lengthSkew,  this.width/2 - this.widthSkew],
        ].map(vertex => {
                const radius = vertexLength(vertex[0], vertex[1]);
                let alpha = Math.atan(vertex[1] / vertex[0]);
                if (vertex[0] < 0) {
                    alpha += Math.PI;
                }
                return [this.centerX + radius * Math.cos(this.angle + alpha), this.centerY + radius * Math.sin(this.angle + alpha)];
            })
            .map(vertex => [Math.round(vertex[0]), Math.round(vertex[1])]);

        this.ctx.fillStyle = this.color;
        this.ctx.moveTo(vertices[3][0], vertices[3][1]);
        vertices.forEach(vertex => this.ctx.lineTo(vertex[0], vertex[1]));
        this.ctx.fill();
    }
}

class ConstructivistPainting {

    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvasWidth;
        this.canvasHeight;
        this.cursorY;
        this.cursorX;
        this.maxLineLength;
        this.angle = Math.PI / 6;
        this.deltaAngle = Math.PI / 24;
        this.shapes = [];
        this.temporaryShape;
        this.currentColor;
    }

    updateCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.maxLineLength = vertexLength(this.canvasWidth, this.canvasHeight);
    }

    setCursorPosition (x, y) {
        this.cursorX = x;
        this.cursorY = y;
    };

    // line of force

    increaseAngle () {
        this.angle += this.deltaAngle;
    }

    decreaseAngle () {
        this.angle -= this.deltaAngle;
    }

    setAngle (angle) {
        this.angle = angle;
    }

    // current color

    setCurrentColor (color) {
        this.currentColor = color;
    }

    // shapes

    saveTemporaryShape () {
        this.shapes.push(this.temporaryShape);
        this.resetTemporaryShape();
    }

    resetTemporaryShape () {
        this.temporaryShape = undefined;
    }

    createTemporaryCircle () {
        this.temporaryShape = new Circle(this.ctx, this.cursorX, this.cursorY, this.currentColor);
    }

    createTemporaryRectangle() {
        this.temporaryShape = new Rectangle(this.ctx, this.angle, this.cursorX, this.cursorY, this.currentColor);
    }

    growMainDirection () {
        if (!this.temporaryShape) {
            return;
        }
        if (this.temporaryShape.constructor.name === 'Circle') {
            this.temporaryShape.increaseRadius();
        }
        if (this.temporaryShape.constructor.name === 'Rectangle') {
            this.temporaryShape.increaseLength();
        }
    }

    growSecondaryDirection () {
        if (!this.temporaryShape) {
            return;
        }
        if (this.temporaryShape.constructor.name === 'Rectangle') {
            this.temporaryShape.increaseWidth();
        }
    }

    skewMainDirection () {
        if (!this.temporaryShape) {
            return;
        }

        if (this.temporaryShape.constructor.name === 'Rectangle') {
            this.temporaryShape.increaseWidthSkew();
        }
    }

    skewSecondaryDirection () {
        if (!this.temporaryShape) {
            return;
        }

        if (this.temporaryShape.constructor.name === 'Rectangle') {
            this.temporaryShape.increaseLengthSkew();
        }

    }

    // drawing

    drawLine(color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(10, 10, 100, 100);
    }

    redrawLineOfForce() {
        if (!this.cursorX || !this.cursorY) {
            return;
        }

        var deltaX = this.maxLineLength * Math.cos(this.angle),
            deltaY = this.maxLineLength * Math.sin(this.angle);

        this.ctx.beginPath();

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.moveTo(this.cursorX - deltaX, this.cursorY - deltaY);
        this.ctx.lineTo(this.cursorX + deltaX, this.cursorY + deltaY);
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.moveTo(this.cursorX - deltaY, this.cursorY + deltaX);
        this.ctx.lineTo(this.cursorX + deltaY, this.cursorY - deltaX);
        this.ctx.stroke();
    }

    clearAll() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }

    redraw() {
        this.clearAll();
        this.shapes.forEach((shape) => shape.redraw());
        if (this.temporaryShape) {
            this.temporaryShape.redraw();
        }
        this.redrawLineOfForce();
    }

    // events handlers

    onResize() {
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;

        this.updateCanvasSize(canvas.width, canvas.height);
        this.redraw();
    }
};

class ControlPanel {
    constructor(container, painting, colorPalette) {
        this.container = container;
        this.painting = painting;
        this.colorPalette = colorPalette;
    }
    clearAll() {
        for (let child of this.container.children) {
            child.remove();
        }
    }

    drawColorPalette() {
        this.colorPalette.forEach(color => {
            let button = document.createElement('button');
            button.style.background = color;
            button.style.border = 'none';
            button.style.height = '20px';
            button.style.width = '20px';
            button.onclick = (event) => {
                this.painting.setCurrentColor(color);
            }
            this.container.appendChild(button);
        });
    }

    drawAngleSelector() {
        let range = document.createElement('input');
        range.type = 'range';
        range.min = -Math.PI;
        range.max = Math.PI;
        range.step = 0.01;
        range.val = this.painting.angle;
        range.onchange = () => {
            this.painting.setAngle(range.value);
            this.painting.redraw();
        }
        this.container.appendChild(range);
    }

    redraw() {
        this.clearAll();
        this.drawColorPalette();
        this.drawAngleSelector();
    }
}

// init


var canvas = document.getElementById('canvas');
var controlPanelElement = document.getElementById('control-panel');
var colorPalette = ['red', 'green', 'blue', 'yellow', 'orange', 'purple']
var painting = new ConstructivistPainting(canvas);
var controlPanel = new ControlPanel(controlPanelElement, painting, colorPalette);
painting.onResize();
controlPanel.redraw();

canvas.addEventListener('mousemove', function (event) {
    painting.setCursorPosition(event.clientX, event.clientY);
    painting.redraw();
});

document.body.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            painting.increaseAngle();
            break;
        case 'ArrowDown':
            painting.decreaseAngle();
            break;
        case 'Enter':
            painting.saveTemporaryShape();
            break;
        case 'c':
            painting.createTemporaryCircle();
            break;
        case 'g':
            painting.growMainDirection();
            break;
        case 'h':
            painting.growSecondaryDirection();
            break;
        case 'r':
            painting.createTemporaryRectangle();
            break;
        case 'Escape':
            painting.resetTemporaryShape();
            break;
        case 's':
            painting.skewMainDirection();
            break;
        case 'd':
            painting.skewSecondaryDirection();
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
            painting.setCurrentColor(colorPalette[event.key - 1]);
            break;
    }
    painting.redraw();
});

window.addEventListener('resize', () => painting.onResize());

