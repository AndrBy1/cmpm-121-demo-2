import "./style.css";

let isDraw = false;
let thisLine = null;
let currentThick = false;
let colors: string[] = ["black", "red", "green", "yellow","orange", "magenta", "cyan", "white", "gray"];
let colorIndex: number = 0;
let custom = prompt("Custom sticker text","🧽");
let drawPositions = [];
let drawColors: number[] = [];
let redoColors:number[] = [];
let redoPositions = [];
let thickness: number[] = [];
let redoThickness: number[] = [];

const size = 256;
const app = document.querySelector<HTMLDivElement>("#app")!;

const canvas = document.getElementById("canvas");
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d");
const Title = "Title";
const header = document.createElement("h1");
const degrees = document.querySelector("#degrees");
const rotation = document.querySelector("#Rotation");
rotation.value = 0;
degrees.textContent = rotation.value;

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

function createEmoteButton(text: string, num: number){
    const button= document.createElement("button");
    button.textContent = text;
    app.append(button);
    button.addEventListener("click", () => {
        if(penTool.option != num){
            penTool.option = num;
        }else{
            penTool.option = 0;
        }
        dispatchEvent(toolMoved);
    })
}
createEmoteButton("🌕", 1);
createEmoteButton("🍤", 2);
createEmoteButton("☄️", 3);
const customButton = document.createElement("button");
const exportButton = document.createElement("button");
customButton.textContent = custom;
app.append(customButton);
exportButton.textContent = "export";
app.append(exportButton);


const changEvent = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

thickness.push(1);
header.innerHTML = Title;

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, size, size);

document.title = Title;

interface displayObj {
    display(context : CanvasRenderingContext2D): void;
}

interface StickerObj{
    emojiPositions: number[][];
    drag(changeX: number, changeY: number): void;
}

interface selectTool{
    x: number;
    y: number;
    option: number;
    construct(thickness: number): void;
    moveCursor(): void;
}

const emojiSticker: StickerObj = {
    emojiPositions: [[0,-2000],[0,-2000],[0,-2000],[0,-2000]],
    drag(changeX, changeY){
        ctx.font = "32px monospace";
        if(penTool.option == 1){
            this.emojiPositions[0] = [changeX - 18, changeY + 10];
        }else if (penTool.option == 2){
            this.emojiPositions[1] = [changeX - 18, changeY + 10];
        }else if (penTool.option == 3){
            this.emojiPositions[2] = [changeX - 18, changeY + 10];
        }else if (penTool.option == 4){
            this.emojiPositions[3] = [changeX - 18, changeY + 10];
        }
    }
}

const penTool: selectTool = {
    x: 0, 
    y: 0,
    option: 0,
    construct(width){
        thickness.push(width);
    },

    moveCursor(){
        redraw(ctx);
        ctx.beginPath();
        ctx.font = "32px monospace";
        if(this.option == 1){
            ctx.fillText("🌕", penTool.x - 18, penTool.y + 10);
        }else if (this.option == 2){
            ctx.fillText("🍤", penTool.x - 18, penTool.y + 10);
        }else if (this.option == 3){
            ctx.fillText("☄️", penTool.x - 18, penTool.y + 10);
        }else if (this.option == 4){
            ctx.fillText(custom, penTool.x - 18, penTool.y + 10);
        }else{
            ctx.arc(penTool.x, penTool.y, 1, 0, 2 * Math.PI);
        }
        ctx.stroke();
    }
}

thinButton.addEventListener("click", () => {
    currentThick = false;
    penTool.option = 0;
    console.log("thin button clicked");
})

thickButton.addEventListener("click", () => {
    currentThick = true;
    penTool.option = 0;
    console.log("thick button clicked");
})

clearButton.addEventListener("click", () => {
    ctx.clearRect(0,0,size,size);
    ctx.fillRect(0, 0, size, size);
    drawPositions = [];
    redoPositions = [];
    drawColors = [];
    redoColors = [];
    thickness = [];
    emojiSticker.emojiPositions = [[0,-2000],[0,-2000],[0,-2000],[0,-2000]];
})

