var cubes = [];
var edges = [];
var lines = [];
var opacity = 0;
var autoRot = true;
var block = true;
var clearColor = new THREE.Color(0xaaaabb);
var cubeColor = new THREE.Color(0xff7755);
var hitColor = new THREE.Color(0x000000);
var lineColor = new THREE.Color(0xaaffaa);
var edgeColor = new THREE.Color(0x000000);
var canvas = document.getElementById("cnv");
var scene, camera, renderer, controls, light;

//Block arrangement params
var rows = 4; var dim = 3; var gap = 3;

//Random arrangement params
var n = 100; var maxDim = 4; var scope = 50;

init();
anim();

window.addEventListener("resize", update);
canvas.addEventListener("mousedown", onClick);
document.addEventListener("mouseup", mouseUp);

var btn = document.getElementById("reset");
btn.onclick = reset;

function init() {
  //Scene
  scene =  new THREE.Scene();
  //scene.fog = new THREE.FogExp2(0x404040, 0.0075);

  //Lights
  light = new THREE.PointLight(0xffffff);
  light.position.set(40, 40, 40);
  light.intensity = 0.8;
  scene.add(light);

  light2 = light.clone();
  light2.position.set(-40, -40, -40);
  scene.add(light2);

  var ambient = new THREE.AmbientLight(0xffffff);
  ambient.intensity = 0.4;
  scene.add(ambient)

  //Renderer
  renderer = new THREE.WebGLRenderer( { canvas: canvas,
                                       antialias: true } );
  renderer.setClearColor(clearColor, 1);

  //Camera
  camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 10000);
  camera.position.set(30, 30, 30);
  //camera.rotation.x = (Math.PI / 2);
  camera.updateProjectionMatrix();
  console.log(camera);
  scene.add(camera);

  //setting the orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.15;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  
  //Populating the scene
  drawCubes(rows, dim, gap);
  var axis = new THREE.AxisHelper(20);
  scene.add(axis);
}

function render() {
   renderer.setSize(window.innerWidth, window.innerHeight);
   update();
   renderer.render(scene, camera);
}

function drawCubes(n, dim, gap) {
  var step = dim + gap;
  var length = n * step - gap;
  var offset = length / 2;
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      for(var k = 0; k < n; k++) {
        var mat = new THREE.MeshPhongMaterial({color: cubeColor,
                                               transparent: true,
                                               shininess: 70});
        var geo = new THREE.BoxGeometry(dim, dim, dim);
        var edgesGeo = new THREE.EdgesGeometry(geo);
        var edge = new THREE.LineSegments(
                            edgesGeo, 
                            new THREE.LineBasicMaterial(
                                    { color: edgeColor,
                                      transparent: true,
                                      linewidth: 2})
                                         );
        var obj = new THREE.Mesh(geo, mat);
        obj.position.x = i * step - offset + dim / 2;
        obj.position.y = j * step - offset + dim / 2;
        obj.position.z = k * step - offset + dim / 2;
        edge.position.x = obj.position.x;
        edge.position.y = obj.position.y;
        edge.position.z = obj.position.z;
        cubes.push(obj);
        edges.push(edge);
        scene.add(edge);
        scene.add(obj);
      }
    }
  }
}

function drawRandom(n, dim, scope) {
  for(var i = 0; i < n; i++) {
    var width = Math.random() * dim;
    var height = Math.random() * dim;
    var depth = Math.random() * dim;
    var rx = Math.random() * Math.PI;
    var ry = Math.random() * Math.PI;
    var rz = Math.random() * Math.PI;
    var mat = new THREE.MeshPhongMaterial({color: cubeColor,
                                               transparent: true,
                                               shininess: 70});
    var geo = new THREE.BoxGeometry(width, height, depth); 
    var edgesGeo = new THREE.EdgesGeometry(geo);
    var edge = new THREE.LineSegments(
                            edgesGeo, 
                            new THREE.LineBasicMaterial(
                                    { color: edgeColor,
                                      transparent: true,
                                      linewidth: 2})
                                         );
    var obj = new THREE.Mesh(geo, mat);
    obj.position.x = Math.random() * scope - scope/2;
    obj.position.y = Math.random() * scope - scope/2;
    obj.position.z = Math.random() * scope - scope/2;
    edge.position.x = obj.position.x;
    edge.position.y = obj.position.y;
    edge.position.z = obj.position.z;
    obj.rotation.x = rx;
    obj.rotation.y = ry;
    obj.rotation.z = rz;
    edge.rotation.x = rx;
    edge.rotation.y = ry;
    edge.rotation.z = rz;
    cubes.push(obj);
    edges.push(edge);
    scene.add(obj);
    scene.add(edge);
  }
}

function toggleLines(cb) {
  opacity = cb.checked ? 1 : 0;
  for(var i = 0; i < lines.length; i++) {
    lines[i].material.opacity = opacity;
  }
}

function toggleRot(cb) {
  controls.autoRotate = cb.checked;
  autoRot = cb.checked;
}

function drawLine(a, b) {
  var geo = new THREE.Geometry();
  geo.vertices.push(a);
  geo.vertices.push(b);
  var mat = new THREE.LineBasicMaterial({color: lineColor, transparent: true,
                                        opacity: opacity,
                                        alphaTest: 0.5});
  var line = new THREE.Line(geo, mat);
  lines.push(line);
  scene.add(line);
}

function getIntersects(event) {
  var raycaster = new THREE.Raycaster();
  var click = new THREE.Vector2();
  var offset = canvas.offsetLeft;
  var top = canvas.offsetTop;
  click.x = 2 * (event.clientX - offset) / (canvas.width)- 1;
  click.y =  - (2 * (event.clientY - offset) / canvas.height - 1);
  raycaster.setFromCamera(click, camera);
  var intersects = raycaster.intersectObjects(cubes);
  return intersects;
}

function reset() {
  var radio = document.getElementById("block").checked; 
  if(radio == block) { 
    for(var i = 0; i < cubes.length; i++) {
      cubes[i].material.opacity = 1;
      cubes[i].material.color = cubeColor;
      edges[i].material.opacity = 1;
      edges[i].material.color = edgeColor;
    }
  }
  else {
    for(var i = 0; i < cubes.length; i++) {
      scene.remove()
      scene.remove(cubes[i]);
      scene.remove(edges[i]);
    }
    cubes = [];
    edges = []; 
    if(radio) {
      drawCubes(rows, dim, gap);
      block = true;
    }
    else {
      drawRandom(n, maxDim, scope);
      block = false;
    }
  }
  for(var i = 0; i < lines.length; i++) {
    scene.remove(lines[i]);
  }
  lines = [];
  controls.autoRotate = autoRot;
}

function update() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onClick(event) {
  var intersects = getIntersects(event);
  if(intersects.length > 0) {
    controls.enabled = false;
    var i;
    for(i = 0; i < intersects.length; i++) {
      var cube = intersects[i].object;
      cube.material.color = hitColor;
      cube.material.opacity = 0.1;
      var index = getCubeIndex(cube);
      edges[index].material.opacity = 0.1;
    }
    var pos = camera.position;
    var start = new THREE.Vector3(pos.x, pos.y, pos.z);
    var end = intersects[i-1].point;
    drawLine(start, end);
  }
}

function getCubeIndex(cube) {
  var res = -1;
  for(var i = 0; i < cubes.length; i++) {
    if(cubes[i] == cube) {
      res = i;
      break;
    }
  }
  return i;
}

function mouseUp() {
  controls.enabled = true;
}

function anim() {
   requestAnimationFrame(anim);
   controls.update();
   render();
}
