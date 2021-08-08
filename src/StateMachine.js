export default class StateMachine {
	constructor() {
		this.animations = {};
		this.states = {};
		this.currentState = '';
	}

	addAnimation(anim, value) {
		this.animations[anim] = value;
	}

	addState(name, type) {
		this.states[name] = type;
	}

	setState(name) {
		if (!this.states[name]) return;
		const prevState = this.currentState;
		if (prevState) {
			if (prevState.Name === name) return;

			prevState.Exit();
		}

		const state = new this.states[name](this);

		this.currentState = state;
		state.Enter(prevState);
	}

	update(timeElapsed, input) {
		if (this.currentState) {
			this.currentState.Update(timeElapsed, input);
		}
	}
}
