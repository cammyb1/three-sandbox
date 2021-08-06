import * as THREE from 'three';

export default class CameraController {
	constructor(config) {
		this.config = config;
		this.target = null;
		this.init();
	}

	init() {
		if (this.config.camera) {
			this.config.camera.updateProjectionMatrix();
		}
	}

	attach(target) {
		this.target = target;
		this.config.camera.lookAt(target.position);
	}

	calculateOffset() {
		const offset = new THREE.Vector3(0, 25, 40);
		const position = this.target.position.clone();
		position.add(offset);

		return position;
	}

	detach() {
		this.config.camera.parent = null;
		this.target = null;
	}

	update(dt) {
		if (this.target) {
			const position = this.calculateOffset();
			this.config.camera.position.lerp(position, dt * 2.5);
			this.config.camera.updateProjectionMatrix();
		}
	}
}
