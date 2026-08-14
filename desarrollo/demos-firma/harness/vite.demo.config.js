import { defineConfig, mergeConfig } from 'vite';
import base from '../vite.config.js';

/**
 * Dev server SOLO para grabar la demo.
 *
 * Dos razones para no usar el server de 5175:
 *  - El backend no reconoce `localhost:5175` como dominio stateful de Sanctum
 *    (`sanctum.stateful` = 5173/5174/5176/5177), asi que tras el login no emite
 *    cookie de sesion y toda llamada posterior responde 401. En 5177 si.
 *  - `node_modules` es un symlink fuera del worktree y Vite lo bloquea (@fs 403),
 *    lo que rompe las fuentes. `server.fs.allow` lo permite.
 */
export default defineConfig((env) => {
  const resolved = typeof base === 'function' ? base(env) : base;
  return mergeConfig(resolved, {
    root: '/Users/miguelcano/Desktop/todo/Widdo/desarrollo/.worktrees/docreview-frontend',
    server: {
      port: 5177,
      strictPort: true,
      fs: {
        allow: ['/Users/miguelcano/Desktop/todo/Widdo/desarrollo'],
      },
    },
  });
});
