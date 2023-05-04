import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';

const hebURL = new URL("../assets/heb2d.glb", import.meta.url);

let renderer, camera, control, box, size, center, scene, model, fitZoom;


// adapt min and max to model
let minX = -window.innerWidth / 2.0;
let maxX = window.innerWidth / 2.0;
let minZ = -window.innerHeight / 2.0;
let maxZ = window.innerHeight / 2.0;


function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } ); 
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    control = new MapControls(camera, renderer.domElement);
    control.listenToKeyEvents( window ); // optional
    //control.addEventListener( 'change', onWindowChange );
    //window.addEventListener( 'resize', onWindowResize );
    //control.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
   
    // Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
    //control.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	//control.dampingFactor = 0.05;
    //control.screenSpacePanning = true;
    
    // limit zoom
    //control.minDistance = 50;
	//control.maxDistance = 1000;
    
    // limit pan distance maxX
    //control.minPan = new THREE.Vector3(0, 0, 0);
    //control.maxPan = new THREE.Vector3(0, 120, 0);
    //control.screenSpacePanning = true;

    // scope to camera
    //control.target.clamp(control.minPan, control.maxPan);

    // How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
    control.minPolarAngle = -Math.PI / 2;
    control.maxPolarAngle = -Math.PI / 2;

    // How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    //camera.rotation.x = -Math.PI;
    control.minAzimuthAngle = +Math.PI;
    control.maxAzimuthAngle = +Math.PI;

    // no rotation
    //control.enableRotate = false;

    const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 130, 0);
    scene.add(dirLight);

    
}

function render() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

/*function onWindowChange() {
    // limit pan distance
    let x = camera.position.x;
    
    if (x < minX) {
        x = minX;
    } else if (x > maxX) {
        x = maxX;
    }
    // z
    let z = camera.position.z;
    if (z < minZ) {
        z = minZ;
    } else if (z > maxZ) {
        z = maxZ;
    }
    console.log(x)
    //camera.position.z = z;
    //camera.position.x = x;
}*/

/*function onWindowResize() {
    renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

    // responsive screen size

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    
    minX = - size.x / 2.0;
    minZ = - size.z / 2.0;
    maxX = + size / 2.0;
    maxZ = + size / 2.0;
    
    render();
};*/

function loadAsset() {
    const assetLoader = new GLTFLoader();
    assetLoader.load(hebURL.href, (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.rotateY(-Math.PI);

         // adapt model to screen size 
        box = new THREE.Box3().setFromObject(model);
        size = box.getSize(new THREE.Vector3()).length();
        center = box.getCenter(new THREE.Vector3());

        console.log("center of object " + center.x)
        console.log(model.position.x)
        // center model to screen size
        //model.position.x += (model.position.x + center.x);
        //model.position.y += (model.position.y - center.y);
        //model.position.z += (model.position.z - center.z);
        

        camera.updateProjectionMatrix();

        // distance from object to camera CONSIDERING SCREEN SIZE
        // instancetoObject = 0.5 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * size;
        // const distance = size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
        
        // fit zoom object on width of screen
        const fitZoom = (innerWidth / 2.0) / Math.tan(Math.PI * camera.fov / 360);
        camera.position.z = 600;

        const distance = camera.position.distanceTo(model.position);
        console.log(fitZoom)
        console.log(distance)

        model.traverse((o) => {
            if (o.isMesh) {
                o.material.color.set(0xffffff);
            }
        });
        render();
    }, undefined, (error) => {
        console.error(error);
    });
}

function animate(time) {
    requestAnimationFrame(animate);
    control.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = truef
    renderer.render(scene, camera);
}   

function screenToWidthModel() {
    // calculate distance to camera
    //const distance = camera.position.distanceTo(model2.position);
    //const distance = size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));

    //camera.position.z = 300;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();

}
init();
loadAsset();
animate();
screenToWidthModel();
