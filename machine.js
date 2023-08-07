function Machine(containerId, machineData) {
	const container = document.getElementById(containerId);
	container.innerHTML = `
		<h3>String</h3>
		<div class="tape-container">
			<div class="tape-before"></div>
			<div class="tape-head-container">
				<div class="tape-curr"></div>
				<div class="tape-head-indicator">current head</div>
			</div>
			<div class="tape-after"></div>
		</div>
		<div class="machine-output"></div>
		<h3>State Diagram</h3>
		<svg id="${containerId}-svg-container" class="svg-container"></svg>
	`;

	let {
		states,
		transitions,
		//machine state (optional)
		currState,
		string,
		index,
		isFinished, //can be calculated from index and currState
		//ui state (optional)
		transition,
		transitionType
	} = JSON.parse(JSON.stringify(machineData));

	const view = new StateDiagram(states, transitions, `${containerId}-svg-container`);
	view.start();
	const before = document.querySelector(`#${containerId} .tape-before`);
	const curr = document.querySelector(`#${containerId} .tape-curr`);
	const after = document.querySelector(`#${containerId} .tape-after`);
	const output = document.querySelector(`#${containerId} .machine-output`);


	const render = () => {
		if (index >= 0) {
			before.innerHTML = string.slice(0, index) || '';
			curr.innerHTML = string[index] || '';
			after.innerHTML = string.slice(index + 1) || '';
		} else {
			before.innerHTML = '';
			curr.innerHTML = '';
			after.innerHTML = string || '';
		}
		view.setCurrState(currState);
		view.setCurrTransition(transition, transitionType);
	};
	const reset = (str) => {
		string = str;
		index = -1;
		isFinished = false;
		currState = null;
		transition = "start";
		transitionType = "start";
		output.innerHTML = '';

		render();
	}
	const error = () => {
		isFinished = true;
		output.innerHTML = 'Rejected';
		output.style.color = 'red';
		render();
	}

	const getTransition = (state, char) => {
		return transitions.filter((t) => 
			t.from == state.name && (t.symbol == char)
		).map((t) => ({
			transition: t,
			transitionType: "transition",
		}));
	}
	const step = () => {
		if (isFinished || !string) return
		if (index == -1) {
			index = 0;
			currState = states.find((state) => state.start);
			if (!currState) return error();
		}

		if (currState.type === 'accept') {
			isFinished = true;
			output.innerHTML = 'Accepted';
			output.style.color = 'green';
			transition = null;
			transitionType = null;
			return render();
		} else if (currState.type === 'reject') {
			transition = null;
			transitionType = null;
			return error();
		}

		//next transition is advanced one step in ui
		t = getTransition(currState, string[index]);
		transition = t[0] && t[0].transition;
		transitionType = t[0] && t[0].transitionType;

		render();

		currState = transition &&
			states.find((state) => state.name == transition.to);
		
		if (!transition) return error()
		if (transition.mode === 'R')
			index++;
		else if (transition.mode === 'L')
			index--;
	}

	const getMachineData = () => ({
		states,
		transitions,
		currState,
		string,
		index,
		isFinished,
	});

	return {
		getMachineData,
		reset,
		step,
	}
}