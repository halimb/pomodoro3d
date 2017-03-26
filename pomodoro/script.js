/* UNCOMMENT FOR ONLINOE USE 
 THEN MODIFY the drawPom function to use:
 loader.load(json, function(obj))
 instead of obj = loader.parse(json)*/
// var jsonPom = "https://cdn.rawgit.com/unhalium/helix_mesh/d37a5bc1/pomodoro.json";
// var jsonTop = "https://cdn.rawgit.com/unhalium/helix_mesh/f70e33c0/pomodoro_top.json"
// //var jsonTop = "https://cdn.rawgit.com/unhalium/helix_mesh/c44920e6/pom_top.json";
// var jsonBottom = "https://cdn.rawgit.com/unhalium/helix_mesh/8b27355a/pom_bottom.json";
// var jsonProto = "https://cdn.rawgit.com/unhalium/helix_mesh/6273f8c8/protoPom.json";
// var jsonPlane = "https://cdn.rawgit.com/unhalium/helix_mesh/f0e4e09d/dark.json";
// var dingUrl = "https://cdn.rawgit.com/halimb/threejs-projects/938241fc/pomodoro/sound/ding.mp3"
dingUrl = "sound/ding.mp3";


//Canvas
var dimW = 1000;
var dimH = 600
var c = document.getElementById("cnv");
c.height = dimH; c.width = dimW;

//Scene 
var scene, renderer, camera, controls, clear, loader;

//Pomodoro
var pomTop, bottom, protoPom, rotating, previous;
var rotationSpeed = 0.025, theta = 0;

//Timer
var startAt, timer, prev = 0; 
var ding = new Audio(dingUrl);

//Text display
var rotDisplay = document.getElementById("rotation");
var timeDisplay = document.getElementById("time");

function init() {
	// Creating and setting the scene
	scene = new THREE.Scene();

	// lights
	var light = new THREE.PointLight(0xffffff, 0.2, 0);
	light.position.set(20, 20, 30);
	scene.add(light);	
	var light2 = new THREE.PointLight(0xffffff, 0.2, 0);
	light2.position.set(0, 30, 0);
	scene.add(light2);
	var ambient = new THREE.AmbientLight(0xffffff);
	ambient.intensity = 0.55;
	scene.add(ambient);
	
	
	var box = new THREE.SphereGeometry(50, 12, 12);
	//var box = new THREE.BoxGeometry(50, 50, 50);
	var mat = new THREE.MeshBasicMaterial({ color: 0x000000, 
											side: THREE.DoubleSide,
											visible: false});
	
	//invisible box surrounding the scene, used for raycasting
	var rayBox = new THREE.Mesh(box, mat);
	rayBox.name = "raycasting box";
	rayBox.position.y = 50;
	scene.add(rayBox);
	
	//Creating and setting the renderer
	renderer = new THREE.WebGLRenderer({	canvas: c,
											antialias: true
										} );
	renderer.setClearColor(0xfcfcfc, 1);

	//Creating the camera and panning out on the Z axis
	camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 10000);
	camera.position.set(0.0, 4, 10);
	camera.rotateX(-Math.PI/7);
	camera.aspect = dimW / dimH;
	camera.updateProjectionMatrix();
	scene.add(camera);
	
	//CONTROLS
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	//DAMPING: call controls.update() in the animate function!
  /*controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.rotateSpeed = 0.05;*/
	

	// initalize the loader
	clear = true;
	loader = new THREE.ObjectLoader();

	//timer
	timer = new THREE.Clock(false);
	drawPom();
}

function render() {
	renderer.render(scene, camera);
}

function drawProto() {
	loader.parse(jsonProto, function(o) {
								protoPom = o.children[0];
								protoPom.name = "proto";
								protoPom.material.visible = false;
								protoPom.scale.set(0.127, 0.127, 0.425);
								protoPom.translateZ(0);
								scene.add(protoPom);	
							});
}

function drawPlane() {
		loader.parse(jsonPlane, function(plane) {
									scene.add(plane);
								});
}

function drawPom() {
	if(clear) {
		pomTop = new THREE.Object3D();
		bottom = new THREE.Object3D();

		//change ".parse" to ".load" for online use
		loader.parse(jsonPom, function(pom){
								 while(pom.children.length > 0) {
								 	var child = pom.children.pop();
								 	if(    child.name == "Gauge"
								 		|| child.name == "Top Skin"
								 		|| child.name == "Leaves" ) {
								 		pomTop.add(child);
								 	}
								 	else {
								 		bottom.add(child);
								 	}
								 }
								 pomTop.children[0].material.shininess = 5;
								 bottom.children[2].material.shininess = 5;
								 scene.add(pomTop);	
								 scene.add(bottom);
							});
		drawPlane();
		drawProto();
		clear = false;
	}
}

