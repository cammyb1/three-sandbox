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
		const action = this.parent.animations['idle']?.action;
		if (prevState) {
			const prevAction = this.parent.animations[prevState.Name].action;
			action.time = 0.0;
			action.enabled = true;
			action.setEffectiveTimeScale(1.0);
			action.setEffectiveWeight(1.0);
			action.crossFadeFrom(prevAction, 0.25, true);
		}

		action?.play();
	}

	Update(_, input) {
		if (input.keys.forward || input.keys.backward) {
			this.parent.setState('walk');
		}
	}
}

export class WalkState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return 'walk';
	}

	Enter(prevState) {
		const action = this.parent.animations['walk']?.action;
		if (prevState) {
			const prevAction = this.parent.animations[prevState.Name].action;

			action.enabled = true;

			if (prevState.Name == 'run') {
				const ratio =
					action.getClip().duration / prevAction.getClip().duration;
				action.time = prevAction.time * ratio;
			} else {
				action.time = 0.0;
				action.setEffectiveTimeScale(1.0);
				action.setEffectiveWeight(1.0);
			}

			action.crossFadeFrom(prevAction, 0.5, true);
		}

		action?.play();
	}

	Update(_, input) {
		if (input.keys.forward || input.keys.backward) {
			if (input.keys.sprint) {
				this.parent.setState('run');
			}

			return;
		}

		this.parent.setState('idle');
	}
}

export class RunState extends State {
	constructor(parent) {
		super(parent);
	}

	get Name() {
		return 'run';
	}

	Enter(prevState) {
		const action = this.parent.animations['run']?.action;
		if (prevState) {
			const prevAction = this.parent.animations[prevState.Name].action;

			action.enabled = true;

			if (prevState.Name == 'walk') {
				const ratio =
					action.getClip().duration / prevAction.getClip().duration;
				action.time = prevAction.time * ratio;
			} else {
				action.time = 0.0;
				action.setEffectiveTimeScale(1.0);
				action.setEffectiveWeight(1.0);
			}
			action.crossFadeFrom(prevAction, 0.5, true);
		}

		action?.play();
	}

	Update(_, input) {
		if (input.keys.forward || input.keys.backward) {
			if (!input.keys.sprint) {
				this.parent.setState('walk');
			}

			return;
		}

		this.parent.setState('idle');
	}
}
