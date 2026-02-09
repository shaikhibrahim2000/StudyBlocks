# StudyBlocks

A simple visual block-based coding environment. Build programs by dragging blocks from a palette onto a canvas, then run your code to see the output.

## Features

- **Drag and drop** — Pick blocks from the palette and drop them onto the canvas to build your program
- **Block types:**
  - **Start** — Marks the beginning of your program
  - **Print** — Outputs text or numbers (supports quoted strings and expressions)
  - **Print variable** — Outputs the value of a variable
  - **Set variable** — Creates or updates a variable (e.g., `x` to `10`)
  - **Loop** — Repeats the next block a given number of times
  - **If** — Conditionally executes the next block (e.g., `x == 10`)
  - **Else** — Executes only when the preceding `If` condition was false

- **Output area** — Terminal-style output showing results of your program

## Project Structure

```
StudyBlocks/
├── index.html   # Main HTML structure, block palette, canvas, output area
├── style.css    # Styling for layout, blocks, and UI
├── script.js    # Drag-and-drop logic and block interpreter
└── README.md    # This file
```

## How to Use

1. Open `index.html` in a web browser (Chrome, Firefox, Safari, or Edge)
2. Drag blocks from the **Blocks** palette on the left onto the **Canvas**
3. Edit input values in each block (e.g., variable names, loop count, conditions)
4. Click **Run Code** to execute your program
5. View the output in the **Output** section at the bottom

### Example Program

1. **Start**
2. **Set** `x` to `10`
3. **If** `x == 10`
4. **Print** `"Hello"`
5. **Else**
6. **Print** `"Goodbye"`

Output: `Hello` (because `x == 10` is true, the Else block is skipped)

## Running Locally

No build step or server required. Simply open the project:

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server (optional)
npx serve .
```

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks or dependencies)

## License

Open source — feel free to use and modify.
