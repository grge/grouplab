# Changelog

All notable changes to this project will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
but this project uses date-based entries rather than semantic-versioned releases.

## 2026-04-14

### Added
- Added `CHANGELOG.md` to track notable project changes in a human-oriented format.
- Added `src/views/GroupView.vue` so the application has a proper routed view instead of using `App.vue` directly as the page component.
- Added `src/stores/group.ts` as the renamed and cleaned-up Pinia store module.
- Added `src/components/SchreierGraph.vue` as the corrected component name replacing the misspelled `ShreierGraph.vue`.
- Added `src/env.d.ts` to provide Vite client and web worker TypeScript environment definitions.

### Changed
- Reworked `App.vue` into a router shell that renders the active route view rather than mixing shell and page concerns.
- Updated routing so the group page is served through `GroupView.vue` rather than routing directly to `App.vue`.
- Renamed `src/stores/counter.ts` to `src/stores/group.ts` to remove leftover scaffold naming.
- Renamed `src/components/ShreierGraph.vue` to `src/components/SchreierGraph.vue`.
- Tightened worker typings and message handling in `builder.worker.ts` and `layout.worker.ts` so local typechecking and production builds pass cleanly.
- Updated Vite configuration to use a cleaner mode-based `base` setting for production builds.
- Removed unused framework/dependency scaffolding from `package.json` by dropping `elkjs` and `tailwindcss`.

### Fixed
- Fixed the subgroup initialisation loop in `src/utils/core.ts` by iterating over subgroup generator values rather than array indices.
- Fixed the broken `setGroup()` store helper so it updates the reactive refs correctly.
- Fixed `decodePres()` typing so invalid or empty URL payloads can return `null` safely.
- Fixed multiple TypeScript issues across worker files, graph code, and config so `npm run type-check` completes successfully.
- Fixed the project state enough that `npm run build-only` now completes successfully after reinstalling local dependencies.

### Removed
- Removed unused imports and scaffold residue from the previous top-level app structure.
- Removed unused dependencies `elkjs` and `tailwindcss`.
