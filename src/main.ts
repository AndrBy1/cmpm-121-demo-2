import "./style.css";

type position = {x: number, y: number};
type emoji = {x: number, y: number, e: number};
type pen = {pos: position[], color: number, thick: number};

let isDraw = false;
let thisLine: position[] = [];
let currentThick = 1;
const colors: string[] = ["black", "red", "green", "yellow","orange", "magenta", "cyan", "white", "gray"];
const emojis: string[] = ["🌕", "🍤", "☄️"];
let colorIndex: number = 0;
const custom = prompt("Custom sticker text","🧽");
let drawPositions:pen[] = [];
let redoPositions:pen[] = [];

let size = 256;
const app = document.querySelector<HTMLDivElement>("#app")!;

const canvas = document.getElementById("canvas");
canvas!.style.cursor = "none";
const ctx = canvas!.getContext("2d");
const Title = "Title";
const header = document.createElement("h1");
const degrees = document.querySelector("#degrees");
const rotation = document.querySelector("#Rotation");
rotation!.value = 0;
degrees!.textContent = rotation!.value;

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
emojis.push(custom!);

function createEmoteButton(num: number){
    const button= document.createElement("button");
    button.textContent = emojis[num - 1];
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
createEmoteButton(1);
createEmoteButton(2);
createEmoteButton(3);
createEmoteButton(4);
const exportButton = document.createElement("button");
exportButton.textContent = "export";
app.append(exportButton);

const changEvent = new Event("drawing-changed");
const toolMoved = new Event("tool-moved");

header.innerHTML = Title;

ctx.fillStyle = "blue";
ctx.fillRect(0, 0, size, size);

document.title = Title;

interface displayObj {
    display(ctxParam : CanvasRenderingContext2D): void;
    moveCursor(): void;
}

interface StickerObj{
    emojiList: emoji[];
    emojiRedos: emoji[];
    drag(changeX: number, changeY: number): void;
}

interface selectTool{
    x: number;
    y: number;
    option: number;
}

const disp: displayObj = {
    display(ctxParam : CanvasRenderingContext2D): void{
        ctxParam.clearRect(0, 0, size, size);
        ctxParam.fillRect(0,0,size, size);
        let lineNum = 0;
        let emojiNum = 0;
        
        if(colorIndex >= colors.length){
            colorIndex = 0;
        }
        for (const line of drawPositions) {
            ctxParam.strokeStyle = colors[drawPositions[lineNum].color];
            if(drawPositions[lineNum] != undefined){
                ctxParam.lineWidth = drawPositions[lineNum].thick;
            }
            if (line.pos.length > 1) {
                ctxParam.beginPath();
                const { x, y } = line.pos[0];
                ctxParam.moveTo(x, y);
                for (const { x, y } of line.pos) {
                    ctxParam.lineTo(x, y);
                }
                ctxParam.stroke();
            }
        lineNum++;
        }
        for (const positions of emojiSticker.emojiList){
            ctxParam.fillText(emojis[positions.e], positions.x, positions.y);
            emojiNum++;
        }
    },
    moveCursor() {
        disp.display(ctx);
        ctx.beginPath();
        ctx.font = "32px monospace";
        if(penTool.option > 0){
            ctx.fillText(emojis[penTool.option - 1], penTool.x - 18, penTool.y + 10);
        }else{
            ctx.arc(penTool.x, penTool.y, 1, 0, 2 * Math.PI);
        }
        ctx.stroke();
    },
}

const emojiSticker: StickerObj = {
    emojiList: [],
    emojiRedos: [],
    drag(changeX, changeY){
        ctx.font = "32px monospace";
        this.emojiList.push({x: changeX - 18, y: changeY + 10, e: penTool.option - 1});
        drawPositions.push({pos: [], color: 0, thick: 0});
    }
}

const penTool: selectTool = {
    x: 0, 
    y: 0,
    option: 0,
}

thinButton.addEventListener("click", () => {
    currentThick = 1;
    penTool.option = 0;
})

thickButton.addEventListener("click", () => {
    currentThick = 4;
    penTool.option = 0;
})

clearButton.addEventListener("click", () => {
    ctx.clearRect(0,0,size,size);
    ctx.fillRect(0, 0, size, size);
    drawPositions = [];
    redoPositions = [];
    emojiSticker.emojiList = [];
    emojiSticker.emojiRedos = [];
    })

exportButton.addEventListener("click", () => {
    size *= 4;
    const tempCanvas = document.getElementById("canvas");
    const tempCtx = tempCanvas!.getContext("2d");
    disp.display(tempCtx);
    const anchor = document.createElement('a');
    anchor.href = tempCanvas!.toDataURL("image/png");
    anchor.download = 'drawing.png';
    anchor.click();
    size /= 4;
})

rotation!.addEventListener("input", (e) =>{
    degrees!.textContent = e.target!.value;
    if (penTool.option > 0){
        canvas!.addEventListener("mousedown", () => {
            ctx.translate(penTool.x, penTool.y);
            ctx.rotate((e.target!.value * Math.PI) / 180);
            ctx.translate(-penTool.x, -penTool.y);
        })
    }
});

canvas!.addEventListener("mouseleave", () => {
    disp.display(ctx);
})

//functions borrowed from https://quant-paint.glitch.me/paint1.html 
undoButton.addEventListener("click", () => {
    if (drawPositions.length > 0) {
        if ((drawPositions[drawPositions.length - 1].pos.length == 0)){
            const moveEmoji = emojiSticker.emojiList.pop()
            emojiSticker.emojiRedos.push(moveEmoji!);
        }
        redoPositions.push(drawPositions.pop()!);
        dispatchEvent(changEvent);
    }
});

redoButton.addEventListener("click", () => {
    if (redoPositions.length > 0) {
        if (redoPositions[redoPositions.length - 1].pos.length == 0){
            const moveEmoji = emojiSticker.emojiRedos.pop()
            emojiSticker.emojiList.push(moveEmoji!);
        }
        drawPositions.push(redoPositions.pop()!);
        dispatchEvent(changEvent);
    }
});

globalThis.addEventListener("drawing-changed", () => {
    disp.display(ctx);
})

globalThis.addEventListener("tool-moved", () => {
    ctx.lineWidth = currentThick;
    disp.moveCursor();
})

canvas!.addEventListener("mousedown", (e) => {
    dispatchEvent(toolMoved);
    penTool.x = e.offsetX;
    penTool.y = e.offsetY;
    isDraw = true;
    thisLine = [];
    thisLine.push({x: e.offsetX, y: e.offsetY});
    if (penTool.option > 0){
        emojiSticker.drag(e.offsetX, e.offsetY);
    }else{
        drawPositions.push({pos: thisLine, color: colorIndex, thick: currentThick});
    }
    redoPositions.splice(0, redoPositions.length);
    colorIndex++;
    dispatchEvent(changEvent);
});

canvas!.addEventListener("mousemove", (e) => {
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
        thisLine = [];
        isDraw = false;
        dispatchEvent(changEvent);
    }
});