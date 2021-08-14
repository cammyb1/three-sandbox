import './styles.css';

import * as THREE from 'three';
import ModelLoader from './ModelLoader';

import SkyFrag from './shaders/sky.fragment.glsl';
import SkyVertex from './shaders/sky.vertex.glsl';
import Player from './Player';
import EntityManager from './EntityManager';
import Enemy from './Enemy';

const canvas = document.getElementById('app');

// USEFULL VARS
const size = {
	x: window.innerWidth,
	y: window.innerHeight
};

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas
});
const camera = new THREE.PerspectiveCamera(45, size.x / size.y, 1, 10000);
const scene = new THREE.Scene();
const loader = new ModelLoader();

const loaderDom = document.getElementById('loader');
const domPercentage = document.getElementById('percentage');
const domInfo = document.getElementById('info');

loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
	const percentage = (itemsLoaded / itemsTotal) * 100;
	domPercentage.innerHTML = `${Math.floor(percentage)} %`;
	if (!url.includes('blob:')) {
		domInfo.innerHTML = url;
	}

	if (percentage === 100) {
		loaderDom.classList.add('hidden');
	}
};

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMappingExposure = 2.3;
renderer.setSize(size.x, size.y);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const entityManager = new EntityManager();

const config = {
	renderer,
	scene,
	loader,
	camera
};

// Resize

window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	size.x = window.innerWidth;
	size.y = window.innerHeight;
});

const createPlayer = () => {
	const player = new Player(config);
	entityManager.addEntity('player', player);
};

const createZombie = () => {
	for (let i = 1; i <= 10; i++) {
		const zombie = new Enemy(config);
		entityManager.addEntity(`zombie_${i}`, zombie);
	}
};

const createFloor = () => {
	const sand = new THREE.TextureLoader().load('textures/sand.jpg');

	sand.wrapS = THREE.RepeatWrapping;
	sand.wrapT = THREE.RepeatWrapping;
	sand.encoding = THREE.sRGBEncoding;
	sand.repeat.set(10, 10);

	const geom = new THREE.PlaneBufferGeometry(100, 100, 512, 512);
	const material = new THREE.MeshLambertMaterial({ map: sand });
	const mesh = new THREE.Mesh(geom, material);

	mesh.rotation.x = -Math.PI * 0.5;
	mesh.receiveShadow = true;
	mesh.name = 'floor';

	mesh.scale.addScalar(10.0);

	return mesh;
};

const createLight = () => {
	const ligthGroup = new THREE.Group();
	const dirLight = new THREE.DirectionalLight(0xfff1a5, 1);
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);

	dirLight.position.y = 80;
	dirLight.position.x = 20;
	dirLight.position.z = -20;
	dirLight.castShadow = true;
	dirLight.shadow.bias = -0.0001;
	dirLight.shadow.radius = 0.75;
	dirLight.shadow.mapSize.set(2056, 2056);
	dirLight.shadow.camera.top = 500;
	dirLight.shadow.camera.left = -500;
	dirLight.shadow.camera.bottom = -500;
	dirLight.shadow.camera.right = 500;
	dirLight.shadow.camera.far = 500;
	dirLight.shadow.camera.zoom = 3;
	dirLight.shadow.camera.updateProjectionMatrix();
	// const helper = new THREE.CameraHelper(dirLight.shadow.camera);

	// ligthGroup.add(helper);
	ligthGroup.add(dirLight);
	ligthGroup.add(ambientLight);

	return ligthGroup;
};

const createSky = () => {
	const skyGeom = new THREE.SphereBufferGeometry(1000, 48, 48);
	const skyMat = new THREE.RawShaderMaterial({
		uniforms: {
			bottomColor: {
				value: new THREE.Color(0xa48660)
			},
			topColor: {
				value: new THREE.Color(0xa48660)
			}
		},
		vertexShader: SkyVertex,
		fragmentShader: SkyFrag
	});
	const sky = new THREE.Mesh(skyGeom, skyMat);

	sky.position.y = 10;
	skyMat.side = THREE.BackSide;
	scene.fog = new THREE.Fog(
		skyMat.uniforms.bottomColor.value.clone(),
		0.1,
		500
	);

	return sky;
};

createPlayer();
createZombie();

const floor = createFloor();
const sky = createSky();
const light = createLight();

scene.add(floor);
scene.add(light);
scene.add(sky);

camera.position.z = 3;
camera.position.y = 2.5;

const tick = (timeElapsed) => {
	renderer.render(scene, camera);
	const timeElapsedS = Math.min(1.0 / 50.0, timeElapsed * 0.001);
	entityManager.update(timeElapsedS);
	requestAnimationFrame(tick);
};

tick();
