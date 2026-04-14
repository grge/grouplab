# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
but this project uses date-based entries rather than semantic-versioned releases.

## 2026-04-14

### Added
- Added `CHANGELOG.md` to track notable project changes in a human-oriented format.
- Added GitHub Actions workflows for CI and GitHub Pages deployment.
- Added a proper Vitest-based regression test suite for group-order examples, including larger merging-heavy cases.
- Added `src/views/GroupView.vue` so the application has a proper routed view instead of using `App.vue` directly as the page component.
- Added `src/stores/group.ts` as the renamed and cleaned-up Pinia store module.
- Added `src/components/SchreierGraph.vue` as the corrected component name replacing the misspelled `ShreierGraph.vue`.
- Added `src/env.d.ts` to provide Vite client and web worker TypeScript environment definitions.

### Changed
- Reworked `App.vue` into a router shell that renders the active route view rather than mixing shell and page concerns.
- Updated routing so the group page is served through `GroupView.vue` rather than routing directly to `App.vue`.
- Renamed `src/stores/counter.ts` to `src/stores/group.ts` to remove leftover scaffold naming.
- Renamed `src/components/ShreierGraph.vue` to `src/components/SchreierGraph.vue`.
- Rewrote the core graph engine around the current Python v2 design, replacing the old word-node representation with an integer-node, canonical-representative, adjacency-array implementation.
- Changed the worker/store/UI boundary so the app now renders from a derived graph view while keeping the engine state resumable and authoritative.
- Tightened worker typings and message handling in `builder.worker.ts` and `layout.worker.ts` so local typechecking and production builds pass cleanly.
- Updated Vite configuration to use a cleaner mode-based `base` setting for production builds.
- Switched deployment from the old `gh-pages` branch workflow to GitHub Actions-based Pages deployment.
- Removed unused framework/dependency scaffolding from `package.json` by dropping `elkjs`, `tailwindcss`, and the old `gh-pages` CLI deploy path.
- Rewrote the README to give the project a clearer description, roadmap, shortcomings list, and workflow badges.

### Fixed
- Fixed the subgroup initialisation loop so subgroup generators are handled correctly.
- Fixed the broken `setGroup()` store helper so it updates the reactive refs correctly.
- Fixed `decodePres()` typing so invalid or empty URL payloads can return `null` safely.
- Fixed multiple TypeScript issues across worker files, graph code, and config so `npm run type-check` completes successfully.
- Fixed the project state enough that `npm run build-only` now completes successfully after reinstalling local dependencies.
- Fixed a worker payload cloning issue in `SchreierGraph.vue` by sending plain clone-safe node/link objects to the layout worker.

### Removed
- Removed unused imports and scaffold residue from the previous top-level app structure.
- Removed unused dependencies `elkjs`, `tailwindcss`, and the old `gh-pages` CLI deployment dependency.
