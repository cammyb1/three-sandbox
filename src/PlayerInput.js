import { KEYS } from './constants';

export default class PlayerInput {
	constructor() {
		this.keys = {
			forward: false,
			backward: false,
			right: false,
			left: false,
			sprint: false
		};
		this.listener = {
			up: null,
			down: null
		};

		this.init();
	}

	init() {
		this.listener.down = (e) => {
			switch (e.keyCode) {
				case KEYS.W: {
					this.keys.forward = true;
					break;
				}
				case KEYS.S: {
					this.keys.backward = true;
					break;
				}
				case KEYS.A: {
					this.keys.left = true;
					break;
				}
				case KEYS.D: {
					this.keys.right = true;
					break;
				}
				case KEYS.SHIFT: {
					this.keys.sprint = true;
					break;
				}
				default: {
					break;
				}
			}
		};
		this.listener.up = (e) => {
			switch (e.keyCode) {
				case KEYS.W: {
					this.keys.forward = false;
					break;
				}
				case KEYS.S: {
					this.keys.backward = false;
					break;
				}
				case KEYS.A: {
					this.keys.left = false;
					break;
				}
				case KEYS.D: {
					this.keys.right = false;
					break;
				}
				case KEYS.SHIFT: {
					this.keys.sprint = false;
					break;
				}
				default: {
					break;
				}
			}
		};

		window.addEventListener('keydown', this.listener.down);
		window.addEventListener('keyup', this.listener.up);
	}

	dispose() {
		window.removeEventListener('keydown', this.listener.down);
		window.removeEventListener('keyup', this.listener.up);
	}
}
