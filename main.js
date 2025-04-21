import './style.css';
import { WebContainer } from '@webcontainer/api';
import { files } from './files';
// We might not need the main App component anymore, depending on desired layout.
// import App from './src/App.svelte';

/** @type {import('@webcontainer/api').WebContainer} */
let webcontainerInstance;

// Get references to the editor and preview iframe
const iframeEl = document.querySelector('iframe');
const textareaEl = document.querySelector('#svelte-editor');

/** @param {string} content */
async function writeSvelteFile(content) {
  if (webcontainerInstance) {
    // Ensure instance is ready
    await webcontainerInstance.fs.writeFile('/src/app.svelte', content);
  }
}

window.addEventListener('load', async () => {
  console.log('Load event fired: Initializing application');
  // Load initial file content into textarea using the nested path
  textareaEl.value = files.src.directory['app.svelte'].file.contents;
  console.log('Loaded initial Svelte code into textarea');

  // Add event listener to textarea
  textareaEl.addEventListener('input', (e) => {
    writeSvelteFile(e.currentTarget.value);
  });

  console.log('Booting WebContainer...');
  webcontainerInstance = await WebContainer.boot();
  console.log('WebContainer booted');
  await webcontainerInstance.mount(files);
  console.log('Files mounted into WebContainer');

  // --- Svelte App Initialization (Optional/Modified) ---
  // If you still want a Svelte component managing the overall layout
  // (outside the editor/preview), initialize it here.
  // Otherwise, remove this section.
  // const containerEl = document.querySelector('.container'); // Or other target
  // new App({
  //   target: containerEl,
  //   props: {
  //     // Pass necessary props if App needs them
  //   },
  // });
  // --- End Svelte App Initialization ---

  try {
    console.log('Installing dependencies...');
    const exitCode = await installDependencies();
    console.log(`installDependencies exited with code: ${exitCode}`);

    if (exitCode !== 0) {
      iframeEl.srcdoc = `Error: Installation failed (exit code ${exitCode})`;
      throw new Error('Installation failed');
    }

    iframeEl.srcdoc = 'Dependencies installed. Starting server...';
    console.log('Dependencies installed successfully. Launching dev server...');
    await startDevServer();
  } catch (error) {
    console.error('Error during setup:', error);
    iframeEl.srcdoc = `Error during setup: ${error.message}`;
  }
});

async function installDependencies() {
  console.log('installDependencies() invoked');
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  // Pipe output to console to see installation errors
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log('npm install:', data);
      },
    }),
  );
  return installProcess.exit;
}

async function startDevServer() {
  console.log('startDevServer() invoked');
  const startProcess = await webcontainerInstance.spawn('npm', ['run', 'dev']); // Use 'dev' script for Vite
  console.log('Spawned dev server process');

  // Log the output of the dev server process
  startProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log('Vite output:', data);
      },
    }),
  );

  // Wait for `server-ready` event
  webcontainerInstance.on('server-ready', (port, url) => {
    console.log(`Received server-ready: port=${port}, url=${url}`);
    // Update the iframe to point at the Vite dev server URL
    if (iframeEl) {
      // Remove srcdoc so that src can take effect
      iframeEl.removeAttribute('srcdoc');
      iframeEl.src = url;
    }
  });

  console.log('Awaiting dev server process exit or server-ready');
  const exitCode = await startProcess.exit;
  console.log(`Dev server process exited with code: ${exitCode}`);
  if (exitCode !== 0) {
    iframeEl.srcdoc = `Error: Failed to start dev server (exit code ${exitCode})`;
    throw new Error('Failed to start development server');
  }
  // Note: The promise approach might be better if server-ready isn't guaranteed before exit
}

/**
 * @param {string} content
 */
async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile('/index.js', content);
}