init();
anim();


// >>>>>>>> Click handler
function onMouseDown(event) {
	//pomTop.rotation.y -= 0.1;
	var intersects = getIntersects(event);
	if(intersects.length > 0) {
		for(var i = 0; i < intersects.length; i++) {
			if(intersects[i].object == protoPom) {
				document.body.style.cursor = "move"
				controls.enabled = false;
				rotating = true;
				previous = intersects[i].point;
				previous.y = 0;
				break;
			}
		}
	}
}

function onMouseMove(event) {
  var intersects = getIntersects(event);

  	//change pomodoro rotation with mouse drag
	if(rotating && !clear) {
		var actual;
		var intersects = getIntersects(event);
		if(intersects.length > 0) {
			if(intersects[0].object.name == "proto" || intersects.length == 1) {
				actual = intersects[0].point;
			}
			else if(intersects.length > 1){
				actual = intersects[1].point;
			}
			updateRotation(actual);
		}
	}

	//set cursor style
	else {
		if(isPom(intersects)) {
			document.body.style.cursor = "pointer";
		}
		else {
			document.body.style.cursor = "default";
		}
	}
}

function onMouseUp(event) {
	if(rotating) {
		rotating = false;
		controls.enabled = true;
		document.body.style.cursor = "default";
		console.log(pomTop.rotation.y);
		if( ! timer.running) {
			timer.start();
		}
	}
}

function updateRotation(actual) {
		actual.y = 0;
		var axis = new THREE.Vector3(0, 0, 1);
		var angle = axis.angleTo(actual) - axis.angleTo(previous);
		if(actual.x < 0 ) {
			angle = - angle;
		}
		previous = actual;
		previous.y = 0;
		while(Math.abs(angle) > rotationSpeed) {
			angle -= angle / 10;
		}
		theta -= angle;
		if(theta < 0) {
			theta += angle;
			angle = 0;
		}
		else if(theta > Math.PI * 11/6) {
			theta += angle;
			angle = 0;
		}
		pomTop.rotation.y = -theta;
		var deg = theta * 180 / Math.PI;
		var min = Math.round(100 * deg / 6) / 100;
		rotDisplay.innerHTML = Math.round(deg) + "° : " + min + "mn";
		timeDisplay.innerHTML = (min * 60) + "s"
		setTimer(min);
}

function getIntersects(event) {
	var intersects;
	var xOff = (window.innerWidth - dimW) / 2
	var yOff = (window.innerHeight - dimH) / 2
	var x = event.clientX - xOff;
	var y = event.clientY - yOff;
	if(x < 0 || y < 0 || x > dimW || y > dimH) { 
		intersects = -1; 
	}
	else {
		var raycaster = new THREE.Raycaster();
		var mouse = new THREE.Vector2();
		mouse.x = (2 * x / dimW - 1);
		mouse.y = - (2 * y / dimH - 1);
		raycaster.setFromCamera(mouse, camera);
		intersects = raycaster.intersectObjects(scene.children);
	}
	return intersects;
}

function isPom(intersects) {
	for(var i = 0; i < intersects.length; i++) {
		if(intersects[i].object == protoPom){
			return true;
		}
	}
	return false;
}

c.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);



function anim() {
	requestAnimationFrame(anim);
	render();

	var remaining = getRemaining();
	if(timer.running) {
		if(remaining >= 0) {
			timeDisplay.innerHTML = remaining + "s";
			pomTop.rotation.y = -remaining * Math.PI / 1800;
		}
		else{
			timer.stop();
			ding.play();
		}
	}
	//controls.update();
}

var start = document.getElementById("start-btn");
var pause = document.getElementById("pause-btn");
start.onclick = function(){if(!timer.running){timer.start();}};
pause.onclick = pauseTimer;

//TIMER 
function resetTimer() {

}

function setTimer(minutes) {
	startAt = minutes * 60;
	prev = 0;
}

function pauseTimer() {
	prev += timer.getElapsedTime();
	timer.stop();
}

function getRemaining() {
	var time = -1;
	if(timer.running) {
		var elapsed = timer.getElapsedTime() + prev;
		var remaining = startAt - elapsed;
		time = Math.round(remaining * 100) / 100;
	}
	return time;
}


