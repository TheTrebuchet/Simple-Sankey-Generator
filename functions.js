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
function delta(entry, height, coords, tang, skew, scaling, margx, margy, txs) {
    const typ = entry.delta;
    const mass = entry.value;
    const name = entry.name;
    var insert = (tang * mass*scaling[0]) / 2;
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
            verts.push([preverts[i][0] + preverts[i][1]*scaling[1] * skew,
            preverts[i][1]
            ]);
        }
    } else if (typ == "+") {
        let preverts = geo[typ];
        for (let i = 0; i < preverts.length; i++) {
            verts.push([
                preverts[i][0] + (preverts[i][1] + height)*scaling[1] * skew,
                preverts[i][1]
            ]);
        }
    } else {
        verts = geo[typ];
    }
    for (let i = 0; i < verts.length; i++) {
        verts[i] = [(verts[i][0] + coords[0]) * scaling[0] + margx, -(verts[i][1] + coords[1]) * scaling[1] + margy];
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
export function rowbyrow(rows, height, coords, tang, skew, scaling, margx, margy, txs, loop) {
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
                rowbyrow(entry, height, [coords[0] + mass, coords[1]], tang, skew, scaling, margx, margy, txs, loop);
                //if last blocks were outputting, the coords are updated accordingly
                for (let i = 1; i < entry.length - 1; i++) {
                    let b = entry[entry.length - 1][i];
                    if (b.delta.includes('-')) {
                        coords[0] += b.value;
                    }
                }
                continue;
            }
            delta(entry, h, [coords[0] + mass, coords[1]], tang, s, scaling, margx, margy, txs);
            if (entry.delta.includes("@")) {
                loop.push([entry, (coords[0]+mass)*scaling[0]+margx, -coords[1]*scaling[1]+margy, h])
            }
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

export function grider(size, unit, glh, glw, marg, scaling, txs, loopinit, arcmarg, loopmarg) {
    
    if (loopinit) {
        glh+=loopinit*scaling[0]*2+arcmarg*2
        glw+=arcmarg+loopmarg+loopinit*scaling[0]
    }
    var xsize = scaling[0]*size;
    var xlen = Math.ceil((glw+marg)/xsize)+2;
    var ylen = Math.ceil((glh+marg)/xsize)+3;
    var xlim = (xlen-2)*xsize+marg
    var ylim = (ylen-2)*xsize+marg
    for (let i = 0; i < xlen; i++) {
        var path = new Path();
        gridersettings(path)
        let dist = (i-1)*xsize+marg;
        path.add(new Point(dist, 0));
        path.add(new Point(dist, ylim))
    }
    
    for (let i = 0; i < ylen; i++) {
        var path = new Path();
        gridersettings(path)
        let dist = (i-1)*xsize+marg;
        path.add(new Point(0, dist));
        path.add(new Point(xlim, dist))
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

export function loopygoop(loop, marg, loopmarg, arcmarg, scaling, height) {
    //outer
    //testing
    
    var inleftx = loop[0][1]
    var inlefty = loop[0][2]
    var outleftx = loop[1][1]
    var outlefty = loop[1][2]+loop[1][3]*scaling[1]
    var width = loop[0][0].value*scaling[0]
    var sl = [
        [[marg, marg+width+arcmarg],[marg, marg+width+arcmarg+height]],
        [[marg+width, marg+width+arcmarg], [marg+width, marg+width+arcmarg+height]],
        [[marg+width+arcmarg, inlefty-arcmarg], [inleftx-arcmarg, inlefty-arcmarg]],
        [[marg+width+arcmarg, inlefty-arcmarg-width], [inleftx-arcmarg, inlefty-arcmarg-width]],
        [[marg+width+arcmarg, marg+width+2*arcmarg+height], [outleftx-arcmarg, marg+width+2*arcmarg+height]],
        [[marg+width+arcmarg, marg+2*width+2*arcmarg+height], [outleftx-arcmarg, marg+2*width+2*arcmarg+height]],
        [[inleftx, inlefty],[inleftx, marg+width+arcmarg]],
        [[inleftx+width, inlefty],[inleftx+width, marg+width+arcmarg]],
        [[outleftx, outlefty],[outleftx, marg+width+arcmarg+height]],
        [[outleftx+width, outlefty],[outleftx+width, marg+width+arcmarg+height]],
    ]
    
    for (let i=0; i<sl.length; i++) {
        var path = new Path()
        path.strokeColor = 'black'
        path.add(new Point(sl[i][0]))
        path.add(new Point(sl[i][1]))
    }
    var kurwy =[
        circle(sl[2][1],sl[6][1]),
        circle(sl[2][0],sl[1][0]),
        circle(sl[3][0],sl[0][0]),
        circle(sl[3][1],sl[7][1]),
        circle(sl[4][0],sl[1][1]),
        circle(sl[4][1],sl[8][1]),
        circle(sl[5][0],sl[0][1]),
        circle(sl[5][1],sl[9][1]),
    ]
    for (let i=0; i<kurwy.length; i++) {
        var path = new Path.Arc(new Point(kurwy[i][0]), new Point(kurwy[i][1]), new Point(kurwy[i][2]))
        path.strokeColor = 'black'
    }
}

function circle(a,b) {
    return [a,[(b[0]-a[0])*(2**0.5)/2+a[0], b[1]-(b[1]-a[1])*(2**0.5)/2],b]
    
}