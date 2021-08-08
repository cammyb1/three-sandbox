import * as THREE from 'three';
import CameraController from './CameraController';
import PlayerController from './PlayerController';
import StateMachine from './StateMachine';

import * as playerStates from './States';

export default class Player {
	constructor(params) {
		this.params = params;
		this.name = 'player';
		this.mixer;
		this.controller = new PlayerController(params);
		this.cameraController = new CameraController({
			...params,
			input: this.controller.input
		});
		this.states = new StateMachine();

		this.init();
	}

	init() {
		this.controller.speed = 20;
		this.loadModel();
	}

	update(elapsedTime) {
		this.controller.update(elapsedTime);
		this.cameraController.update(elapsedTime);
		this.states.update(elapsedTime, this.controller.input);

		if (this.mixer) {
			this.mixer.update(elapsedTime);
		}
	}

	loadModel() {
		this.params.loader.load('swat.fbx').then((model) => {
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
			const arm = model.getObjectByName('swatRightHandThumb3')
				.children[1];

			this.params.loader.load('Pistol.fbx').then((ak) => {
				ak.scale.set(0.15, 0.15, 0.15);
				ak.scale.divideScalar(model.scale.x);
				ak.rotation.y = -Math.PI * 0.5;
				ak.rotation.x = Math.PI / 6;
				arm.add(ak);
			});

			this.cameraController.attach(model);
			this.controller.attach(model);

			this.params.scene.add(model);

			// Handle animations and states
			this.mixer = new THREE.AnimationMixer(model);

			const onLoadAnimation = (animName, anim) => {
				const clip = anim.animations[0];
				const action = this.mixer.clipAction(clip);
				action.timeScale = 1 / 20;
				this.states.addAnimation(animName, {
					clip,
					action
				});
				if (animName === 'idle') {
					this.states.setState('idle');
				}
			};

			this.params.loader
				.load('Pistol Idle.fbx')
				.then((a) => onLoadAnimation('idle', a));
			this.params.loader
				.load('Pistol Run.fbx')
				.then((a) => onLoadAnimation('run', a));
			this.params.loader
				.load('Pistol Walk.fbx')
				.then((a) => onLoadAnimation('walk', a));
			this.states.addState('idle', playerStates.IdleState);
			this.states.addState('walk', playerStates.WalkState);
			this.states.addState('run', playerStates.RunState);
		});
	}
}
