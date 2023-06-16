paper.install(window);
window.onload = function () {
    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 5
    };
    paper.setup('myCanvas');
    var text = new PointText(new Point(50, 50));
    text.justification = 'center';
    text.fillColor = 'black';
    text.content = 'hjello';
    var tool = new Tool()
    var current
    tool.onMouseDown = function (event) {
        segment = path = null;
        var hitResult = project.hitTest(event.point, hitOptions);
        console.log(hitResult)
        if (!hitResult)
            return;

        if (hitResult.type = "fill") {
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
}