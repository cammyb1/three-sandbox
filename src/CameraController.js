import * as THREE from 'three';

export default class CameraController {
	constructor(params) {
		this.params = params;
		this.target = null;
		this.init();

		this.currentPos = new THREE.Vector3();
		this.currentLook = new THREE.Vector3();
	}

	init() {
		if (this.params.camera) {
			this.params.camera.updateProjectionMatrix();
		}
	}

	attach(target) {
		this.target = target;
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
		this.params.camera.parent = null;
		this.target = null;
	}

	update(dt) {
		if (this.target) {
			const position = this.calculateOffset();
			const lookAt = this.calculateLookAt();
			const t = 1.0 - Math.pow(0.01, dt);

			this.currentPos.lerp(position, t);
			this.currentLook.lerp(lookAt, t);

			this.params.camera.position.copy(this.currentPos);
			this.params.camera.lookAt(this.currentLook);
			this.params.camera.updateProjectionMatrix();
		}
	}
}
