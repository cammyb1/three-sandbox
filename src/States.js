class State {
	constructor(parent) {
		this.parent = parent;
	}

	Enter() {}
	Exit() {}
	Update() {}
}

export class IdleState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return 'idle';
	}

	Enter(prevState) {
		const action = this.parent.animations['idle'].action;
		if (prevState) {
		} else {
			action.play();
		}
	}
}
