import { fileURLToPath } from 'node:url';
import { readVosReleaseInfo } from './vos-release-info.mjs';

// One plugin installs the screen for dev and all Vite build modes.
export function vosChangelog(options) {
  const virtualId = 'virtual:vos-changelog';
  const resolvedId = '\0' + virtualId;
  const screen = fileURLToPath(new URL('./vos-changelog-screen.mjs', import.meta.url)).replaceAll('\\', '/');
  let release;
  return {
    name: 'vos-changelog',
    configResolved(config) { release = readVosReleaseInfo({ root: config.root }); },
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) {
      if (id !== resolvedId) return;
      return `import { showVosChangelogScreen } from ${JSON.stringify(screen)};\nshowVosChangelogScreen(${JSON.stringify({ ...options, release })});`;
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [{ tag: 'script', attrs: { type: 'module' }, children: `import '${virtualId}';`, injectTo: 'body' }];
      },
    },
    generateBundle() {
      if (release) this.emitFile({ type: 'asset', fileName: 'release-info.json', source: JSON.stringify(release, null, 2) + '\n' });
    },
  };
}
