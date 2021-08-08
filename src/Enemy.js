import * as THREE from 'three';
import StateMachine from './StateMachine';
import * as playerStates from './States';

export default class Enemy {
	constructor(params) {
		this.params = params;
		this.name = 'zombie';
		this.speed = 20;
		this.mixer;
		this.position = new THREE.Vector3();
		this.states = new StateMachine();
		this.input = {
			keys: {
				forward: false,
				backward: false,
				left: false,
				right: false
			}
		};
		this.target;

		this.loadModel();
	}

	loadModel() {
		this.params.loader.load('zombie.fbx').then((model) => {
			this.target = model;
			const radius = Math.floor(Math.random() * 50) + 30;
			const radius2 = Math.floor(Math.random() * 80) + 40;

			this.mixer = new THREE.AnimationMixer(model);
			this.position.set(
				Math.cos(radius2) * radius,
				0,
				Math.sin(radius2) * radius
			);
			if (model.scale.equals(new THREE.Vector3(1, 1, 1))) {
				model.scale.divideScalar(10);
			}
			model.traverse((n) => {
				n.castShadow = true;
			});
			model.position.copy(this.position);
			this.params.scene.add(model);

			const onLoadAnimation = (animName, anim) => {
				const clip = anim.animations[0];
				const action = this.mixer.clipAction(clip);
				this.states.addAnimation(animName, {
					clip,
					action
				});

				if (animName === 'walk') {
					this.states.setState('walk');
				}
			};

			this.params.loader
				.load('Zombie Idle.fbx')
				.then((m) => onLoadAnimation('idle', m));
			this.params.loader
				.load('Zombie Walking.fbx')
				.then((m) => onLoadAnimation('walk', m));
			this.params.loader
				.load('Zombie Running.fbx')
				.then((m) => onLoadAnimation('run', m));

			this.states.addState('idle', playerStates.IdleState);
			this.states.addState('walk', playerStates.WalkState);
			this.states.addState('run', playerStates.RunState);
		});
	}

	update(timeElapsed) {
		//IA
		if (this.mixer) {
			this.mixer.update(timeElapsed);
		}
	}
}
