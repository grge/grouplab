# grouplab

Visualise groups given by generators and relation in your browser!

This project was put together in an afternoon by porting my Todd-Coxeter python code into javascript, and stitching things together with Vue.js. It was meant as a demo, but perhaps I will revisit it and add more features in the future.

**[Demo](https://grge.github.io/grouplab/)**

## Things:
* The graph currently pauses at about 100 nodes, and you can incrementally increase the limit by hitting the pause button.
* The presentation only works for relators currently.
* The graph layout turns out to be the slowest part of the app, and I haven't put it in a web worker yet sorry.
* All the code is there to do coset enumeration for a subgroup given by generators. I just need to add UI.
* After that, some other features I would like to add are:
  * A nice parser for better relation input, including proper relations, powers, commutators.
  * Maybe even typing known groups.
  * Smarter graph layout
  * Have a list of known groups somewhere.
  * Finding low index subgroups in the background.
  * Interact the graph to do coset enumeration by a subset of nodes, or quotient groups.


