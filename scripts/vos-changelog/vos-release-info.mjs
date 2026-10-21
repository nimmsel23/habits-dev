import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export function readVosReleaseInfo({ root = process.cwd(), env = process.env } = {}) {
  const git = (...args) => {
    try { return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
    catch { return ''; }
  };
  const id = git('rev-parse', 'HEAD');
  if (!id) return null;
  const remote = git('remote', 'get-url', 'origin');
  const repository = remote.replace(/^git@([^:]+):/, 'https://$1/').replace(/^ssh:\/\/git@([^/]+)\//, 'https://$1/').replace(/\.git$/, '');
  // Parent CI can build submodules: never label an app with the parent's SHA/commits.
  const matchingEvent = env.GITHUB_SHA === id && repository === `https://github.com/${env.GITHUB_REPOSITORY}`;
  let event;
  if (matchingEvent && env.GITHUB_EVENT_PATH) {
    try { event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8')); } catch { /* Local Git fallback. */ }
  }
  const pushed = Array.isArray(event?.commits) ? event.commits : [];
  const commits = pushed.filter(commit => /^[a-f0-9]{40,64}$/i.test(commit?.id) && typeof commit.message === 'string')
    .map(commit => ({ sha: commit.id, message: commit.message.split('\n')[0] })).slice(-30);
  if (!commits.length) {
    // A short history is useful for local/manual builds, including merge releases.
    const log = git('log', '-10', '--no-merges', '--format=%H%x09%s', id);
    for (const line of log.split('\n').filter(Boolean)) {
      const [sha, ...subject] = line.split('\t');
      commits.push({ sha, message: subject.join('\t') });
    }
  }
  return { id, repository, commits };
}
