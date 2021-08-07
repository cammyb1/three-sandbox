export default class StateMachine {
	constructor() {
		this.animations = {};
		this.states = {};
		this.currentState = '';
	}

	addState(name, type) {
		this.states[name] = type;
	}

	setState(name) {
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
