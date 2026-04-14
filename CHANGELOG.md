# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
but this project uses date-based entries rather than semantic-versioned releases.

## 2026-04-14

### Added
- Added `CHANGELOG.md` to track notable project changes in a human-oriented format.
- Added GitHub Actions workflows for CI and GitHub Pages deployment.
- Added a proper Vitest-based regression test suite for group-order examples, including larger merging-heavy cases.
- Added parser support for generator lists, relation lists, and full presentations, including powers, negative powers, grouped expressions, commutators, and chained equalities.
- Added parser tests alongside the engine regression suite.
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
- Preserved incremental building by wrapping the new engine in a `step()`-based interface suitable for the existing worker/UI architecture.
- Changed the worker/store/UI boundary so the app now renders from a derived graph view while keeping the engine state resumable and authoritative.
- Kept warm-start layout behaviour by projecting stable canonical node IDs into the layout pipeline.
- Moved subgroup initialisation into the graph kernel so the Schreier-specific setup lives with the graph machinery rather than the builder wrapper.
- Tightened worker typings and message handling in `builder.worker.ts` and `layout.worker.ts` so local typechecking and production builds pass cleanly.
- Updated Vite configuration to use a cleaner mode-based `base` setting for production builds.
- Switched deployment from the old `gh-pages` branch workflow to GitHub Actions-based Pages deployment.
- Removed unused framework/dependency scaffolding from `package.json` by dropping `elkjs`, `tailwindcss`, and the old `gh-pages` CLI deploy path.
- Rewrote the README to give the project a clearer description, roadmap, shortcomings list, and workflow badges.
- Switched presentation editing to preserve raw user-entered syntax separately from the parsed relator representation used by the engine.
- Updated URL handling to preserve readable raw generator/relation syntax in the existing `/g/<gens>_<rels>` route shape rather than round-tripping expanded relator text.

### Fixed
- Fixed the subgroup initialisation loop so subgroup generators are handled correctly.
- Fixed the broken `setGroup()` store helper so it updates the reactive refs correctly.
- Fixed `decodePres()` typing so invalid or empty URL payloads can return `null` safely.
- Fixed multiple TypeScript issues across worker files, graph code, and config so `npm run type-check` completes successfully.
- Fixed the project state enough that `npm run build-only` now completes successfully after reinstalling local dependencies.
- Fixed a worker payload cloning issue in `SchreierGraph.vue` by sending plain clone-safe node/link objects to the layout worker.
- Fixed parser-driven editing so expressions like `a^100` remain editable in their entered form instead of being replaced by expanded relator strings.
- Fixed initial page-load/input-state synchronisation so URL/default values populate the editable fields correctly.
- Fixed the route-update cascade where preserving parsed relators in the URL was overwriting the nicer raw syntax in the editor.

### Removed
- Removed unused imports and scaffold residue from the previous top-level app structure.
- Removed unused dependencies `elkjs`, `tailwindcss`, and the old `gh-pages` CLI deployment dependency.
