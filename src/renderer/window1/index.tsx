import { createRoot } from 'react-dom/client';
import { demoControl } from 'renderer/window1/utils';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-core', (arg) => {
  // eslint-disable-next-line no-console
  console.log(arg);
});
window.electron.ipcRenderer.sendMessage('ipc-core', ['ipc-example', 'ping']);
demoControl('ping');
