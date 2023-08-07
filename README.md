# GUI Instructions

## Input
1. In the text box provided, enter the input string that you want to process.
2. Click the "Enter" button to input the string into the machine.

## Step-by-Step Execution
1. After providing the input string, click the "Step" button to start the step-by-step execution of the machine.
2. Observe the machine's behavior as it processes the input string one character at a time.
3. The current state and transition will be shown in the state diagram, and the head position on the input string will be highlighted.
4. Press the "Step" button repeatedly to continue the execution step by step.

## Auto Execution
1. If you prefer to see the automaton process the entire input string automatically, click the "Auto" button.
2. Use the slider to adjust the speed of the automatic execution as desired.
3. The machine will process the input string and show each transition and state change with the specified speed.

## Modifying the Machine
1. You can either input a JSON file representing your custom automaton or manually modify the text box with the sample machine provided.

2. The format for the JSON file is shown below
<br />
<br />

# File Input Instructions:

- Replace "state_name_1", "state_name_2", etc. with the names of your states. You can add more states by following the same format and placing them inside the "states" array. The "x" and "y" fields for each state represent the X and Y coordinates of the state's position in the diagram. Update these values to reflect the desired location of each state in the diagram. 
- If you want a state to be the start state, include the "start" object within the state and provide the "rot" (rotation) and the identifier for the start state. 
- Replace "state_type" with "accept" if the state is an accepting state, or "reject" if it's a rejecting state. This is optional, and you can remove the "type" field if the state is neither accepting nor rejecting.
- Replace "from_state_name", "to_state_name", and "transition_symbol" with the appropriate values for your transitions. The "transition_symbol" represents the symbol that triggers the transition from one state to another. "mode" can be either "L" or "R" to move the tape head Left or Right. You can add more transitions by following the same format and placing them inside the "transitions" array.


## Sample File Format
```
{
  "states": [
    {
      "name": "state_name_1",
      "x": 100,   // X-coordinate of the state's position in the diagram
      "y": 100,   // Y-coordinate of the state's position in the diagram
      "type": "state_type"  // Optional: "accept" or "reject"
    },
    {
      "name": "state_name_2",
      "x": 300,   
      "y": 100,   
      "start": {
        "rot": 180,
        "id": "start"  //Identifier for start state
      }
    },
    {
      "name": "state_name_3",
      "x": 300,   
      "y": 200,   
    },
    // Add more states here...
  ],
  "transitions": [
    {
      "from": "from_state_name",
      "to": "to_state_name",
      "symbol": "transition_symbol",  // Symbol that triggers the transition
      "mode": "R"  // Movement direction: "L" for Left or "R" for Right
    },
    {
      "from": "from_state_name",
      "to": "to_state_name",
      "symbol": "transition_symbol",  // Symbol that triggers the transition
      "mode": "L"  // Movement direction: "L" for Left or "R" for Right
      // Optional properties:
      // "curve": 15,  // Integer value, optional (use for curved arrows)
      // "pos": "bot", // String value, optional (position of curved arrow: "top" or "bot")
    },
    // Add more transitions here...
  ]
}

```

