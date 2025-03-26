import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";

/** @type {import('@webcontainer/api').WebContainer} */
let webcontainerInstance;

window.addEventListener("load", async () => {
  // Ensure elements exist before using them
  const textareaEl = document.querySelector("textarea");
  const iframeEl = document.querySelector("iframe");
  if (!textareaEl || !iframeEl) {
    throw new Error("Required DOM elements not found");
  }

  textareaEl.value = files["index.js"].file.contents;
  textareaEl.addEventListener("input", (e) => {
    writeIndexJS(e.currentTarget.value);
  });

  // Call only once
  webcontainerInstance = await WebContainer.boot();
  await webcontainerInstance.mount(files);

  try {
    const exitCode = await installDependencies();
    if (exitCode !== 0) {
      throw new Error("Installation failed");
    }

    await startDevServer();
  } catch (error) {
    console.error("Error during setup:", error);
    iframeEl.src = "error.html"; // Display an error page if setup fails
  }
});

async function installDependencies() {
  // Install dependencies
  const installProcess = await webcontainerInstance.spawn("npm", ["install"]);
  installProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      },
    }),
  );
  // Wait for install command to exit
  return installProcess.exit;
}

async function startDevServer() {
  // Run `npm run start` to start the Express app
  const startProcess = await webcontainerInstance.spawn("npm", [
    "run",
    "start",
  ]);

  // Wait for `server-ready` event
  return new Promise((resolve, reject) => {
    webcontainerInstance.on("server-ready", (port, url) => {
      iframeEl.src = url;
      resolve();
    });
    startProcess.exit.then((exitCode) => {
      if (exitCode !== 0) {
        reject(new Error("Failed to start development server"));
      }
    });
  });
}

/**
 * @param {string} content
 */
async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile("/index.js", content);
}

document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="loading.html"></iframe>
    </div>
  </div>
`;
