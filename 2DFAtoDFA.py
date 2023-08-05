from typing import Dict, Literal, Set, Tuple


left_end = '{'
right_end = '}'
symbols = ['a', 'b']

states = ['A', 'B', 'C', 'r', 't']
start = 'A'
accept = 't'
reject = 'r'

transitions: Dict[str, Dict[str, Tuple[str, Literal['L', 'R']]]] = {
    '{': {
        'A': ('A', 'R'),
        'B': ('r', 'R'),
        'C': ('r', 'R'),
        'r': ('r', 'R'),
        't': ('t', 'R'),
	},
    'a': {
        'A': ('A', 'R'),
		'B': ('C', 'L'),
		'C': ('t', 'R'),
		'r': ('r', 'R'),
		't': ('t', 'R'),
	},
    'b': {
        'A': ('A', 'R'),
		'B': ('C', 'L'),
		'C': ('r', 'R'),
		'r': ('r', 'R'),
		't': ('t', 'R'),
	},
    '}': {
        'A': ('B', 'L'),
        'r': ('r', 'L'),
        't': ('t', 'L'),
	}
}

class State:
	def __init__(self, name: str, data: Dict[str | None, str | None], accept: bool = False):
		self.name = name
		self.data = data
		self._hash = hash(
			frozenset(data.items())
		)
		self.accept = accept
	def __repr__(self):
		return str({
			'name': self.name,
			'data': self.data,
		})
	def __str__(self):
		return self.name
	def __hash__(self):
		return self._hash
	def __eq__(self, other):
		return self.data == other.data

def get_start_state() -> State:
	t = transitions[left_end]
	# no need to loop, since transitions[left_end]
	# are guaranteed to be 'R'
	data = { None: t[start][0] }
	for state in states:
		data[state] = t[state][0]
	return State('', data)
def get_next_state(prev: State, symbol: str) -> State:
	data = {}
	for key in states:
		state = key
		for _ in range(len(prev.data)):
			t = transitions[symbol][state]
			# if t is 'R', it will exit this string through t[0]
			if t[1] == 'R':
				data[key] = t[0]
				break
			# else, get the next state after going to the left
			state = prev.data[t[0]]
			# infinite loop in the previous state
			if state is None:
				data[key] = None
				break
		else:
			# by the pigeonhole principle, there is an infinite loop
			data[key] = None
	data[None] = data[prev.data[None]] if prev.data[None] else None
	return State(prev.name + symbol, data)

def is_accept(state: State) -> bool:
	dstate = state.data[None]
	for _ in range(len(state.data)):
		if dstate is None:
			return False
		# t of right_end are guaranteed to be 'L'
		t = transitions[right_end][dstate]
		if t[0] == accept:
			return True
		dstate = state.data[t[0]]
	return False

dfa_start = get_start_state()
dfa_symbols = symbols
dfa_accept: Set[State] = set()
dfa_transitions: Dict[Tuple[str, State], State] = {}

# here, the keys are also the values for quick lookup
# of the state name, since two states with the same data
# but with different names are considered equal
dfa_states: Dict[State, State] = {}
new_states = { dfa_start: dfa_start }

while new_states:
	for prev in new_states:
		break
	del new_states[prev]
	dfa_states[prev] = prev
	
	for symbol in symbols:
		next = get_next_state(prev, symbol)
		# copy objects for consistent state names
		if next in dfa_states:
			next = dfa_states[next]
		elif next in new_states:
			next = new_states[next]
		else:
			if is_accept(next):
				next.accept = True
			new_states[next] = next
		dfa_transitions[(symbol, prev)] = next

dfa_start.name = 'λ'

print('States:', [*map(lambda x: x.name, dfa_states)])
print('Symbols:', dfa_symbols)
print('Start:', dfa_start.name)
print('Transitions: [')
for key in dfa_transitions:
	(symbol, prev) = key
	prev = prev.name
	next = dfa_transitions[key].name
	print(f'    {prev} --{symbol}--> {next}')
print(']')
print('Accept:', [*map(lambda x: x.name, filter(lambda x: x.accept, dfa_states))])