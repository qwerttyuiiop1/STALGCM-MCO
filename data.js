function Data() {
	const states = [
		{
			name: 'q0',
			x: 100, y: 100,
			start: {
				ux: -1, uy: 0,
				id: 'start'
			},
		},
		{
			name: 'q1',
			x: 300, y: 100,
		},
		{
			name: 'q2',
			x: 300, y: 200,
		},
		{
			name: 'r',
			x: 100, y: 200,
			type: 'reject'
		},
		{
			name: 't',
			x: 100, y: 300,
			type: 'accept',
		}
	];
	const transitions = [
		{
			from: 'q0', to: 'q0',
			symbol: '{', mode: 'R'
		},
		{
			from: 'q0', to: 'q0',
			symbol: 'a', mode: 'R'
		},
		{
			from: 'q0', to: 'q0',
			symbol: 'b', mode: 'R'
		},
		{
			from: 'q0', to: 'q1',
			symbol: '}', mode: 'L'
		},
		{
			from: 'q1', to: 'r',
			symbol: '{', mode: 'R'
		},
		{
			from: 'q1', to: 'q2',
			symbol: 'a', mode: 'L'
		},
		{
			from: 'q1', to: 'q2',
			symbol: 'b', mode: 'L'
		},
		{
			from: 'q2', to: 't',
			symbol: 'a', mode: 'R'
		},
		{
			from: 'q2', to: 'r',
			symbol: 'b', mode: 'R'
		},
		{
			from: 'q2', to: 'r',
			symbol: '{', mode: 'R'
		},
	]
	const getDefaults = () => ({
		states, transitions
	});
    const getFromFile = async (file) => {
        const data = await file.text();
        const json = JSON.parse(data);
        const isValid = validateData(json);
        if (!isValid) {
            return null;
        }
        return json;
    };

	//helper fnuction to validate data
    const validateData = (json) => {
        // data has states and transitions
        if (!json.hasOwnProperty('states') || !json.hasOwnProperty('transitions')) {
			window.alert('No states/transitions')
            return false;
        }

        // validate states array
        if (!Array.isArray(json.states)) {
			window.alert('States not stored in array')
            return false;
        }

        // validate each state object in the 'states' array
        for (const state of json.states) {
            // the state is an object and has the 'name' property
            if (!state || typeof state !== 'object' || !state.hasOwnProperty('name') || typeof state.name !== 'string' || state.name.trim() === '') {
				window.alert('States with no name found')
                return false;
            }

            // the state has 'x' and 'y' properties with numeric values
            if (!state.hasOwnProperty('x') || !state.hasOwnProperty('y') || typeof state.x !== 'number' || typeof state.y !== 'number') {
				window.alert('States with invalid x/y coordinates found')
                return false;
            }

            // the optional 'type' property, if present, has a valid value
            if (state.hasOwnProperty('type') && typeof state.type !== 'string') {
				window.alert('States with non-string type found')
                return false;
            }

            // the 'type' property, if present, has a valid value ('accept' or 'reject')
            if (state.type && state.type !== 'accept' && state.type !== 'reject') {
				window.alert('States with invalid type found')
                return false;
            }
        }

        // validate transitions array
        if (!Array.isArray(json.transitions)) {
			window.alert('Transitions not stored in array')
            return false;
        }

        // transition objects
        for (const transition of json.transitions) {
            // transition is an object and has the 'from' and 'to' properties
            if (!transition || typeof transition !== 'object' || !transition.hasOwnProperty('from') || !transition.hasOwnProperty('to') ||
                typeof transition.from !== 'string' || typeof transition.to !== 'string' || transition.from.trim() === '' || transition.to.trim() === '') {
				window.alert('Transitions with no from/to states found')
                return false;
            }

            // the 'symbol' property is a non-empty string
            if (typeof transition.symbol !== 'string' || transition.symbol.trim() === '') {
				window.alert('Transitions with no input symbol found')
                return false;
            }

            // the 'mode' property has a valid value ('R' or 'L')
            if (transition.mode !== 'R' && transition.mode !== 'L') {
				window.alert('Transitions with invalid mode found')
                return false;
            }
        }
        return true;
    };

	return {
		getDefaults,
		getFromFile,
		validateData,
	};
}