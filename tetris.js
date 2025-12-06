
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = 10, H = 16, S = 30;

let field = Array.from({length:H},()=>Array(W).fill(0));
let history = [];

const shapes = [
  [[1,1,1,1]],
  [[1,1],[1,1]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]],
  [[0,1,1],[1,1,0]]
];

let gravityDirs = ["down","up","left","right"];
let gravity = randomGravity();

let current = spawn();
let lastTime = 0;

function randomGravity(){
  const g = gravityDirs[Math.floor(Math.random()*4)];
  document.getElementById("gravity").textContent =
    "重力: " + (g==="down"?"↓":g==="up"?"↑":g==="left"?"←":"→");
  return g;
}

function spawn(){
  return {
    shape: shapes[Math.floor(Math.random()*shapes.length)],
    x: 4,
    y: 0
  };
}

function saveHistory(){
  history.push({
    field: JSON.parse(JSON.stringify(field)),
    current: JSON.parse(JSON.stringify(current)),
    gravity
  });
  if(history.length > 120) history.shift();
}

function rewind(){
  if(history.length > 0){
    const prev = history.pop();
    field = prev.field;
    current = prev.current;
    gravity = prev.gravity;
  }
}

function collide(x,y,shape){
  for(let r=0;r<shape.length;r++){
    for(let c=0;c<shape[r].length;c++){
      if(shape[r][c]){
        const nx = x+c;
        const ny = y+r;
        if(nx<0||nx>=W||ny<0||ny>=H||field[ny][nx]) return true;
      }
    }
  }
  return false;
}

function applyGravity(){
  let nx=current.x, ny=current.y;
  if(gravity==="down") ny++;
  if(gravity==="up") ny--;
  if(gravity==="left") nx--;
  if(gravity==="right") nx++;

  if(!collide(nx,ny,current.shape)){
    current.x = nx;
    current.y = ny;
  } else {
    fix();
    gravity = randomGravity();
    current = spawn();
  }
}

function fix(){
  current.shape.forEach((row,r)=>{
    row.forEach((v,c)=>{
      if(v){
        field[current.y+r][current.x+c]=1;
      }
    });
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      if(field[y][x]){
        ctx.fillStyle = "#0ff";
        ctx.fillRect(x*S,y*S,S,S);
      }
    }
  }
  current.shape.forEach((row,r)=>{
    row.forEach((v,c)=>{
      if(v){
        ctx.fillStyle="#f0f";
        ctx.fillRect((current.x+c)*S,(current.y+r)*S,S,S);
      }
    });
  });
}

function loop(t=0){
  if(t-lastTime>400){
    saveHistory();
    applyGravity();
    lastTime=t;
  }
  draw();
  requestAnimationFrame(loop);
}
loop();

let startY=0;
canvas.addEventListener("touchstart",e=>{
  startY=e.touches[0].clientY;
});

canvas.addEventListener("touchend",e=>{
  let dy = startY-e.changedTouches[0].clientY;
  if(Math.abs(dy)>50){
    // フリックで一気に流す
    while(!collide(current.x,current.y+1,current.shape)){
      current.y++;
    }
  }else{
    rewind();
  }
});
