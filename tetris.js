
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

let current = spawn();
let lastTime = 0;
let nextRewindTime = Date.now() + rand(3000, 7000);

function spawn(){
  return {
    shape: shapes[Math.floor(Math.random()*shapes.length)],
    x: 4, y: 0
  };
}

function saveHistory(){
  history.push({
    field: JSON.parse(JSON.stringify(field)),
    current: JSON.parse(JSON.stringify(current))
  });
  if(history.length>300) history.shift();
}

function rewindRandom(){
  if(history.length<10) return;
  const back = rand(10, history.length);
  const prev = history[history.length-back];
  field = JSON.parse(JSON.stringify(prev.field));
  current = JSON.parse(JSON.stringify(prev.current));
  history = history.slice(0, history.length-back);
  flash();
}

function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }

function collide(x,y,shape){
  for(let r=0;r<shape.length;r++){
    for(let c=0;c<shape[r].length;c++){
      if(shape[r][c]){
        const nx=x+c, ny=y+r;
        if(nx<0||nx>=W||ny<0||ny>=H||field[ny][nx]) return true;
      }
    }
  }
  return false;
}

function applyGravity(){
  if(!collide(current.x, current.y+1, current.shape)){
    current.y++;
  } else {
    fix();
    current = spawn();
  }
}

function fix(){
  current.shape.forEach((row,r)=>{
    row.forEach((v,c)=>{
      if(v) field[current.y+r][current.x+c]=1;
    });
  });
}

function hardDrop(){
  while(!collide(current.x,current.y+1,current.shape)){
    current.y++;
  }
  fix();
  current = spawn();
  flash();
}

function flash(){
  canvas.classList.add("flash");
  setTimeout(()=>canvas.classList.remove("flash"),200);
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
  if(Date.now()>nextRewindTime){
    rewindRandom();
    nextRewindTime = Date.now()+rand(3000,7000);
  }
  draw();
  requestAnimationFrame(loop);
}
loop();

let startX=0,startY=0;
canvas.addEventListener("touchstart",e=>{
  startX=e.touches[0].clientX;
  startY=e.touches[0].clientY;
});
canvas.addEventListener("touchend",e=>{
  let dx=e.changedTouches[0].clientX-startX;

  if(Math.abs(dx)<30){
    hardDrop();
    return;
  }

  if(dx>30 && !collide(current.x+1,current.y,current.shape)) current.x++;
  if(dx<-30 && !collide(current.x-1,current.y,current.shape)) current.x--;
});
