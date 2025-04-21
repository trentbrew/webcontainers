/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files = {
  'index.js': {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
    res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  'package.json': {
    file: {
      contents: `
          {
            "name": "example-app",
            "type": "module",
            "dependencies": {
              "express": "latest",
              "nodemon": "latest",
              "vite": "^5.0.0",
              "svelte": "^4.2.18",
              "@sveltejs/vite-plugin-svelte": "^3.1.0"
            },
            "scripts": {
              "start": "nodemon index.js",
              "dev": "vite"
            }
          }`,
    },
  },
  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
});
`,
    },
  },
  'index.html': {
    file: {
      contents: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Svelte Playground</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`,
    },
  },
  // Define the directory first
  src: {
    directory: {
      'main.js': {
        file: {
          contents: `
import App from './app.svelte';

const app = new App({
  target: document.getElementById('app'),
});

export default app;
`,
        },
      },
      'app.svelte': {
        file: {
          contents: `
<script>
  let count = 0;

  function handleClick() {
    count += 1;
  }
</script>

<h1>Welcome to Svelte!</h1>
<button on:click={handleClick}>
  Clicked {count} {count === 1 ? 'time' : 'times'}
</button>

<style>
  h1 {
    color: purple;
  }
  button {
    background-color: lightgray;
    padding: 5px 10px;
    border-radius: 5px;
  }
</style>
`,
        },
      },
    },
  },
};
