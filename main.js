var canvas, ctx,
width = 700, height = 600,
sens = 0.003,

circles = [],
rectangles = [],

MIN_DIST = .2,

time = 0,

keys = [],

player = {
    pos: new Point(10, 10),
    a: 0,
    sens: 0.05,

    select_mode: false,
    circle_i: -1,

    update: function() {        
        if(keys[87]) this.pos.add(Math.cos(this.a), Math.sin(this.a));
        if(keys[83]) this.pos.add(-Math.cos(this.a), -Math.sin(this.a));
        if(keys[65]) this.pos.add(-Math.cos(this.a+Math.PI/2), -Math.sin(this.a+Math.PI/2));
        if(keys[68]) this.pos.add(Math.cos(this.a+Math.PI/2), Math.sin(this.a+Math.PI/2));

        if(keys[39]) this.a+=this.sens;
        if(keys[37]) this.a-=this.sens;

        if(this.select_mode) {
            if(this.circle_i < 0 && this.circle_i > circles.length-1) {
                this.select_mode = false;
                this.circle_1 = -1;
                console.log("Erorrsss");
            }
            let posX = this.pos.x + Math.cos(this.a)*(circles[this.circle_i].r+30)
            let posY = this.pos.y + Math.sin(this.a)*(circles[this.circle_i].r+30)
            circles[this.circle_i].pos = new Point(posX, posY);
        }
    },

    render: function() {
        ctx.fillStyle = "white";
        renderCircle(this.pos, 5, true);

        const minLen = getMinDist(this.pos, false);

        ctx.fillStyle = color(255,255,255, 0.4);
        renderCircle(this.pos, minLen, true);
    },

    select_circle: function() {
        if(!this.select_mode) {
            let circle = getMinDist(this.pos);
            if(circle) {
                if(circle.len > 10) return;
                this.circle_i = circle.i;
                this.select_mode = true;
            }
        } else {
            this.circle_i = null;
            this.select_mode = false;
        }
    }
};

function init() {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    document.addEventListener('keydown', e => {
        keys[e.keyCode] = true;
        if(e.keyCode == 69) {
            player.select_circle();
        }
    });

    document.addEventListener('keyup', e => {
        delete keys[e.keyCode];
    });

    document.addEventListener("mousemove", function(e) {
        var movementX = e.movementX       ||
                        e.mozMovementX    ||
                        e.webkitMovementX ||
                        0;

        player.a += movementX*sens;
      
        // Imprime los valores delta del movimiento del mouse
        //console.log("movementX=" + movementX, "movementY=" + movementY);
      }, false);

    start();
}

function genShapes() {
    //Idx 0 will always be the light source, radious = 1 cos raytracing will not detect it
    circles.push({pos: new Point(5, 5), r: 1, color: {r: 355, g: 355, b: 355}});
    
    //Idx 1 will always be repositioned to the player pos, radious = 1 cos raytracing will not detect it
    circles.push({pos: player.pos, r: 1, color: {r: 355, g: 355, b: 355}});

    // Circlesa
    circles.push({pos: new Point(200, 60), r: 2, color: {r: 255, g: 0, b: 0}});
    circles.push({pos: new Point(70, 150), r: 5, color: {r: 0, g: 255, b: 0}});
    circles.push({pos: new Point(300, 10), r: 40, color: {r: 0, g: 0, b: 255}});
    circles.push({pos: new Point(460, 120), r: 35, color: {r: 255, g: 255, b: 0}});
    circles.push({pos: new Point(600, 150), r: 17, color: {r: 255, g: 0, b: 255}});
    circles.push({pos: new Point(250, 60), r: 25, color: {r: 0, g: 255, b: 255}});
    circles.push({pos: new Point(500, 150), r: 12, color: {r: 255, g: 200, b: 155}});
    
    // Rectangles
    rectangles.push({pos: new Point(-1, 0), w: 1, h: height, color: {r: 100, g: 180, b: 255}});
    rectangles.push({pos: new Point(0, -5), w: width, h: 5, color: {r: 100, g: 180, b: 255}});
    rectangles.push({pos: new Point(width, 0), w: 1, h: height, color: {r: 100, g: 180, b: 255}});
    rectangles.push({pos: new Point(0, height), w: width, h: 5, color: {r: 100, g: 180, b: 255}});
}

