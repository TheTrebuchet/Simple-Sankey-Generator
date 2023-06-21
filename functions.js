export class block {
    constructor(line, unit) {
        this.name = line.substring(line.indexOf(" ") + 1).replace(/\\n/g, '\n'); // get the name
        this.delta = line
            .substring(0, line.indexOf(" "))
            .match(/[-+@=]/g)
            .join(""); //get +-etc
        this.value = parseFloat(
            line.substring(0, line.indexOf(" ")).match(/[\d.]/g).join("")
        ); //get just the value
        this.unit = unit
    }
}
//for drawing the box
function delta(entry, height, coords, tang, skew, scaling, margins, txs) {
    const typ = entry.delta;
    const mass = entry.value;
    const name = entry.name;
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
            verts.push([preverts[i][0] + preverts[i][1] * skew,
            preverts[i][1]
            ]);
        }
    } else if (typ == "+") {
        let preverts = geo[typ];
        for (let i = 0; i < preverts.length; i++) {
            verts.push([
                preverts[i][0] + (preverts[i][1] + height) * skew,
                preverts[i][1]
            ]);
        }
    } else {
        verts = geo[typ];
    }
    for (let i = 0; i < verts.length; i++) {
        verts[i] = [(verts[i][0] + coords[0]) * scaling[0] + margins, -(verts[i][1] + coords[1]) * scaling[1] + margins];
    }

    var path = new Path();
    path.strokeColor = 'black';
    let x = 0
    let y = 0
    for (let i = 0; i < verts.length; i++) {
        path.add(new Point(verts[i][0], verts[i][1]))
        x += verts[i][0]
        y += verts[i][1]
    }
    let xy = [x / verts.length, y / verts.length]

    var text = new PointText(new Point(xy[0], xy[1]));
    text.justification = 'center';
    text.fillColor = 'black';
    text.fontFamily = 'serif'
    text.fontSize = txs;
    text.content = name + ' ' + String(mass) + entry.unit;
}
//draws the whole figure, THE IMPORTANT PART
export function rowbyrow(rows, height, coords, tang, skew, scaling, margins, txs) {
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
        if (ind == 0 || ind == rows.length - 1) {
            s = 0;
        }
        for (let i = 1; i < row.length; i++) {
            let entry = row[i];
            if (!entry.name) {
                rowbyrow(entry, height, [coords[0] + mass, coords[1]], tang, skew, scaling, margins, txs);
                //if last blocks were outputting, the coords are updated accordingly
                for (let i = 1; i < entry.length - 1; i++) {
                    let b = entry[entry.length - 1][i];
                    if (b.delta.includes('-')) {
                        coords[0] += b.value;
                    }
                }
                continue;
            }
            if (entry.delta.includes('@')) {
                loop.push([entry, coords.copy(), h]);
            }
            delta(entry, h, [coords[0] + mass, coords[1]], tang, s, scaling, margins, txs);
            mass += entry.value;
            if (entry.delta.includes("-")) {
                out += entry.value;
            }
        }
        coords[1] -= h;
        coords[0] += out;
    }
}

function gridersettings(path) {
    path.strokeColor = '#c4c4c4';
    path.strokeWidth = 1;
    path.dashArray = [8, 4];
}

export function grider(size, unit, glh, glw, marg, scaling, txs) {
    var xsize = scaling[0]*size;
    var xlen = Math.ceil((glw*scaling[0]+marg)/xsize)+2;
    var ylen = Math.ceil((glh*scaling[1]+marg)/xsize)+2;
    var xlim = (xlen-2)*xsize+marg
    var ylim = (ylen-2)*xsize+marg
    for (let i = 0; i < xlen; i++) {
        var path = new Path();
        gridersettings(path)
        let xvar = (i-1)*xsize+marg;
        path.add(new Point(xvar, 0));
        path.add(new Point(xvar, ylim))
    }
    
    for (let i = 0; i < ylen; i++) {
        var path = new Path();
        gridersettings(path)
        let xvar = (i-1)*xsize+marg;
        path.add(new Point(0, xvar));
        path.add(new Point(xlim, xvar))
    }
    var frame = [[1,1],[1,ylim], [xlim, ylim], [xlim, 1], [1,1]]
    for (let i = 0; i < 4; i++) {
        var path = new Path()    
        path.strokeColor = '#c4c4c4';
        path.strokeWidth = 2;
        path.add(new Point(frame[i]))
        path.add(new Point(frame[i+1]))

    }
    var start = [marg,ylim-xsize]
    var end = [marg+xsize,ylim-xsize]
    var ard = 5
    var arrow = [
        start,
        end,
        [start[0],start[1]],
        [start[0]+ard, start[1]-ard],
        [start[0],start[1]],
        [start[0]+ard,start[1]+ard],
        [end[0],end[1]],
        [end[0]-ard,end[1]-ard],
        [end[0],end[1]],
        [end[0]-ard,end[1]+ard]]
    for (let i=0; i<arrow.length; i+=2) {
        var path = new Path()
        path.strokeColor = 'black'
        path.add(new Point(arrow[i]))
        path.add(new Point(arrow[i+1]))
    }
    var text = new PointText(new Point(marg+xsize/2,ylim-xsize-ard));
    text.justification = 'center';
    text.fillColor = 'black';
    text.fontFamily = 'serif'
    text.fontSize = txs;
    text.content = String(size) + String(unit);
}