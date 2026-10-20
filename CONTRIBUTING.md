# Contributing

Thanks for helping improve **scrollytelling-brand-site**! Improvements from real builds are the most valuable kind.

## Ways to help
- **Report a problem** — something in the skill led Claude astray, a template doesn't work, a measurement script fails.
  Open a [bug report](../../issues/new?template=bug_report.yml).
- **Suggest an improvement** — a new scroll beat, a better 3D technique, a performance fix with numbers.
  Open an [improvement idea](../../issues/new?template=improvement.yml).
- **Ask a question or show what you built** — use [Discussions](../../discussions).

## Pull requests
1. Fork the repo and create a branch: `git checkout -b improve-<topic>`.
2. Keep changes focused. Edit the skill in `skills/scrollytelling-brand-site/`:
   - `SKILL.md` stays short (workflow + rules). Put detail in `references/`.
   - New techniques go in the matching reference file, with **measured** results where performance is involved
     (before → after, how measured).
   - Template code must come from a working build and stay brand-neutral.
3. **No personal data**: no real names, phone numbers, e-mails, addresses, client details or secrets — in text,
   code, screenshots or image metadata. Use fictional people and `example.com`.
4. Screenshots: JPEG, ≤ 1440 px wide, ≤ 200 KB each, only of work you have the right to share.
5. Update `CHANGELOG.md` and, for releases, the version in `.claude-plugin/plugin.json` and `marketplace.json`.
6. Open the PR and fill in the template.

## Style
- Write instructions for Claude: imperative, specific, with the *why* when it isn't obvious.
- Prefer one proven pattern over a list of options.

By contributing you agree that your contributions are licensed under the [MIT License](LICENSE) and that you follow
the [Code of Conduct](CODE_OF_CONDUCT.md).