customButton.addEventListener("click", () => {
    if(penTool.option != 4){
        penTool.option = 4;
    }else{
        penTool.option = 0;
    }
    dispatchEvent(toolMoved);
})

exportButton.addEventListener("click", () => {
    const tempCanvas = document.getElementById("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    redraw(tempCtx);
    tempCtx.scale(4*size, 4*size);
    const anchor = document.createElement('a');
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = 'drawing.png';
    anchor.click();
})

rotation.addEventListener("input", (e) =>{
    degrees.textContent = e.target.value;
    if (penTool.option > 0){
        canvas.addEventListener("mousedown", () => {
            ctx.translate(penTool.x, penTool.y);
            ctx.rotate((e.target.value * Math.PI) / 180);
            ctx.translate(-penTool.x, -penTool.y);
        })
    }
});

canvas.addEventListener("mouseleave", () => {
    redraw(ctx);
})

globalThis.addEventListener("drawing-changed", () => {
    redraw(ctx);
})

globalThis.addEventListener("tool-moved", () => {
    if (currentThick){
        ctx.lineWidth = 5;
    }else{
        ctx.lineWidth = 1;
    }
    penTool.moveCursor();
})

//functions borrowed from https://quant-paint.glitch.me/paint1.html 
undoButton.addEventListener("click", () => {
    if (drawPositions.length > 0) {
        redoPositions.push(drawPositions.pop());
        redoThickness.push(thickness.pop());
        redoColors.push(drawColors.pop());
        dispatchEvent(changEvent);
    }
});

redoButton.addEventListener("click", () => {
    if (redoPositions.length > 0) {
        drawPositions.push(redoPositions.pop());
        thickness.push(redoThickness.pop());
        drawColors.push(redoColors.pop());
        dispatchEvent(changEvent);
    }
});

function redraw(ctxParam: CanvasRenderingContext2D ) {
    ctxParam.clearRect(0, 0, size, size);
    ctxParam.fillRect(0,0,size, size);
    let n = 0;
    
    if(colorIndex >= colors.length){
        colorIndex = 0;
    }
    
    for (const line of drawPositions) {
        ctxParam.strokeStyle = colors[drawColors[n]];
        ctxParam.lineWidth = thickness[n + 1];
        if (line.length > 1) {
            ctxParam.beginPath();
            const { x, y } = line[0];
            ctxParam.moveTo(x, y);
            for (const { x, y } of line) {
                ctxParam.lineTo(x, y);
            }
            ctxParam.stroke();
        }
      n++;
    }
    ctxParam.fillText("🌕", emojiSticker.emojiPositions[0][0], emojiSticker.emojiPositions[0][1]);
    ctxParam.fillText("🍤", emojiSticker.emojiPositions[1][0], emojiSticker.emojiPositions[1][1]);
    ctxParam.fillText("☄️", emojiSticker.emojiPositions[2][0], emojiSticker.emojiPositions[2][1]);
    ctxParam.fillText(custom, emojiSticker.emojiPositions[3][0], emojiSticker.emojiPositions[3][1]);
}

canvas.addEventListener("mousedown", (e) => {
    dispatchEvent(toolMoved);
    penTool.x = e.offsetX;
    penTool.y = e.offsetY;
    isDraw = true;
    if (currentThick){
        thickness.push(4);
    }else{
        thickness.push(1);
    }
    if (penTool.option > 0){
        emojiSticker.drag(e.offsetX, e.offsetY);
    }
    
    thisLine = [];
    redoPositions.splice(0, redoPositions.length);
    thisLine.push({x: e.offsetX, y: e.offsetY});
    drawPositions.push(thisLine);
    drawColors.push(colorIndex);
    colorIndex++;
    dispatchEvent(changEvent);
});

canvas.addEventListener("mousemove", (e) => {
    penTool.x = e.offsetX;
    penTool.y = e.offsetY;
    
    dispatchEvent(toolMoved);
    if (isDraw) {
        thisLine.push({x: penTool.x, y: penTool.y})
        dispatchEvent(changEvent);
    }
});

globalThis.addEventListener("mouseup", (e) => {
    dispatchEvent(toolMoved);
    if (isDraw) {
        thisLine = null;
        isDraw = false;
        dispatchEvent(changEvent);
    }
});