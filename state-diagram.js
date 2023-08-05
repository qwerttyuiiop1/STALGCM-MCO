function StateDiagram(stateData, transitions, svgId) {
	const stateMap = stateData.reduce((acc, cur) => {
		acc[cur.name] = cur;
		return acc;
	}, {});
	const arrows = [...transitions].sort((a, b) => {
		if (a.from === b.from) {
			return a.to.localeCompare(b.to);
		}
		return a.from.localeCompare(b.from);
	}).reduce((acc, cur) => {
		const prev = acc[acc.length - 1];
		if (prev && prev.from === cur.from && prev.to === cur.to) {
			prev.transitions.push(cur);
		} else {
			const a = {};
			a.from = cur.from;
			a.to = cur.to;
			a.transitions = [cur];
			acc.push(a);
		}
		return acc;
	}, []);

	function getStateId(state) {
		return `state-${state.name}`;
	}
	function getArrowId(arrow) {
		return `arrow-${arrow.from}-${arrow.to}`;
	}
	function getTransitionId(transition) {
		const symbol = 
			transition.symbol === '{' ? 'lbrace' : 
			transition.symbol === '}' ? 'rbrace' :
			transition.symbol;
		return `transition-${transition.from}-${transition.to}-${symbol}`;
	}

	const radius = 20;

	function calcArrowPath(arrow) {
		const arrLen = 6;
		const arrWidth = 3;

		const from = stateMap[arrow.from];
		const to = stateMap[arrow.to];
		let line;
		let ux, uy;
		let endX, endY;
		if (from.name === to.name) {
			const sin = Math.sin(3/4);
			const cos = Math.cos(3/4);
			const arc1 = [ -sin * radius, (cos + 1) * radius ];
			const arc2 = [ sin * radius, (cos + 1) * radius ];

			[endX, endY] = arc2;
			line = `M ${arc1[0]},${arc1[1]} A ${radius},${radius} 0 1 1 ${arc2[0]},${arc2[1]}`;
			[ux, uy] = [-cos, sin];
		} else {

			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			const lineLen = dist - 2 * radius;

			const [startX, startY] = [-lineLen / 2, 0];
			[endX, endY] = [lineLen / 2, 0];
			line = `M ${startX},${startY} L ${endX},${endY}`;
			[ux, uy] = [1, 0];
		}
		const p1 = [
			endX - ux * arrLen - uy * arrWidth, 
			endY - uy * arrLen + ux * arrWidth
		];
		const p2 = [endX, endY];
		const p3 = [
			endX - ux * arrLen + uy * arrWidth, 
			endY - uy * arrLen - ux * arrWidth
		]
		
		const head = `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]}`;
		return `${line} ${head}`;
	}
	function calcArrowRotate(arrow) {
		const from = stateMap[arrow.from];
		const to = stateMap[arrow.to];
		if (from.name === to.name)
			return 'rotate(0)';
		const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
		return `rotate(${angle})`;
	}
	function calcArrowPos(arrow) {
		const from = stateMap[arrow.from];
		const to = stateMap[arrow.to];
		if (from.name === to.name) {
			const p = [
				from.x,
				from.y - (1 + 2 * Math.cos(3/4)) * radius //FINALLY
			]
			return `translate(${p[0]}, ${p[1]})`;
		}
		const centerX = (from.x + to.x) / 2;
		const centerY = (from.y + to.y) / 2;
		return `translate(${centerX}, ${centerY})`;
	}
	function calcStartPath(state) {
		const ux = state.start.ux;
		const uy = state.start.uy;
		const size = 25;
		const cos30 = Math.cos(Math.PI / 6);
		const sin30 = Math.sin(Math.PI / 6);

		const p1 = [ux * radius, uy * radius];
		const p2 = [
			ux * radius + (ux * cos30 + uy * sin30) * size, 
			uy * radius + (-ux * sin30 + uy * cos30) * size
		];
		const p3 = [
			ux * radius + (ux * cos30 - uy * sin30) * size, 
			uy * radius + (ux * sin30 + uy * cos30) * size
		]

		return `M ${p1[0]},${p1[1]} L ${p2[0]},${p2[1]} L ${p3[0]},${p3[1]} Z`;
	}

	const width = 500;
	const height = 500;

	const dragHandler = d3.drag()
		.on("start", dragStart)
		.on("drag", drag);
	function dragStart(event, d) {
		const state = d.state || {};
		state.startX = d.x;
		state.startY = d.y;
		d.state = state;
	}
	function drag(event, d) {
		const constrainX = (value) =>
			Math.max(radius, Math.min(width - radius, value));
		const constrainY = (value) =>
			Math.max(radius, Math.min(height - radius, value));

		const dx = event.x - d.state.startX;
		const dy = event.y - d.state.startY;
		
		d.x = constrainX(d.x + dx);
		d.y = constrainY(d.y + dy);
		d3.select(this)
			.attr("transform", `translate(${d.x}, ${d.y})`);
		d.state.startX = constrainX(event.x);
		d.state.startY = constrainY(event.y);

		const transitions = d3.selectAll(".arrow-group")
			.filter((t) => t.from === d.name || t.to === d.name)
			.attr("transform", calcArrowPos);
		transitions
			.select(".arrow")
			.attr("d", calcArrowPath)
			.attr("transform", calcArrowRotate);
	}

	const start = () => {
		const svg = d3.select(`#${svgId}`)
			.attr("width", width)
			.attr("height", height);

		const states = svg.selectAll(".state")
			.data(stateData)
			.enter()
			.append("g")
			.attr("class", "state")
			.attr("transform", (d) => `translate(${d.x}, ${d.y})`)
			.attr("id", getStateId)
			.call(dragHandler);

		states.append("circle")
			.attr("r", radius)
			.attr("class", (d) => {
				if (d.type === "accept") return "circle accept";
				if (d.type === "reject") return "circle reject";
				return "circle";
			});
		states.filter((d) => d.type === "accept" || d.type === "reject")
			.append("circle")
			.attr("r", radius - 3)
			.attr("class", (d) => d.type === "accept" ? "circle accept" : "circle reject");

		states.append("text")
			.text((d) => d.name)
			.attr("class", "text")
			.attr("dy", "0.35em");

		states.filter((d) => d.start)
			.append("path")
			.attr("d", calcStartPath)
			.attr("class", "start")
			.attr("id", (d) => d.start.id);

		const arrowGroup = svg.selectAll(".arrow-group")
			.data(arrows)
			.enter()
			.append("g")
			.attr("class", "arrow-group")
			.attr("transform", calcArrowPos);

		arrowGroup
			.append("path")
			.attr("class", "arrow")
			.attr("d", calcArrowPath)
			.attr("id", getArrowId)
			.attr("transform", calcArrowRotate);

		arrowGroup
			.selectAll(".text")
			.data((d) => d.transitions)
			.enter()
			.append("text")
			.attr("class", "text")
			.text((d) => `${d.symbol}; ${d.mode}`)
			.attr("x", 0)
			.attr("y", (_, i) => -10 - i * 15)
			.attr("id", getTransitionId);
	}

	let currentState = null
	const setCurrState = (state) => {
		const prevId = currentState && getStateId(currentState);
		if (prevId)
			d3.select(`#${prevId}`).classed("selected", false);
		currentState = state;
		const id = state && getStateId(state);
		if (id)
			d3.select(`#${id}`).classed("selected", true);
	}

	const currTransition = {
		type: null,
		transition: null,
		startId: null,
	};
	const setCurrTransition = (transition, type = "transition") => {
		const curr = currTransition;
		if (curr.type === "start") {
			d3.select(`#${curr.startId}`).classed("selected", false);
		} else if (curr.type === "transition") {
			const arrid = getArrowId(curr.transition);
			const textid = getTransitionId(curr.transition);
			d3.select(`#${arrid}`).classed("selected", false);
			d3.select(`#${textid}`).classed("selected", false);
		}
		if (!transition) {
			type = null;
		} else if (type === "start") {
			d3.select(`#${transition}`).classed("selected", true);
			curr.startId = transition;
		} else if (type === "transition") {
			const arrid = getArrowId(transition);
			const textid = getTransitionId(transition);
			d3.select(`#${arrid}`).classed("selected", true);
			d3.select(`#${textid}`).classed("selected", true);
			curr.transition = transition;
		}
		curr.type = type;
	};
	const reset = () => {
		setCurrState(null);
		setCurrTransition(null);
	}
	return {
		start,
		setCurrState,
		setCurrTransition,
		reset
	}
}