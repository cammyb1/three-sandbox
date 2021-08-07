import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { SkeletonUtils } from 'three/examples/jsm/utils/SkeletonUtils';

export default class ModelLoader extends FBXLoader {
	constructor(manager = new THREE.LoadingManager()) {
		super(manager);
		this.setPath('models/');
		this.modelList = {};
	}

	load(resource) {
		if (this.modelList[resource]) {
			return this.modelList[resource].then((m) => SkeletonUtils.clone(m));
		}

		const promise = new Promise((resolve, reject) => {
			super.load(resource, (m) => resolve(m), null, reject);
		});

		return (this.modelList[resource] = promise);
	}
}
