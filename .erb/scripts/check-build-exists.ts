// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';
import webpackPaths from '../configs/webpack.paths';

const mainPath = path.join(webpackPaths.distMainPath, 'main.js');
const window1RendererPath = path.join(webpackPaths.window1RendererPath, 'renderer.js');
const window2RendererPath = path.join(webpackPaths.window2RendererPath, 'renderer.js');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "npm run build:main"'
    )
  );
}

if (!fs.existsSync(window1RendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The renderer process is not built yet. Build it by running "npm run build:renderer"'
    )
  );
}

if (!fs.existsSync(window2RendererPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The window2 renderer process is not built yet. Build it by running "npm run build:renderer"'
    )
  );
}
