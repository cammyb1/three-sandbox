import './styles.css';

import * as THREE from 'three';
import PlayerController from './PlayerController';
import CameraController from './CameraController';
import ModelLoader from './ModelLoader';
import StateMachine from './StateMachine';
import * as playerStates from './States';

import SkyFrag from './shaders/sky.fragment.glsl';
import SkyVertex from './shaders/sky.vertex.glsl';

import TerrainFrag from './shaders/terrain.fragment.glsl';
import TerrainVertex from './shaders/terrain.vertex.glsl';
import { on } from 'events';

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

renderer.shadowMap.enabled = true;
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
	const loader = new ModelLoader();
	playerController = new PlayerController(config);
	cameraController = new CameraController(config);
	stateMachine = new StateMachine();

	loader.load('swat.fbx').then((model) => {
		model.traverse((n) => {
			n.castShadow = true;
		});
		model.rotation.y = Math.PI;

		playerMixer = new THREE.AnimationMixer(model);

		scene.add(model);
		model.scale.set(0.1, 0.1, 0.1);
		playerController.attach(model);
		cameraController.attach(model);

		const onLoadAnimation = (animName, anim) => {
			const clip = anim.animations[0];
			const action = playerMixer.clipAction(clip);

			stateMachine.animations[animName] = {
				clip,
				action
			};

			stateMachine.setState('idle');
		};

		loader.load('Idle.fbx').then((a) => onLoadAnimation('idle', a));
		stateMachine.addState('idle', playerStates.IdleState);
	});
};

const createFloor = () => {
	const geom = new THREE.PlaneBufferGeometry(10, 10, 512, 512);
	// const material = new THREE.RawShaderMaterial({
	// 	uniforms: {
	// 		uTime: {
	// 			value: null
	// 		},
	// 		bottomColor: {
	// 			value: new THREE.Color(0x046b09)
	// 		},
	// 		topColor: {
	// 			value: new THREE.Color(0x19c488)
	// 		}
	// 	},
	// 	vertexShader: TerrainVertex,
	// 	fragmentShader: TerrainFrag
	// });
	const material = new THREE.MeshLambertMaterial({ color: 'green' });
	const mesh = new THREE.Mesh(geom, material);

	mesh.rotation.x = -Math.PI * 0.5;
	mesh.receiveShadow = true;
	mesh.name = 'floor';

	mesh.scale.addScalar(50.0);

	return mesh;
};

const createLight = () => {
	const ligthGroup = new THREE.Group();
	const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);

	dirLight.position.y = 10;
	dirLight.position.x = 2;
	dirLight.castShadow = true;
	dirLight.shadow.radius = 0.75;
	dirLight.shadow.mapSize.set(1024, 1024);
	dirLight.shadow.camera.top = 75;
	dirLight.shadow.camera.left = -75;
	dirLight.shadow.camera.bottom = -75;
	dirLight.shadow.camera.right = 75;
	dirLight.shadow.camera.far = 25;
	dirLight.shadow.camera.zoom = 2;
	dirLight.shadow.camera.updateProjectionMatrix();
	// const helper = new THREE.CameraHelper(dirLight.shadow.camera);

	// ligthGroup.add(helper);
	ligthGroup.add(dirLight);

	return ligthGroup;
};

const createSky = () => {
	const skyGeom = new THREE.SphereBufferGeometry(1000, 32, 15);
	const skyMat = new THREE.RawShaderMaterial({
		uniforms: {
			bottomColor: {
				value: new THREE.Color(0xbfffe8)
			},
			topColor: {
				value: new THREE.Color(0x8fe0d0)
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
		300
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
	const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001);
	playerController.update(timeElapsedS);
	cameraController.update(timeElapsedS);
	stateMachine.update(timeElapsedS, playerController.input);
	if (playerMixer) {
		playerMixer.update(timeElapsedS);
	}
	requestAnimationFrame(tick);
};

tick();
