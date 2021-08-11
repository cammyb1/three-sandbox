import * as THREE from 'three';
import StateMachine from './StateMachine';
import * as playerStates from './States';

export default class Enemy {
	constructor(params) {
		this.params = params;
		this.speed = 20;
		this.mixer;
		this.position = new THREE.Vector3();
		this.states = new StateMachine();
		this.input = {
			patrolling: false,
			attacking: false,
			idle: false
		};
		this.target;
		this.targetDirection = new THREE.Vector3();
		this.targetLookAt = new THREE.Vector3();

		this.loadModel();
	}

	loadModel() {
		this.params.loader.load('zombie.fbx').then((model) => {
			const radius = 25 + Math.random() * 50;
			const angle = Math.random() * Math.PI * 2;

			this.position.set(
				Math.cos(angle) * radius,
				0,
				Math.sin(angle) * radius
			);
			this.mixer = new THREE.AnimationMixer(model);
			if (model.scale.equals(new THREE.Vector3(1, 1, 1))) {
				model.scale.divideScalar(10);
			}
			model.traverse((n) => {
				n.castShadow = true;
			});
			model.position.copy(this.position);
			this.params.scene.add(model);
			this.target = model;

			model.name = `zombie_${radius}_${angle}`;

			const onLoadAnimation = (animName, anim) => {
				const clip = anim.animations[0];
				const action = this.mixer.clipAction(clip, model);
				this.states.addAnimation(animName, {
					clip,
					action
				});

				if (animName === 'walk') {
					this.states.setState('idle');
					this.input.idle = true;
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
		//Basic IA
		if (this.input.idle) {
			if (!this.input.patrolling) {
				const radius = 25 + Math.random() * 50;
				const angle = Math.random() * Math.PI * 2;

				this.targetDirection.set(
					Math.cos(angle) * radius,
					0,
					Math.sin(angle) * radius
				);
				this.input.patrolling = true;
				this.states.setState('walk');
			}

			if (this.input.patrolling) {
				this.targetLookAt.lerp(this.targetDirection, 0.025);
				this.target.position.lerp(this.targetDirection, 0.001);
				this.target.lookAt(this.targetLookAt);

				if (this.target.position.distanceTo(this.targetDirection) < 5) {
					this.input.patrolling = false;
					this.states.setState('idle');
				}
			}
		}

		if (this.mixer) {
			this.mixer.update(timeElapsed);
		}
	}
}
