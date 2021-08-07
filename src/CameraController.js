import * as THREE from 'three';

export default class CameraController {
	constructor(config) {
		this.config = config;
		this.target = null;
		this.init();

		this.currentPos = new THREE.Vector3();
		this.currentLook = new THREE.Vector3();
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
		const offset = new THREE.Vector3(-0, 50, -80);
		offset.applyQuaternion(this.target.quaternion);
		offset.add(this.target.position);

		return offset;
	}
	calculateLookAt() {
		const look = new THREE.Vector3(0, 5, 20);
		look.applyQuaternion(this.target.quaternion);
		look.add(this.target.position);

		return look;
	}

	detach() {
		this.config.camera.parent = null;
		this.target = null;
	}

	update(dt) {
		if (this.target) {
			const position = this.calculateOffset();
			const lookAt = this.calculateLookAt();
			const t = 1.0 - Math.pow(0.01, dt);

			this.currentPos.lerp(position, t);
			this.currentLook.lerp(lookAt, t);

			this.config.camera.position.copy(this.currentPos);
			this.config.camera.lookAt(this.currentLook);
			this.config.camera.updateProjectionMatrix();
		}
	}
}
