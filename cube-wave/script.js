//canvas
var dimW = 1000;
var dimH = 600
var c = document.getElementById("cnv");
c.height = dimH; c.width = dimW;

//scene
var scene, renderer, camera, controls;
var frame = 0;
var boxes = [];

//Wave settings
var waveLength = .75;
var waveHeight = .5;
var waveSpeed = .5;
var cubesPerEdge = 10;
var cubeSize = 2;
var gap = .5;

init();
anim();

function init() {
	// Creating and setting the scene
	scene = new THREE.Scene();

	// lights
	var light = new THREE.PointLight(0xffffff, 0.5, 0);
	light.position.set(-20, 20, -30);
	scene.add(light);	
	var light2 = new THREE.PointLight(0xffffff, 0.1, 0);
	light2.position.set(0, 30, 0);
	scene.add(light2);
	var ambient = new THREE.AmbientLight(0xffffff);
	ambient.intensity = 0.5;
	scene.add(ambient);
	
	//Creating and setting the renderer
	renderer = new THREE.WebGLRenderer( {
											canvas: c,
											antialias: true
										} );
	renderer.setClearColor(0xffffff, 1);

	//Creating the camera and panning out on the Z axis
	camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 10000);
	camera.position.set(5, 20, 25);
	camera.aspect = dimW / dimH;
	camera.updateProjectionMatrix();
	scene.add(camera);

	//CONTROLS
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	//DAMPING: call controls.update() in the animate function!
  	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.rotateSpeed = 0.05;

	//populating
	drawBoxes(cubesPerEdge, cubeSize, gap);

}

//Creates n by n plane of boxes of size dim
function drawBoxes(n, dim, gap) {
	var boxGeo = new THREE.BoxGeometry(dim, dim, dim);
	var boxMat = new THREE.MeshPhongMaterial({ color: 0xffaaaa });
	for(var i = - n / 2; i < n / 2; i++) {
		for(var j = - n / 2; j < n / 2; j++) {
			var box = new THREE.Mesh(boxGeo, boxMat);
			box.position.set(i * (dim + gap), 0, j * (dim + gap));
			box.dim = dim;
			boxes.push(box);
			scene.add(box);
		}
	}
}

function render() {
	renderer.render(scene, camera);
}

function anim() {
	frame++;
 	requestAnimationFrame(anim);
 	if(boxes.length > 0) {
 		for(var i = 0; i < boxes.length; i++) {
 			var box = boxes[i];
 			var scaleFact = Math.abs(
 								Math.sin( (100 *  (1 - waveLength)) 
 										* (box.position.z + box.position.x) 
 										+ (waveSpeed * frame / 10 )) * waveHeight  + 1
 									);
 			var height = scaleFact * box.dim;
 			box.scale.set(1, scaleFact, 1);	
 			box.position.y = height / 2; 
 		}
 		 
 	}
 	controls.update();
 	render();
}

