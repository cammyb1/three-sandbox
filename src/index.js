import './styles.css';

import * as THREE from 'three';
import PlayerController from './PlayerController';
import CameraController from './CameraController';
import ModelLoader from './ModelLoader';
import StateMachine from './StateMachine';
import * as playerStates from './States';

import SkyFrag from './shaders/sky.fragment.glsl';
import SkyVertex from './shaders/sky.vertex.glsl';

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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.gammaOutput = true;
renderer.toneMappingExposure = 2.3;
renderer.setSize(size.x, size.y);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const config = {
	renderer,
	scene,
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

let playerController, cameraController, stateMachine, playerMixer;

const createPlayer = () => {
	playerController = new PlayerController(config);
	cameraController = new CameraController({
		...config,
		input: playerController.input
	});
	stateMachine = new StateMachine();

	playerController.speed = 20;

	loader.manager.onLoad = () => {
		stateMachine.setState('idle');
	};

	loader.load('swat.fbx').then((model) => {
		// set correct color encoding
		model.traverse((n) => {
			n.castShadow = true;
			if (n.isMesh) {
				if (n.material.length) {
					n.material.map((m) => {
						m.encoding = THREE.sRGBEncoding;
					});
				} else {
					n.material.map.encoding = THREE.sRGBEncoding;
				}
			}
		});
		model.rotation.y = Math.PI;

		// Load Pistol
		model.scale.set(0.1, 0.1, 0.1);
		const arm = model.getObjectByName('swatRightHandThumb3').children[1];

		loader.load('Pistol.fbx').then((ak) => {
			ak.scale.set(0.15, 0.15, 0.15);
			ak.scale.divideScalar(model.scale.x);
			ak.rotation.y = -Math.PI * 0.5;
			ak.rotation.x = Math.PI / 6;
			arm.add(ak);
		});

		cameraController.attach(model);

		playerController.attach(model);
		scene.add(model);

		// Handle animations and states
		playerMixer = new THREE.AnimationMixer(model);

		const onLoadAnimation = (animName, anim) => {
			const clip = anim.animations[0];
			const action = playerMixer.clipAction(clip);
			action.timeScale = 1 / 20;
			stateMachine.addAnimation(animName, {
				clip,
				action
			});
		};

		loader.load('Pistol Idle.fbx').then((a) => onLoadAnimation('idle', a));
		loader.load('Pistol Run.fbx').then((a) => onLoadAnimation('run', a));
		loader.load('Pistol Walk.fbx').then((a) => onLoadAnimation('walk', a));
		stateMachine.addState('idle', playerStates.IdleState);
		stateMachine.addState('walk', playerStates.WalkState);
		stateMachine.addState('run', playerStates.RunState);
	});
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
	const skyGeom = new THREE.SphereBufferGeometry(1000, 32, 15);
	const skyMat = new THREE.RawShaderMaterial({
		uniforms: {
			bottomColor: {
				value: new THREE.Color(0xa48660)
			},
			topColor: {
				value: new THREE.Color(0xe0a96d)
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
	playerController.update(timeElapsedS);
	cameraController.update(timeElapsedS);
	stateMachine.update(timeElapsedS, playerController.input);
	if (playerMixer) {
		playerMixer.update(timeElapsedS);
	}
	requestAnimationFrame(tick);
};

tick();
