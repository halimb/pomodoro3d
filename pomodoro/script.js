/* UNCOMMENT FOR ONLINOE USE 
 THEN MODIFY the drawPom function to use:
 loader.load(json, function(obj))
 instead of obj = loader.parse(json)*/
//var jsonPom = "https://cdn.rawgit.com/halimb/threejs-projects/e441512c/pomodoro/models/pomodoro.json";
//var jsonProto = "https://cdn.rawgit.com/halimb/threejs-projects/e441512c/pomodoro/models/protopom.json";
//var jsonPlane = "https://cdn.rawgit.com/halimb/threejs-projects/e441512c/pomodoro/models/p_plane.json";
//var dingUrl = "https://cdn.rawgit.com/halimb/threejs-projects/938241fc/pomodoro/sound/ding.mp3";
//var clickUrl = "https://cdn.rawgit.com/halimb/threejs-projects/3f61b33e/pomodoro/sound/click.mp3";
var dingUrl = "sound/ding.mp3";
var clickUrl = "sound/click.mp3"

//Canvas
var dimW = 1000;
var dimH = 600
var c = document.getElementById("cnv");
c.height = dimH; c.width = dimW;

//Scene 
var scene, renderer, camera, controls, clear, loader;

//Pomodoro
var pomTop, bottom, protoPom, rotating, previous, deg;
var rotationSpeed = 0.025, theta = 0;

//Timer
var work = true;
var remTime = 0;
var workTime = 0;
var restTime = 0;
var startAt, timer, min = 0, prevMin = 0, prev = 0; 
var ding = new Audio(dingUrl);
var click = new Audio(clickUrl);
click.volume = 0.2;

//Text display
var workDisplay = document.getElementById("work-time");
var restDisplay = document.getElementById("rest-time");

//Controls
var start = document.getElementById("start-btn");
var pause = document.getElementById("pause-btn");
start.onclick = function(){if(!timer.running){timer.start();}};
pause.onclick = pauseTimer;

var workUp = document.getElementById("work-up");
var workDown = document.getElementById("work-down");
workUp.onclick = minUp;
workDown.onclick = minDown;

//Mouse events
c.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);

init();
anim();

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

									if(child.name == "Gauge" || child.name == "Needle") {
										child.material.emissive.r = 1;
										child.material.emissive.g = 1;
										child.material.emissive.b = 1;
										child.material.emissiveIntensity = 0.2;
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



function render() {
	renderer.render(scene, camera);
}

function anim() {
	requestAnimationFrame(anim);
	countdown();
	render();
	//controls.update();
}


// >>>>>>>> Click handlers
function onMouseDown(event) {
	var intersects = getIntersects(event);
	if(intersects.length > 0) {
		for(var i = 0; i < intersects.length; i++) {
			if(intersects[i].object == protoPom) {
				timer.stop();
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
			rotateTo(actual);
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
	controls.enabled = true;
	if(rotating) {
		rotating = false;
		document.body.style.cursor = "default";
		setTimer(min * 60);
		console.log("MIN ============" + min)
	}
}


//Pomodoro

/* Rotate the pomodoro top around its axis 
  by the given angle and update the timer
  and text display */
function rotateBy(angle) {
	theta -= angle;

	//prevent from rotating to the left of 0mn
	if(theta <= 0) {
		//theta += angle;
		theta = 0;
		ding = new Audio(dingUrl);
		ding.play();
		rotating = false;
	}

	//prevent from rotating past 55mn
	else if(theta > Math.PI * 11/6) {
		theta += angle;
		angle = 0;
	}


	//set the new rotation
	pomTop.rotation.y = -theta;

	//update degrees and minutes
	deg = theta * 180 / Math.PI;
	min = Math.round(100 * deg / 6) / 100;

	var diff = Math.abs(Math.floor(min) - Math.floor(prevMin));
	if(diff >= 1) {
		prevMin = min;
		//Control click sound rate
		if(Math.abs(angle) <= 0.02) {
			click = new Audio(clickUrl);
	        click.volume = 0.2;
		}
		click.play();
	}

	//update info display
	//var secs = min * 60;
	//showTime(secs)

}

/* Rotate the pomodoro top around its axis
  to the current cursor location */
function rotateTo(actual) {
		//Z axis
		var axis = new THREE.Vector3(0, 0, 1);

		//current intersection point
		actual.y = 0;

		//angle between the previous and current intersection points
		var angle = axis.angleTo(actual) - axis.angleTo(previous);

		//get the rotation's direction 
		if(actual.x < 0 ) {
			angle = - angle;
		}

		//limit the rotation speed
		while(Math.abs(angle) > rotationSpeed) {
			angle -= angle / 10;
		}

		rotateBy(angle);

		//set previous for the next iteration	
		previous = actual;
		previous.y = 0;
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


//TIMER 
function setTimer(seconds) {
	startAt = seconds;
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

/* Display fortmatted remaining time and update 
   pomodoro rotation during work session */
function showTime(secs) {
	var minutes = Math.floor(secs / 60); 
	var seconds = Math.floor(secs % 60);
	var m = "m";
	if(seconds < 10) {
		m += "0";
	}

	if(work) {
		workDisplay.innerHTML = minutes + m + seconds + "s";
		min = Math.floor(min + 1);
		var delta = (min * Math.PI / 30) - theta;
		var angle = - (delta) 
		rotateBy(angle);
	} 
	else {
		restDisplay.innerHTML = minutes + m + seconds + "s";
	}
}

//Update rotation and text display with timer progress 
function countdown() {
	if(timer.running) {
		remTime = getRemaining();
		if(remTime >= 0) {
			showTime(remTime);
		}
		else{
			showTime(0);
			timer.stop();
			ding.play();
		}
	}
}

//round up the timer and pomodoro to the next minute.
function minUp() {
	timer.running = false;

	if(remTime < 3300) {
		var secs = 60 - remTime % 60;
		remTime += secs;
		setTimer(remTime);
		showTime(remTime);
	}
}

//round down the timer and pomodoro to the previous minute.
function minDown() {
	timer.running = false;
	min = Math.ceil(min - 1);
	var delta = theta - (min * Math.PI / 30);
	var angle = delta;
	rotateBy(angle);
	if(workTime > 0) {
		var secs = workTime % 60;
		workTime -= (secs > 0) ? secs : 60;
		setTimer(workTime);
		showTime(workTime);
	}
}