function start() {
    genShapes();
    window.requestAnimationFrame(game_loop);
}

function game_loop() {
    update();
    render();
    window.requestAnimationFrame(game_loop);
}

function update() {
    player.update();
    time++;
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    raytracingCalcAndRender(player.a, width, Math.PI/4);
}

function raytracingCalcAndRender(a, rays, fov) {
    let spacing = fov/rays;
    let pW = width/rays;
    for(j = 0; j < rays; j++) {
        let collision = traceRay((j*spacing+a) - fov/2, player.pos, false);
        let d = dist(this.player.pos, collision.pos);
        if(d < 500) {
            let col = traceRay(Point.a(collision.pos, circles[0].pos), collision.pos, true);
            let diff = 0;
            if(dist(collision.pos, circles[0].pos) > dist(collision.pos, col.pos)) {
                diff = 100;
            }
            ctx.fillStyle = color(collision.color.r - diff, collision.color.g - diff, collision.color.b - diff, (d/400)*-1+1);
            
        } else continue;
        let pH = (height/d) * 6;
        ctx.fillRect(j*pW, height/2 - pH/2, pW, pH);
    }
}

function traceRay(a, p, light) {
    let curr_dist = Number.MAX_VALUE;
    let target = new Point(Math.cos(a)*700, Math.sin(a)*700);
    target.add(p.x, p.y);
    //renderLine(p, target);
    let nextPos = new Point(p.x + Math.cos(a)*1.5, p.y + Math.sin(a)*1.5);
    let c = {};
    while(curr_dist > MIN_DIST && dist(p, nextPos) < 50000) {
        d = getMinDist(nextPos, light);
        curr_dist = d.len;
        c = d.color;
        nextPos = new Point(nextPos.x + Math.cos(a)*curr_dist, nextPos.y + Math.sin(a)*curr_dist);
    }
    return {pos: nextPos, color: c};
}

function getMinDist(p, light) {
    let minLen = Number.MAX_VALUE;
    let color = {r: 0, g: 0, b: 0};
    let idx = null;

    for(i = light ? 1 : 0; i < circles.length; i++) {
        if(!light && i == 1) continue;
        const d = distToCircle(p, circles[i].pos, circles[i].r);
        if(minLen > d) {
            minLen = d;
            color = circles[i].color;
            idx = i;
        }
    }

    for(i = 0; i < rectangles.length; i++) {
        const d = distToRect(p, rectangles[i].pos, rectangles[i].w, rectangles[i].h);
        if(minLen > d) {
            minLen = d;
            color = rectangles[i].color;
            idx = null;
        }
    }

    return {i: idx, len: minLen, color: color};
}

function insideMap(p) {
    if(p.x > 0 && p.x < width && p.y > 0 && p.y < height) {
        return true;
    }
    return false;
}

function renderCircle(p, r, fill) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
    if(fill) ctx.fill();
    else ctx.stroke();
}

function renderLine(p0, p1, color) {
    if(!color) color = "white";
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
}

function dist(p0, p1) {
    const dx = p0.x - p1.x;
    const dy = p0.y - p1.y;
    return Math.sqrt(dx*dx+dy*dy);
}

function len(v) {
    return Math.sqrt(v.x*v.x+v.y*v.y);
}

function distToCircle(p, c, r) {
    return dist(p, c) - r;
}

function distToRect(p, c, w, h) {
    var cx = Math.max(Math.min(p.x, c.x+w ), c.x);
    var cy = Math.max(Math.min(p.y, c.y+h), c.y);
    return Math.sqrt((p.x-cx)*(p.x-cx) + (p.y-cy)*(p.y-cy));
}

function color(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + (a ? ", " + a : "") + ")";
}

function lockMouse() {
    // Pointer lock
    canvas.requestPointerLock = canvas.requestPointerLock ||
			     canvas.mozRequestPointerLock ||
			     canvas.webkitRequestPointerLock;

    // Ask the browser to lock the pointer
    canvas.requestPointerLock();
}

window.onload = function() {
    var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

    console.log("Pointer Lock: " + havePointerLock);

    init();
}