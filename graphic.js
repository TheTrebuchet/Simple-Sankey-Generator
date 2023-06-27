import {rowbyrow, block, grider, loopygoop} from "./functions.js";

function generate () {
    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    // Create a Paper.js Path to draw a line into it:

    const scx = document.getElementById("schor").value / 50;
    const scy = document.getElementById("scver").value / 50;
    const marg = document.getElementById("marg").value / 2;
    const txs = document.getElementById("tsize").value / 5;
    const unit = document.getElementById("unit").value;
    const size = document.getElementById('grid').value;
    var lines = document.getElementById("config").value.split("\n");
    var rows = [];
    var level = 0;

    var L_height = 40;
    var s_height = 20;
    const height = { L: L_height, s: s_height };
    var globalwidth = 0;
    var globalheight = 0;
    var loopinit = 0;

    for (let i = 0; i < lines.length; i++) {
        let l = lines[i].trimEnd().replace("    ", "\t");

        if (l.includes("\t") && l.includes("#")) {
            level += 1;
        }
        if (level > 0 && !l.includes("\t")) {
            let indented = rows.slice(rows.length - level, rows.length);
            rows[rows.length - level - 1].push(indented);
            rows.splice(rows.length - level, level);
            level = 0;
        }
        if (l.includes("#")) {
            let h = l.trim().slice(1);
            rows.push([h]);
            if (!l.includes('\t')) {
                let i = h.length;
                while (i--) {
                    console.log(h[i])
                    globalheight += height[h[i]];
            }
            }
        } else if (l != '') {
            let entry = new block(l.trim());
            entry.unit = unit
            rows[rows.length - 1].push(entry);
            if (entry.delta.includes("+")) {
                globalwidth += entry.value;
            }
            if (entry.delta.includes("@")) {
                loopinit += entry.value;
            }
        }
    }
    loopinit /= 2;
    rows.splice(-1, 1); //delete the last bit

    //settings, all values are unscaled
    const scaling = [globalheight / globalwidth, 1]
    scaling[0] *= scx
    scaling[1] *= scy
    const skew = 0.3 / scaling[0];
    const tang = (globalheight / globalwidth) * 0.2;
    globalheight += globalwidth*tang/2
    
    var coords = [0, 0];
    //loop and margin stuff
    var loopmarg = 5*scaling[0]
    var arcmarg = 10*scaling[0]
    var margx = marg
    var margy = marg
    if (loopinit!=0) {
        margx+=loopinit*scaling[0]+loopmarg+arcmarg*2
        margy+=loopinit*scaling[1]+arcmarg
    }
    
    
    //drawing the whole thing
    if (![0,NaN].includes(parseFloat(size))) {
        grider(size, unit, globalheight, globalwidth, margx, margy, scaling, txs);
      }
    var loop = []
    rowbyrow(rows, height, coords, tang, skew, scaling, margx, margy, txs, loop);   
    console.log(loop)
    if (loopinit) {loopygoop(loop, marg, loopmarg, arcmarg, scaling, globalheight)}
    
}

paper.install(window);
window.onload = function () {
    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };
    var tool = new Tool()
    var current
    tool.onMouseDown = function (event) {
        var hitResult = project.hitTest(event.point, hitOptions);
        if (!hitResult)
            return;

        if (hitResult.type == "fill") {
            current = hitResult.item;
            }
        }
    
    tool.onMouseDrag = function(event) {
        if (current) {
            current.position = current.position.add(event.delta)
        }
    }

    tool.onMouseMove = function(event) {
        if (!event.item)
            current = null;
    }
    generate()
}

const inps = ['config', 'unit', 'grid']
for (let i=0; i<inps.length; i++) {
    let el = document.getElementById(inps[i]);
    el.addEventListener("keyup", () => {generate()});
}
    
const sliders = ['schor', 'scver', 'marg', 'tsize']
for (let i=0; i<sliders.length; i++) {
    let el = document.getElementById(sliders[i]);
    el.addEventListener("change", () => {generate()});
}