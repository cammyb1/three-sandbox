export default class EntityManager {
	constructor() {
		this.entities = {};
	}

	addEntity(name, entity) {
		this.entities[name] = entity;
	}

	update(elapsedTime) {
		Object.values(this.entities).forEach((entity) =>
			entity.update(elapsedTime)
		);
	}
}
