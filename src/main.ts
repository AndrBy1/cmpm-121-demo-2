import "./style.css";

let isDraw = false;
let x = 0;
let y = 0;
let mousePositions = [];
let redoPositions = [];
let thisLine = null;
let thickness: number[] = [];
let redoThickness: number[] = [];
let currentThick = false;

const size = 256;
const app = document.querySelector<HTMLDivElement>("#app")!;
const canv = document.getElementById("canvas");
const ctx = canv.getContext("2d");
const Title = "Title";
const header = document.createElement("h1");

const clearButton = document.createElement("button");
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");
const thinButton = document.createElement("button");
const thickButton = document.createElement("button");
clearButton.textContent = "Clear";
app.append(clearButton);
undoButton.textContent = "Undo";
app.append(undoButton);
redoButton.textContent = "Redo";
app.append(redoButton);
thinButton.textContent = "Thin";
app.append(thinButton);
thickButton.textContent = "Thick";
app.append(thickButton);

const penType: selectTool = {
    construct(width){
        
    }
}

const changEvent = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

header.innerHTML = Title;
app.append(header);

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, size, size);

document.title = Title;

thinButton.addEventListener("click", () => {
    currentThick = false;
})

thickButton.addEventListener("click", () => {
    currentThick = true;
})

clearButton.addEventListener("click", () => {
    ctx.clearRect(0,0,size,size);
    ctx.fillRect(0, 0, size, size);
    mousePositions = [];
})


globalThis.addEventListener("drawing-changed", (e) => {
    redraw();
})

interface displayObj {
    x: number;
    y: number;
    display(context : CanvasRenderingContext2D): void;
}

interface repLines{
    construct(x: number, y: number): void;
    drag(x: number, y: number): void;
}

interface selectTool{
    construct(thickness: number): void;
}

//functions borrowed from https://quant-paint.glitch.me/paint1.html 
undoButton.addEventListener("click", () => {
    if (mousePositions.length > 0) {
        redoPositions.push(mousePositions.pop());
        redoThickness.push(thickness.pop());
        dispatchEvent(changEvent);
        console.log(mousePositions);
        console.log(redoPositions);
    }
});

redoButton.addEventListener("click", () => {
    if (redoPositions.length > 0) {
        mousePositions.push(redoPositions.pop());
        thickness.push(redoThickness.pop());
        dispatchEvent(changEvent);
    }
});

function redraw() {
    ctx.clearRect(0, 0, size, size);
    ctx.fillRect(0,0,size, size);
    let n = 0;
    //
    for (const line of mousePositions) {

        ctx.lineWidth = thickness[n];
        if (line.length > 1) {
            ctx.beginPath();
            const { x, y } = line[0];
            ctx.moveTo(x, y);
            for (const { x, y } of line) {
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
      n++;
    }
  }

canv.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDraw = true;
    if (currentThick){
        thickness.push(4);
    }else{
        thickness.push(1);
    }
    thisLine = [];
    redoPositions.splice(0, redoPositions.length);
    thisLine.push({x: x, y: y});
    mousePositions.push(thisLine);
    dispatchEvent(changEvent);
});

canv.addEventListener("mousemove", (e) => {
    dispatchEvent(toolMoved);
    if (isDraw) {
        x = e.offsetX;
        y = e.offsetY;
        thisLine.push({x: x, y: y})
        dispatchEvent(changEvent);
    }
});

globalThis.addEventListener("mouseup", (e) => {
    if (isDraw) {
        
        //console.log(mousePositions);
        thisLine = null;
        isDraw = false;
        dispatchEvent(changEvent);
    }
});

  