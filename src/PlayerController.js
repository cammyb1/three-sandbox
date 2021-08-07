import PlayerInput from './PlayerInput';

export default class PlayerController {
	constructor(params) {
		this.params = params;
		this.target = null;
		this.input = new PlayerInput();
		this.speed = 5.0;
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
				baseSpeed *= 2.5;
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
