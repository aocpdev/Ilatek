import { syncShells, shellFiles } from './page-shell.mjs';
console.log(`Header/footer: ${syncShells()} updated; ${shellFiles.length} delivery files.`);
