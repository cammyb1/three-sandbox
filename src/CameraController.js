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
		const offset = new THREE.Vector3(0, 60, 90);
		const position = this.target.position.clone();
		position.add(offset);

		return position;
	}
	calculateLookAt() {
		const look = new THREE.Vector3(0, 10, 10);
		const position = this.target.position.clone();
		position.add(look);

		return position;
	}

	detach() {
		this.config.camera.parent = null;
		this.target = null;
	}

	update(dt) {
		if (this.target) {
			const position = this.calculateOffset();
			const lookAt = this.calculateLookAt();
			this.config.camera.position.lerp(position, dt * 2.5);
			this.config.camera.lookAt(lookAt);
			this.config.camera.updateProjectionMatrix();
		}
	}
}
