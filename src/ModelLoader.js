import * as THREE from 'three';

export default class ModelLoader {
	constructor(manager = new THREE.LoadingManager()) {
		this.manager = manager;
	}
}
