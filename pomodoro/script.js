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

var dimW = 1000;
var dimH = 600
var c = document.getElementById("cnv");
c.height = dimH; c.width = dimW;
var pomTop, bottom, protoPom, clear, rotating, previous;
var total = 0;
var rotationSpeed = 0.025;
var scene, renderer, camera, controls, loader;
var display = document.getElementById("display");

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
	drawPom();
}

function render() {
	renderer.render(scene, camera);
}

/*
function drawTop() {
	loader.load(jsonTop, function(o) {
										pomTop = o;
										total = 0;
										pomTop.translateY(0.25)
										pomTop.rotateY(0.065);
										pomTop.children[2].material.shininess = 5;
										scene.add(pomTop);
									});
}
*/
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

function drawPom() {
	if(clear) {
		pomTop = new THREE.Object3D();
		bottom = new THREE.Object3D();

		//drawPlane();

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

		drawProto();
		clear = false;
	}
}

init();
anim();


// >  >  >  >  >  >  >  >  >  > Click handler
function onMouseDown(event) {
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

function onMouseUp(event) {
	if(rotating) {
		rotating = false;
		controls.enabled = true;
		document.body.style.cursor = "default";
		var diff = pomTop.rotation.y % (Math.PI / 30);
		pomTop.rotation.y += diff;
		// total -= diff;
		// previous = (getIntersects(event))[0].point;
		console.log("pomTop.rotation.y : " + pomTop.rotation.y);
		console.log("total : " + total);
		//total -= total % (Math.PI / 30);
		//pomTop.rotation.y = total;
	}
}

function onMouseMove(event) {
  var intersects = getIntersects(event);
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
			var delta = getAngleDelta(actual);
			pomTop.rotateY(delta);
			var deg = Math.round(total * 180 / Math.PI);
			var min = Math.round(deg / 6);
			display.innerHTML = deg + "° : " + min + "mn";
		}
	}
	else {
		if(isPom(intersects)) {
			document.body.style.cursor = "pointer";
		}
		else {
			document.body.style.cursor = "default";
		}
	}
}

function isPom(intersects) {
	var res;
	if(intersects.length > 1) {
		if(intersects[0].object.name == "proto" 
			|| intersects[1].object.name == "proto"){
				res = true;
			}
	}
	else if(intersects.length == 1) {
		if(intersects[0].object.name == "proto") {
			res = true;
		}
	}
	else {
		res = false;
	}
	return res;
}

function getAngleDelta(actual) {
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
		total -= angle;
		if(total < 0) {
			total += angle;
			angle = 0;
		}
		else if(total > Math.PI * 11/6) {
			total += angle;
			angle = 0;
		}
		return angle;
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

c.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);


function anim() {
	requestAnimationFrame(anim);
	render();
	//controls.update();
}


