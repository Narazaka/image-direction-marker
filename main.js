// @ts-check

const { FileSystemObject } = require("fso");
const { dialog } = require("electron").remote;

/** @typedef {"left" | "top" | "right" | "bottom"} Direction */

/** @typedef {{file: string; direction: Direction}} Data */

const $open = /** @type {HTMLButtonElement} */(document.getElementById("open"));
const $dir = /** @type {HTMLParagraphElement} */(document.getElementById("dir"));
const $img = /** @type {HTMLImageElement} */(document.getElementById("img"));
const $log = /** @type {HTMLTextAreaElement} */(document.getElementById("log"));
const $show = /** @type {HTMLDivElement} */(document.getElementById("show"));

const logFile = new FileSystemObject("log.txt");

/** @type {FileSystemObject[]} */
let dirs = [];

/** @type {FileSystemObject[]} */
let children = [];

let marked = new Set();

/** @type {Data[]} */
let info = [];
/** @type {Data[]} */
let newInfo = [];

let index = -1;

function load() {
    // dirs = [new FileSystemObject(String.raw`C:\Users\narazaka\Pictures\VRChat\2019-09-25`)];
    dirs = dialog.showOpenDialogSync(null, {properties: ["openDirectory", "multiSelections"]}).map(dir => new FileSystemObject(dir));
    $dir.textContent = dirs.map(dir => dir.path + "\n").join("")
    $show.style.display = "block";

    if (logFile.existsSync()) {
        info = logFile.
            readFileSync("utf8").
            split(/\n/).
            map(line => line.split(/\t/)).
            map(([file, direction]) => ({file, direction: /** @type {Direction} */(direction)}));
        marked = new Set(info.map(data => data.file));
    }

    children =
        dirs.
        map(dir => dir.resolve().childrenAllSync()).
        reduce((all, child) => [...all, ...child]).
        filter(child => child.extname() === ".png").
        filter(child => !marked.has(child.path));
    index = 0;
    $img.src = children[index].path;
}

/**
 * 
 * @param {Direction} direction 
 */
function next(direction) {
    if (index >= 0) {
        newInfo[index] = {file: children[index].path, direction};
        logFile.
        writeFile(info.concat(newInfo).filter(({file, direction}) => file && direction).
        map(({file, direction}) => `${file}\t${direction}\n`).join(""))
    }
    index++;
    $img.src = children[index].path;
}

function back() {
    if (index > 0) index--;
    $img.src = children[index].path;
}

$open.onclick = () => {
    load();
}

document.addEventListener("keydown", (event) => {
    switch (event.keyCode) {
        case 0x08:
            back();
            break;
        case 0x25:
            next("left");
            break;
        case 0x26:
            next("top");
            break;
        case 0x27:
            next("right");
            break;
        case 0x28:
            next("bottom");
            break;
    }
});