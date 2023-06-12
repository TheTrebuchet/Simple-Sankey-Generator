import {Interactive} from "https://vectorjs.org/index.js";


let myInteractive = new Interactive("my-interactive");
myInteractive.border = true
let line = myInteractive.line( 40,40,80,80)

class block {
    constructor(line) {
        this.name = line.substring(line.indexOf(" ") + 1); // get the name
        this.delta = line
            .substring(0, line.indexOf(" "))
            .match(/[-+@=]/g)
            .join(""); //get +-etc
        this.value = parseFloat(
            line.substring(0, line.indexOf(" ")).match(/[\d.]/g).join("")
        ); //get just the value
    }
}
//for drawing the box
function delta(typ, mass, height, name, coords, tang, skew) {
    var insert = (tang * mass) / 2;
    if (insert > 0.2 * height) {
        insert = 0.2 * height;
    }

    var geo = {
        "=": [
            [0, 0],
            [mass, 0],
            [mass, -height],
            [0, -height],
            [0, 0],
        ],
        "+": [
            [0, 0],
            [mass / 2, -insert],
            [mass, 0],
            [mass, -height],
            [0, -height],
            [0, 0],
        ],
        "-": [
            [0, 0],
            [mass, 0],
            [mass, -height],
            [mass / 2, -height - insert],
            [0, -height],
            [0, 0],
        ],
        "+@": [
            [mass, 0],
            [mass, -height],
            [0, -height],
            [0, 0],
        ],
        "-@": [
            [0, -height],
            [0, 0],
            [mass, 0],
            [mass, -height],
        ],
    };
    var verts = [];
    if (typ == "-") {
        let preverts = geo[typ];
        for (let i = 0; i < preverts.length; i++) {
            verts.push([preverts[i][0] + preverts[i][1] * skew, preverts[i][1]]);
        }
    } else if (typ == "+") {
        let preverts = geo[typ];
        for (let i = 0; i < preverts.length; i++) {
            verts.push([
                preverts[i][0] + (preverts[i][1] + height) * skew,
                preverts[i][1],
            ]);
        }
    } else {
        verts = geo[typ];
    }
    for (let i = 0; i < verts.length; i++) {
        (verts[i] = verts[i][0] + coords[0]), verts[i][1] + coords[1];
    }

    //xy is coordinates of name
    let xy = [mass / 2, -height / 2];
    if (typ == "+") {
        xy[0] += -xy[1] * skew + coords[0];
    } else {
        xy[0] += xy[1] * skew + coords[0];
    }
    xy[1] += coords[1];
    for (let i = 0; i < verts.length - 1; i++) {
        
        let line = myInteractive.line( 20,20,40,40)
        //plt.plot((verts[i][0],verts[i+1][0]), (verts[i][1],verts[i+1][1]), c='black',zorder=1)

    }
    //ax.annotate(name + '\n'+str(round(mass,2)) + args.unit, xy, ha='center', va='center',zorder=2).draggable()
}
//draws the whole figure, THE IMPORTANT PART
function rowbyrow(rows, coords) {
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let h = 0;
        for (let i = 0; i < row[0].length; i++) {
            h += height[row[0][i]];
        }
        let mass = 0;
        let out = 0;
        let ind = rows.indexOf(row);
        let s = skew;
        if (ind == 0 || ind == len(rows) - 1) {
            s = 0;
        }
        for (let i = 1; i < row.length; i++) {
            let entry = row[i];
            if (!(typeof entry == "block")) {
                rowbyrow(entry, [coords[0] + mass, coords[1]]);
                //if last blocks were outputting, the coords are updated accordingly
                for (let i = 1; i < entry[-1].length; i++) {
                    let b = entry[-1][i];
                    if ("-" in b.delta) {
                        coords[0] += b.value;
                    }
                }
                continue;
            }
            if ("@" in entry.delta) {
                loop.push([entry, coords.copy(), h]);
            }
            delta(
                entry.delta,
                entry.value,
                h,
                str(entry.name),
                [coords[0] + mass, coords[1]],
                tang,
                s
            );
            mass += float(entry.value);
            if ("-" in entry.delta) {
                out += float(entry.value);
            }
        }
        coords[1] -= h;
        coords[0] += out;
    }
}
//import { readFileSync } from "fs";


const fs = require('fs');
const text = fs.readFileSync("input.txt", "utf8");
var lines = text.split("\n");
var rows = [];
var level = 0;

var L_height = 0.2;
var s_height = 0.1;
const height = { L: L_height, s: s_height };
var globalwidth = 0;
var globalheight = 0;

for (let i = 0; i < lines.length; i++) {
    //if (!(lines[i])) {continue; }
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
    } else {
        let entry = new block(l.trim());
        rows[rows.length - 1].push(entry);
        if (block.delta.includes("+")) {
            globalwidth += block.value;
        }
    }
}
rows.splice(-1, 1); //delete the last bit

//settings
skew = globalwidth * args.skew;
tang = (globalheight / globalwidth) * args.tang;
coords = [0, 0];
loop = [];

//drawing the whole thing
//rowbyrow(rows,coords)
