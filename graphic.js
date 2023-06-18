import {rowbyrow, block} from "./functions.js"

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

    // Get a reference to the canvas object
    var canvas = document.getElementById('myCanvas');
    // Create an empty project and a view for the canvas:
    paper.setup(canvas);
    // Create a Paper.js Path to draw a line into it:

    const scx = document.getElementById("schor").value / 50;
    const scy = document.getElementById("scver").value / 50;
    const unit = document.getElementById("unit").value;
    var lines = document.getElementById("config").value.split("\n");
    var rows = [];
    var level = 0;

    var L_height = 40;
    var s_height = 20;
    const height = { L: L_height, s: s_height };
    var globalwidth = 0;
    var globalheight = 0;
    const margins = [20, -10]

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
            let i = h.length;
            while (i--) {
                globalheight += height[h[i]];
            }
        } else if (l != '') {
            let entry = new block(l.trim());
            entry.unit = unit
            rows[rows.length - 1].push(entry);
            if (entry.delta.includes("+")) {
                globalwidth += entry.value;
            }
        }
    }
    rows.splice(-1, 1); //delete the last bit

    //settings
    const scaling = [globalheight / globalwidth, 1]
    scaling[0] *= scx
    scaling[1] *= scy
    const skew = 0.3 / scaling[0];
    const tang = (globalheight / globalwidth) * 0.2;
    var coords = [0, 0];
    var loop = [];
    //drawing the whole thing
    rowbyrow(rows, height, coords, tang, skew, scaling, margins);

}