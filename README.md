# grouplab

[![CI](https://github.com/grge/grouplab/actions/workflows/ci.yml/badge.svg)](https://github.com/grge/grouplab/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/grge/grouplab/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/grge/grouplab/actions/workflows/deploy-pages.yml)

Grouplab is a small browser-based tool for exploring groups given by generators and relations. It builds and visualises Cayley- and Schreier-style graph structures directly in the browser, with the current implementation focused on finite examples that can be explored incrementally.

**Live site:** <https://grge.github.io/grouplab/>

## Roadmap

- Improve presentation input with a proper parser for powers, commutators, and equalities
- Expose subgroup generation and coset enumeration more directly in the UI
- Refactor the core around the newer `groups` framework design
- Improve graph layout and interaction for larger examples
- Add a small library of built-in example groups

## Current shortcomings

- Input is still fairly raw and mostly oriented around relator-style strings
- Large graphs are not handled especially gracefully yet; the build pauses and layout quality degrades
- Subgroup and low-index subgroup features are not yet surfaced cleanly in the interface
- The computational core is still in the middle of a cleanup/refactor cycle

## Development

```bash
npm install
npm run type-check
npm run build
npm run dev
```
