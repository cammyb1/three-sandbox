import { Vector2, Vector3, Raycaster, Object3D } from 'three';
import PlayerInput from './PlayerInput';

export default class PlayerController {
	constructor(config) {
		this.config = config;
		this.target = null;
		this.listener = {
			move: null
		};
		this.raycaster = new Raycaster();
		this.input = new PlayerInput();
		this.mouse = new Vector2(0, 0);
		this.speed = 5.0;
		this.init();
	}

	init() {
		this.listener.move = (e) => {
			this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
			this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
		};
		window.addEventListener('mousemove', this.listener.move);
	}

	dispose() {
		window.removeEventListener('mousemove', this.listener.move);
	}

	attach(target) {
		this.target = target;
	}

	detach() {
		this.target = null;
	}

	set speed(value) {
		this._speed = value;
	}

	get speed() {
		return this._speed;
	}

	update(dt) {
		if (this.target) {
			let baseSpeed = this.speed;

			if (this.input.keys.sprint) {
				baseSpeed *= 1.75;
			} else {
				baseSpeed = this.speed;
			}

			if (this.input.keys.left) {
				this.target.rotateY(0.05);
			}
			if (this.input.keys.right) {
				this.target.rotateY(-0.05);
			}
			if (this.input.keys.forward) {
				this.target.translateZ(baseSpeed * dt);
			}
			if (this.input.keys.backward) {
				this.target.translateZ(-baseSpeed * dt);
			}
		}
	}
}
