var canvas = document.getElementById("cnv");
var scene, camera, renderer, controls, light, theta, visible;
var camPos = new THREE.Vector3(0, 0, 40);
var camUp = new THREE.Vector3(0, 0, 1);
var cubes = [];
var lines = [];

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
  renderer.setClearColor(0xaaaaaa, 1);

  //Camera
  camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 10000);
  camera.position.set(camPos.x, camPos.y, camPos.z);
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
  theta = controls.getPolarAngle();
  //Populating the scene
  drawCubes(5, 3, 2);

  var axis = new THREE.AxisHelper(20);
  scene.add(axis);
}

function render() {
   renderer.setSize(window.innerWidth, window.innerHeight);
   update();
   //moving the light with the camera
   /*light.position.x = camera.position.x;
   light.position.y = camera.position.y;
   light.position.z = camera.position.z;*/
   renderer.render(scene, camera);
}

function drawCubes(n, dim, gap) {
  var step = dim + gap;
  var length = n * step - gap;
  var offset = length / 2;
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      for(var k = 0; k < n; k++) {
        var mat = new THREE.MeshPhongMaterial({color: 0xff7755,
                                               transparent: true,
                                               shininess: 70});
        var geo = new THREE.BoxGeometry(dim, dim, dim);
        var obj = new THREE.Mesh(geo, mat);
        obj.position.x = i * step - offset + dim / 2;
        obj.position.y = j * step - offset + dim / 2;
        obj.position.z = k * step - offset + dim / 2;
        cubes.push(obj);
        scene.add(obj);
      }
    }
  }
 /* for(var i = 0; i < n; i++) {
    var width = Math.random() * dim;
    var height = Math.random() * dim;
    var depth = Math.random() * dim;
    var rx = Math.random() * Math.PI;
    var ry = Math.random() * Math.PI;
    var rz = Math.random() * Math.PI;
    var mat = new THREE.MeshLambertMaterial(0xffffff);
    var geo = new THREE.BoxGeometry(width, height, depth);
    var obj = new THREE.Mesh(geo, mat);
    obj.position.x = Math.random() * scope - scope/2;
    obj.position.y = Math.random() * scope - scope/2;
    obj.position.z = Math.random() * scope - scope/2;
    obj.rotation.x = rx;
    obj.rotation.y = ry;
    obj.rotation.z = rz;
    scene.add(obj);
  }*/
}

function toggleLines(cb) {
  visible = cb.checked;
  for(var i = 0; i < lines.length; i++) {
    if( i == 0) {
      console.log(lines[0]);
    }
    lines[i].material.visible = visible;
  }
}

function drawLine(a, b) {
  var geo = new THREE.Geometry();
  geo.vertices.push(a);
  geo.vertices.push(b);
  var mat = new THREE.LineBasicMaterial({color: 0xff5016, visible: visible});
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
  for(var i = 0; i < cubes.length; i++) {
    cubes[i].material.opacity = 1;
    cubes[i].material.color = new THREE.Color(0xffffff);
  }
  for(var i = 0; i < lines.length; i++) {
    scene.remove(lines[i]);
  }
  lines = [];
  theta = controls.getPolarAngle();
  controls.autoRotate = true;
}

function update() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onClick(event) {
  console.log(controls.getPolarAngle())
  var intersects = getIntersects(event);
  if(intersects.length > 0) {
    controls.enabled = false;
    var i;
    for(i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color = new THREE.Color(0x00ff00);
      intersects[i].object.material.opacity = 0.1;
    }
    var pos = camera.position;
    var start = new THREE.Vector3(pos.x, pos.y, pos.z);
    var end = intersects[i-1].point;
    drawLine(start, end);
    camera.position.x += 0.0001;
    //scene.remove(intersects[0].object);
  }
}

function mouseUp() {
  controls.enabled = true;
}

function anim() {
   requestAnimationFrame(anim);
   controls.update();
   if(controls.getPolarAngle() != theta) {
     //controls.autoRotate = false;
   }
   render();
}
