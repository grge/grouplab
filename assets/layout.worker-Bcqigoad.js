(function(){"use strict";function le(g){return g&&g.__esModule&&Object.prototype.hasOwnProperty.call(g,"default")?g.default:g}var Z={exports:{}},W={exports:{}},ie,ge;function ye(){return ge||(ge=1,ie=function(f){return f===0?"x":f===1?"y":f===2?"z":"c"+(f+1)}),ie}var ae,me;function z(){if(me)return ae;me=1;const g=ye();return ae=function(h){return i;function i(t,v){let a=v&&v.indent||0,d=v&&v.join!==void 0?v.join:`
`,e=Array(a+1).join(" "),c=[];for(let r=0;r<h;++r){let $=g(r),x=r===0?"":e;c.push(x+t.replace(/{var}/g,$))}return c.join(d)}},ae}var be;function Me(){if(be)return W.exports;be=1;const g=z();W.exports=f,W.exports.generateCreateBodyFunctionBody=h,W.exports.getVectorCode=t,W.exports.getBodyCode=i;function f(v,a){let d=h(v,a),{Body:e}=new Function(d)();return e}function h(v,a){return`
${t(v,a)}
${i(v)}
return {Body: Body, Vector: Vector};
`}function i(v){let a=g(v),d=a("{var}",{join:", "});return`
function Body(${d}) {
  this.isPinned = false;
  this.pos = new Vector(${d});
  this.force = new Vector();
  this.velocity = new Vector();
  this.mass = 1;

  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.reset = function() {
  this.force.reset();
  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.setPosition = function (${d}) {
  ${a("this.pos.{var} = {var} || 0;",{indent:2})}
};`}function t(v,a){let d=g(v),e="";return a&&(e=`${d(`
	   var v{var};
	Object.defineProperty(this, '{var}', {
	  set: function(v) { 
	    if (!Number.isFinite(v)) throw new Error('Cannot set non-numbers to {var}');
	    v{var} = v; 
	  },
	  get: function() { return v{var}; }
	});`)}`),`function Vector(${d("{var}",{join:", "})}) {
  ${e}
    if (typeof arguments[0] === 'object') {
      // could be another vector
      let v = arguments[0];
      ${d('if (!Number.isFinite(v.{var})) throw new Error("Expected value is not a finite number at Vector constructor ({var})");',{indent:4})}
      ${d("this.{var} = v.{var};",{indent:4})}
    } else {
      ${d('this.{var} = typeof {var} === "number" ? {var} : 0;',{indent:4})}
    }
  }
  
  Vector.prototype.reset = function () {
    ${d("this.{var} = ",{join:""})}0;
  };`}return W.exports}var G={exports:{}},xe;function ke(){if(xe)return G.exports;xe=1;const g=z(),f=ye();G.exports=h,G.exports.generateQuadTreeFunctionBody=i,G.exports.getInsertStackCode=e,G.exports.getQuadNodeCode=d,G.exports.isSamePosition=t,G.exports.getChildBodyCode=a,G.exports.setChildBodyCode=v;function h(c){let r=i(c);return new Function(r)()}function i(c){let r=g(c),$=Math.pow(2,c);return`
${e()}
${d(c)}
${t(c)}
${a(c)}
${v(c)}

function createQuadTree(options, random) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  var gravity = options.gravity;
  var updateQueue = [];
  var insertStack = new InsertStack();
  var theta = options.theta;

  var nodesCache = [];
  var currentInCache = 0;
  var root = newNode();

  return {
    insertBodies: insertBodies,

    /**
     * Gets root node if it is present
     */
    getRoot: function() {
      return root;
    },

    updateBodyForce: update,

    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };

  function newNode() {
    // To avoid pressure on GC we reuse nodes.
    var node = nodesCache[currentInCache];
    if (node) {
${w("      node.")}
      node.body = null;
      node.mass = ${r("node.mass_{var} = ",{join:""})}0;
      ${r("node.min_{var} = node.max_{var} = ",{join:""})}0;
    } else {
      node = new QuadNode();
      nodesCache[currentInCache] = node;
    }

    ++currentInCache;
    return node;
  }

  function update(sourceBody) {
    var queue = updateQueue;
    var v;
    ${r("var d{var};",{indent:4})}
    var r; 
    ${r("var f{var} = 0;",{indent:4})}
    var queueLength = 1;
    var shiftIdx = 0;
    var pushIdx = 1;

    queue[0] = root;

    while (queueLength) {
      var node = queue[shiftIdx];
      var body = node.body;

      queueLength -= 1;
      shiftIdx += 1;
      var differentBody = (body !== sourceBody);
      if (body && differentBody) {
        // If the current node is a leaf node (and it is not source body),
        // calculate the force exerted by the current node on body, and add this
        // amount to body's net force.
        ${r("d{var} = body.pos.{var} - sourceBody.pos.{var};",{indent:8})}
        r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${r("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:10})}
          r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${r("f{var} += v * d{var};",{indent:8})}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${r("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};",{indent:8})}
        r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${r("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:10})}
          r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${f(0)} - node.min_${f(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${r("f{var} += v * d{var};",{indent:10})}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${y()}
        }
      }
    }

    ${r("sourceBody.force.{var} += f{var};",{indent:4})}
  }

  function insertBodies(bodies) {
    ${r("var {var}min = Number.MAX_VALUE;",{indent:4})}
    ${r("var {var}max = Number.MIN_VALUE;",{indent:4})}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${r("if (pos.{var} < {var}min) {var}min = pos.{var};",{indent:6})}
      ${r("if (pos.{var} > {var}max) {var}max = pos.{var};",{indent:6})}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${r("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;",{indent:4})}

    currentInCache = 0;
    root = newNode();
    ${r("root.min_{var} = {var}min;",{indent:4})}
    ${r("root.max_{var} = {var}min + maxSideLength;",{indent:4})}

    i = bodies.length - 1;
    if (i >= 0) {
      root.body = bodies[i];
    }
    while (i--) {
      insert(bodies[i], root);
    }
  }

  function insert(newBody) {
    insertStack.reset();
    insertStack.push(root, newBody);

    while (!insertStack.isEmpty()) {
      var stackItem = insertStack.pop();
      var node = stackItem.node;
      var body = stackItem.body;

      if (!node.body) {
        // This is internal node. Update the total mass of the node and center-of-mass.
        ${r("var {var} = body.pos.{var};",{indent:8})}
        node.mass += body.mass;
        ${r("node.mass_{var} += body.mass * {var};",{indent:8})}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${r("var min_{var} = node.min_{var};",{indent:8})}
        ${r("var max_{var} = (min_{var} + node.max_{var}) / 2;",{indent:8})}

${m(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${r("child.min_{var} = min_{var};",{indent:10})}
          ${r("child.max_{var} = max_{var};",{indent:10})}
          child.body = body;

          setChild(node, quadIdx, child);
        } else {
          // continue searching in this quadrant.
          insertStack.push(child, body);
        }
      } else {
        // We are trying to add to the leaf node.
        // We have to convert current leaf into internal node
        // and continue adding two nodes.
        var oldBody = node.body;
        node.body = null; // internal nodes do not cary bodies

        if (isSamePosition(oldBody.pos, body.pos)) {
          // Prevent infinite subdivision by bumping one node
          // anywhere in this quadrant
          var retriesCount = 3;
          do {
            var offset = random.nextDouble();
            ${r("var d{var} = (node.max_{var} - node.min_{var}) * offset;",{indent:12})}

            ${r("oldBody.pos.{var} = node.min_{var} + d{var};",{indent:12})}
            retriesCount -= 1;
            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
            // This is very bad, we ran out of precision.
            // if we do not return from the method we'll get into
            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
            // Next layout iteration should get larger bounding box in the first step and fix this
            return;
          }
        }
        // Next iteration should subdivide node further.
        insertStack.push(node, oldBody);
        insertStack.push(node, body);
      }
    }
  }
}
return createQuadTree;

`;function m(C){let B=[],S=Array(C+1).join(" ");for(let L=0;L<c;++L)B.push(S+`if (${f(L)} > max_${f(L)}) {`),B.push(S+`  quadIdx = quadIdx + ${Math.pow(2,L)};`),B.push(S+`  min_${f(L)} = max_${f(L)};`),B.push(S+`  max_${f(L)} = node.max_${f(L)};`),B.push(S+"}");return B.join(`
`)}function y(){let C=Array(11).join(" "),B=[];for(let S=0;S<$;++S)B.push(C+`if (node.quad${S}) {`),B.push(C+`  queue[pushIdx] = node.quad${S};`),B.push(C+"  queueLength += 1;"),B.push(C+"  pushIdx += 1;"),B.push(C+"}");return B.join(`
`)}function w(C){let B=[];for(let S=0;S<$;++S)B.push(`${C}quad${S} = null;`);return B.join(`
`)}}function t(c){let r=g(c);return`
  function isSamePosition(point1, point2) {
    ${r("var d{var} = Math.abs(point1.{var} - point2.{var});",{indent:2})}
  
    return ${r("d{var} < 1e-8",{join:" && "})};
  }  
`}function v(c){var r=Math.pow(2,c);return`
function setChild(node, idx, child) {
  ${$()}
}`;function $(){let x=[];for(let m=0;m<r;++m){let y=m===0?"  ":"  else ";x.push(`${y}if (idx === ${m}) node.quad${m} = child;`)}return x.join(`
`)}}function a(c){return`function getChild(node, idx) {
${r()}
  return null;
}`;function r(){let $=[],x=Math.pow(2,c);for(let m=0;m<x;++m)$.push(`  if (idx === ${m}) return node.quad${m};`);return $.join(`
`)}}function d(c){let r=g(c),$=Math.pow(2,c);var x=`
function QuadNode() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain bodies:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
${m("  this.")}

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  ${r("this.mass_{var} = 0;",{indent:2})}

  // bounding box coordinates
  ${r("this.min_{var} = 0;",{indent:2})}
  ${r("this.max_{var} = 0;",{indent:2})}
}
`;return x;function m(y){let w=[];for(let C=0;C<$;++C)w.push(`${y}quad${C} = null;`);return w.join(`
`)}}function e(){return`
/**
 * Our implementation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressure: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}
`}return G.exports}var ee={exports:{}},we;function Ie(){if(we)return ee.exports;we=1,ee.exports=f,ee.exports.generateFunctionBody=h;const g=z();function f(i){let t=h(i);return new Function("bodies","settings","random",t)}function h(i){let t=g(i);return`
  var boundingBox = {
    ${t("min_{var}: 0, max_{var}: 0,",{indent:4})}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${t("base_{var} = 0",{join:", "})};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${t("base_{var} += neighborPos.{var};",{indent:10})}
        }

        ${t("base_{var} /= neighbors.length;",{indent:8})}
      } else {
        ${t("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;",{indent:8})}
      }

      var springLength = settings.springLength;
      return {
        ${t("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,",{indent:8})}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${t("var max_{var} = -Infinity;",{indent:4})}
    ${t("var min_{var} = Infinity;",{indent:4})}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${t("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};",{indent:6})}
      ${t("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};",{indent:6})}
    }

    ${t("boundingBox.min_{var} = min_{var};",{indent:4})}
    ${t("boundingBox.max_{var} = max_{var};",{indent:4})}
  }

  function resetBoundingBox() {
    ${t("boundingBox.min_{var} = boundingBox.max_{var} = 0;",{indent:4})}
  }
`}return ee.exports}var re={exports:{}},Be;function Te(){if(Be)return re.exports;Be=1;const g=z();re.exports=f,re.exports.generateCreateDragForceFunctionBody=h;function f(i){let t=h(i);return new Function("options",t)}function h(i){return`
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${g(i)("body.force.{var} -= options.dragCoefficient * body.velocity.{var};",{indent:6})}
    }
  };
`}return re.exports}var ne={exports:{}},Ce;function je(){if(Ce)return ne.exports;Ce=1;const g=z();ne.exports=f,ne.exports.generateCreateSpringForceFunctionBody=h;function f(i){let t=h(i);return new Function("options","random",t)}function h(i){let t=g(i);return`
  if (!Number.isFinite(options.springCoefficient)) throw new Error('Spring coefficient is not a number');
  if (!Number.isFinite(options.springLength)) throw new Error('Spring length is not a number');

  return {
    /**
     * Updates forces acting on a spring
     */
    update: function (spring) {
      var body1 = spring.from;
      var body2 = spring.to;
      var length = spring.length < 0 ? options.springLength : spring.length;
      ${t("var d{var} = body2.pos.{var} - body1.pos.{var};",{indent:6})}
      var r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});

      if (r === 0) {
        ${t("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:8})}
        r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${t("body1.force.{var} += coefficient * d{var}",{indent:6})};
      body1.springCount += 1;
      body1.springLength += r;

      ${t("body2.force.{var} -= coefficient * d{var}",{indent:6})};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`}return ne.exports}var te={exports:{}},$e;function Oe(){if($e)return te.exports;$e=1;const g=z();te.exports=f,te.exports.generateIntegratorFunctionBody=h;function f(i){let t=h(i);return new Function("bodies","timeStep","adaptiveTimeStepWeight",t)}function h(i){let t=g(i);return`
  var length = bodies.length;
  if (length === 0) return 0;

  ${t("var d{var} = 0, t{var} = 0;",{indent:2})}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${t("body.velocity.{var} += coeff * body.force.{var};",{indent:4})}
    ${t("var v{var} = body.velocity.{var};",{indent:4})}
    var v = Math.sqrt(${t("v{var} * v{var}",{join:" + "})});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${t("body.velocity.{var} = v{var} / v;",{indent:6})}
    }

    ${t("d{var} = timeStep * body.velocity.{var};",{indent:4})}

    ${t("body.pos.{var} += d{var};",{indent:4})}

    ${t("t{var} += Math.abs(d{var});",{indent:4})}
  }

  return (${t("t{var} * t{var}",{join:" + "})})/length;
`}return te.exports}var de,qe;function Re(){if(qe)return de;qe=1,de=g;function g(f,h,i,t){this.from=f,this.to=h,this.length=i,this.coefficient=t}return de}var ue,Ne;function Ge(){if(Ne)return ue;Ne=1,ue=g;function g(f,h){var i;if(f||(f={}),h){for(i in h)if(h.hasOwnProperty(i)){var t=f.hasOwnProperty(i),v=typeof h[i],a=!t||typeof f[i]!==v;a?f[i]=h[i]:v==="object"&&(f[i]=g(f[i],h[i]))}}return f}return ue}var se,Se;function fe(){if(Se)return se;Se=1,se=function(i){f(i);var t=g(i);return i.on=t.on,i.off=t.off,i.fire=t.fire,i};function g(h){var i=Object.create(null);return{on:function(t,v,a){if(typeof v!="function")throw new Error("callback is expected to be a function");var d=i[t];return d||(d=i[t]=[]),d.push({callback:v,ctx:a}),h},off:function(t,v){var a=typeof t>"u";if(a)return i=Object.create(null),h;if(i[t]){var d=typeof v!="function";if(d)delete i[t];else for(var e=i[t],c=0;c<e.length;++c)e[c].callback===v&&e.splice(c,1)}return h},fire:function(t){var v=i[t];if(!v)return h;var a;arguments.length>1&&(a=Array.prototype.splice.call(arguments,1));for(var d=0;d<v.length;++d){var e=v[d];e.callback.apply(e.ctx,a)}return h}}}function f(h){if(!h)throw new Error("Eventify cannot use falsy object as events subject");for(var i=["on","fire","off"],t=0;t<i.length;++t)if(h.hasOwnProperty(i[t]))throw new Error("Subject cannot be eventified, since it already has property '"+i[t]+"'")}return se}var J={exports:{}},Fe;function Qe(){if(Fe)return J.exports;Fe=1,J.exports=g,J.exports.random=g,J.exports.randomIterator=d;function g(e){var c=typeof e=="number"?e:+new Date;return new f(c)}function f(e){this.seed=e}f.prototype.next=a,f.prototype.nextDouble=v,f.prototype.uniform=v,f.prototype.gaussian=h,f.prototype.random=v;function h(){var e,c,r;do c=this.nextDouble()*2-1,r=this.nextDouble()*2-1,e=c*c+r*r;while(e>=1||e===0);return c*Math.sqrt(-2*Math.log(e)/e)}f.prototype.levy=i;function i(){var e=1.5,c=Math.pow(t(1+e)*Math.sin(Math.PI*e/2)/(t((1+e)/2)*e*Math.pow(2,(e-1)/2)),1/e);return this.gaussian()*c/Math.pow(Math.abs(this.gaussian()),1/e)}function t(e){return Math.sqrt(2*Math.PI/e)*Math.pow(1/Math.E*(e+1/(12*e-1/(10*e))),e)}function v(){var e=this.seed;return e=e+2127912214+(e<<12)&4294967295,e=(e^3345072700^e>>>19)&4294967295,e=e+374761393+(e<<5)&4294967295,e=(e+3550635116^e<<9)&4294967295,e=e+4251993797+(e<<3)&4294967295,e=(e^3042594569^e>>>16)&4294967295,this.seed=e,(e&268435455)/268435456}function a(e){return Math.floor(this.nextDouble()*e)}function d(e,c){var r=c||g();if(typeof r.next!="function")throw new Error("customRandom does not match expected API: next() function is missing");return{forEach:x,shuffle:$};function $(){var m,y,w;for(m=e.length-1;m>0;--m)y=r.next(m+1),w=e[y],e[y]=e[m],e[m]=w;return e}function x(m){var y,w,C;for(y=e.length-1;y>0;--y)w=r.next(y+1),C=e[w],e[w]=e[y],e[y]=C,m(C);e.length&&m(e[0])}}return J.exports}var ce,_e;function Le(){if(_e)return ce;_e=1,ce=d;var g=Me(),f=ke(),h=Ie(),i=Te(),t=je(),v=Oe(),a={};function d(r){var $=Re(),x=Ge(),m=fe();if(r){if(r.springCoeff!==void 0)throw new Error("springCoeff was renamed to springCoefficient");if(r.dragCoeff!==void 0)throw new Error("dragCoeff was renamed to dragCoefficient")}r=x(r,{springLength:10,springCoefficient:.8,gravity:-12,theta:.8,dragCoefficient:.9,timeStep:.5,adaptiveTimeStepWeight:0,dimensions:2,debug:!1});var y=a[r.dimensions];if(!y){var w=r.dimensions;y={Body:g(w,r.debug),createQuadTree:f(w),createBounds:h(w),createDragForce:i(w),createSpringForce:t(w),integrate:v(w)},a[w]=y}var C=y.Body,B=y.createQuadTree,S=y.createBounds,L=y.createDragForce,H=y.createSpringForce,A=y.integrate,P=p=>new C(p),k=Qe().random(42),_=[],I=[],Q=B(r,k),D=S(_,r,k),T=H(r,k),K=L(r),U=0,j=[],M=new Map,o=0;N("nbody",he),N("spring",pe);var u={bodies:_,quadTree:Q,springs:I,settings:r,addForce:N,removeForce:V,getForces:O,step:function(){for(var p=0;p<j.length;++p)j[p](o);var n=A(_,r.timeStep,r.adaptiveTimeStepWeight);return o+=1,n},addBody:function(p){if(!p)throw new Error("Body is required");return _.push(p),p},addBodyAt:function(p){if(!p)throw new Error("Body position is required");var n=P(p);return _.push(n),n},removeBody:function(p){if(p){var n=_.indexOf(p);if(!(n<0))return _.splice(n,1),_.length===0&&D.reset(),!0}},addSpring:function(p,n,s,b){if(!p||!n)throw new Error("Cannot add null spring to force simulator");typeof s!="number"&&(s=-1);var q=new $(p,n,s,b>=0?b:-1);return I.push(q),q},getTotalMovement:function(){return U},removeSpring:function(p){if(p){var n=I.indexOf(p);if(n>-1)return I.splice(n,1),!0}},getBestNewBodyPosition:function(p){return D.getBestNewPosition(p)},getBBox:l,getBoundingBox:l,invalidateBBox:function(){console.warn("invalidateBBox() is deprecated, bounds always recomputed on `getBBox()` call")},gravity:function(p){return p!==void 0?(r.gravity=p,Q.options({gravity:p}),this):r.gravity},theta:function(p){return p!==void 0?(r.theta=p,Q.options({theta:p}),this):r.theta},random:k};return e(r,u),m(u),u;function l(){return D.update(),D.box}function N(p,n){if(M.has(p))throw new Error("Force "+p+" is already added");M.set(p,n),j.push(n)}function V(p){var n=j.indexOf(M.get(p));n<0||(j.splice(n,1),M.delete(p))}function O(){return M}function he(){if(_.length!==0){Q.insertBodies(_);for(var p=_.length;p--;){var n=_[p];n.isPinned||(n.reset(),Q.updateBodyForce(n),K.update(n))}}}function pe(){for(var p=I.length;p--;)T.update(I[p])}}function e(r,$){for(var x in r)c(r,$,x)}function c(r,$,x){if(r.hasOwnProperty(x)&&typeof $[x]!="function"){var m=Number.isFinite(r[x]);m?$[x]=function(y){if(y!==void 0){if(!Number.isFinite(y))throw new Error("Value of "+x+" should be a valid number.");return r[x]=y,$}return r[x]}:$[x]=function(y){return y!==void 0?(r[x]=y,$):r[x]}}}return ce}var Pe;function De(){if(Pe)return Z.exports;Pe=1,Z.exports=f,Z.exports.simulator=Le();var g=fe();function f(i,t){if(!i)throw new Error("Graph structure cannot be undefined");var v=t&&t.createSimulator||Le(),a=v(t);if(Array.isArray(t))throw new Error("Physics settings is expected to be an object");var d=i.version>19?M:j;t&&typeof t.nodeMass=="function"&&(d=t.nodeMass);var e=new Map,c={},r=0,$=a.settings.springTransform||h;P(),L();var x=!1,m={step:function(){if(r===0)return y(!0),!0;var o=a.step();m.lastMove=o,m.fire("step");var u=o/r,l=u<=.01;return y(l),l},getNodePosition:function(o){return U(o).pos},setNodePosition:function(o){var u=U(o);u.setPosition.apply(u,Array.prototype.slice.call(arguments,1))},getLinkPosition:function(o){var u=c[o];if(u)return{from:u.from.pos,to:u.to.pos}},getGraphRect:function(){return a.getBBox()},forEachBody:w,pinNode:function(o,u){var l=U(o.id);l.isPinned=!!u},isNodePinned:function(o){return U(o.id).isPinned},dispose:function(){i.off("changed",A),m.fire("disposed")},getBody:S,getSpring:B,getForceVectorLength:C,simulator:a,graph:i,lastMove:0};return g(m),m;function y(o){x!==o&&(x=o,H(o))}function w(o){e.forEach(o)}function C(){var o=0,u=0;return w(function(l){o+=Math.abs(l.force.x),u+=Math.abs(l.force.y)}),Math.sqrt(o*o+u*u)}function B(o,u){var l;if(u===void 0)typeof o!="object"?l=o:l=o.id;else{var N=i.hasLink(o,u);if(!N)return;l=N.id}return c[l]}function S(o){return e.get(o)}function L(){i.on("changed",A)}function H(o){m.fire("stable",o)}function A(o){for(var u=0;u<o.length;++u){var l=o[u];l.changeType==="add"?(l.node&&k(l.node.id),l.link&&I(l.link)):l.changeType==="remove"&&(l.node&&_(l.node),l.link&&Q(l.link))}r=i.getNodesCount()}function P(){r=0,i.forEachNode(function(o){k(o.id),r+=1}),i.forEachLink(I)}function k(o){var u=e.get(o);if(!u){var l=i.getNode(o);if(!l)throw new Error("initBody() was called with unknown node id");var N=l.position;if(!N){var V=D(l);N=a.getBestNewBodyPosition(V)}u=a.addBodyAt(N),u.id=o,e.set(o,u),T(o),K(l)&&(u.isPinned=!0)}}function _(o){var u=o.id,l=e.get(u);l&&(e.delete(u),a.removeBody(l))}function I(o){T(o.fromId),T(o.toId);var u=e.get(o.fromId),l=e.get(o.toId),N=a.addSpring(u,l,o.length);$(o,N),c[o.id]=N}function Q(o){var u=c[o.id];if(u){var l=i.getNode(o.fromId),N=i.getNode(o.toId);l&&T(l.id),N&&T(N.id),delete c[o.id],a.removeSpring(u)}}function D(o){var u=[];if(!o.links)return u;for(var l=Math.min(o.links.length,2),N=0;N<l;++N){var V=o.links[N],O=V.fromId!==o.id?e.get(V.fromId):e.get(V.toId);O&&O.pos&&u.push(O)}return u}function T(o){var u=e.get(o);if(u.mass=d(o),Number.isNaN(u.mass))throw new Error("Node mass should be a number")}function K(o){return o&&(o.isPinned||o.data&&o.data.isPinned)}function U(o){var u=e.get(o);return u||(k(o),u=e.get(o)),u}function j(o){var u=i.getLinks(o);return u?1+u.length/3:1}function M(o){var u=i.getLinks(o);return u?1+u.size/3:1}}function h(){}return Z.exports}var Ve=De(),Ae=le(Ve),ve,Ee;function Ue(){if(Ee)return ve;Ee=1,ve=f;var g=fe();function f(a){if(a=a||{},"uniqueLinkId"in a&&(console.warn("ngraph.graph: Starting from version 0.14 `uniqueLinkId` is deprecated.\nUse `multigraph` option instead\n",`
`,`Note: there is also change in default behavior: From now on each graph
is considered to be not a multigraph by default (each edge is unique).`),a.multigraph=a.uniqueLinkId),a.multigraph===void 0&&(a.multigraph=!1),typeof Map!="function")throw new Error("ngraph.graph requires `Map` to be defined. Please polyfill it before using ngraph");var d=new Map,e=new Map,c={},r=0,$=a.multigraph?Q:I,x=[],m=O,y=O,w=O,C=O,B={version:20,addNode:A,addLink:_,removeLink:U,removeNode:k,getNode:P,getNodeCount:D,getLinkCount:T,getEdgeCount:T,getLinksCount:T,getNodesCount:D,getLinks:K,forEachNode:p,forEachLinkedNode:l,forEachLink:u,beginUpdate:w,endUpdate:C,clear:o,hasLink:M,hasNode:P,getLink:M};return g(B),S(),B;function S(){var n=B.on;B.on=s;function s(){return B.beginUpdate=w=he,B.endUpdate=C=pe,m=L,y=H,B.on=n,n.apply(B,arguments)}}function L(n,s){x.push({link:n,changeType:s})}function H(n,s){x.push({node:n,changeType:s})}function A(n,s){if(n===void 0)throw new Error("Invalid node identifier");w();var b=P(n);return b?(b.data=s,y(b,"update")):(b=new h(n,s),y(b,"add")),d.set(n,b),C(),b}function P(n){return d.get(n)}function k(n){var s=P(n);if(!s)return!1;w();var b=s.links;return b&&(b.forEach(j),s.links=null),d.delete(n),y(s,"remove"),C(),!0}function _(n,s,b){w();var q=P(n)||A(n),E=P(s)||A(s),F=$(n,s,b),R=e.has(F.id);return e.set(F.id,F),i(q,F),n!==s&&i(E,F),m(F,R?"update":"add"),C(),F}function I(n,s,b){var q=v(n,s),E=e.get(q);return E?(E.data=b,E):new t(n,s,b,q)}function Q(n,s,b){var q=v(n,s),E=c.hasOwnProperty(q);if(E||M(n,s)){E||(c[q]=0);var F="@"+ ++c[q];q=v(n+F,s+F)}return new t(n,s,b,q)}function D(){return d.size}function T(){return e.size}function K(n){var s=P(n);return s?s.links:null}function U(n,s){return s!==void 0&&(n=M(n,s)),j(n)}function j(n){if(!n||!e.get(n.id))return!1;w(),e.delete(n.id);var s=P(n.fromId),b=P(n.toId);return s&&s.links.delete(n),b&&b.links.delete(n),m(n,"remove"),C(),!0}function M(n,s){if(!(n===void 0||s===void 0))return e.get(v(n,s))}function o(){w(),p(function(n){k(n.id)}),C()}function u(n){if(typeof n=="function")for(var s=e.values(),b=s.next();!b.done;){if(n(b.value))return!0;b=s.next()}}function l(n,s,b){var q=P(n);if(q&&q.links&&typeof s=="function")return b?V(q.links,n,s):N(q.links,n,s)}function N(n,s,b){for(var q,E=n.values(),F=E.next();!F.done;){var R=F.value,Je=R.fromId===s?R.toId:R.fromId;if(q=b(d.get(Je),R),q)return!0;F=E.next()}}function V(n,s,b){for(var q,E=n.values(),F=E.next();!F.done;){var R=F.value;if(R.fromId===s&&(q=b(d.get(R.toId),R),q))return!0;F=E.next()}}function O(){}function he(){r+=1}function pe(){r-=1,r===0&&x.length>0&&(B.fire("changed",x),x.length=0)}function p(n){if(typeof n!="function")throw new Error("Function is expected to iterate over graph nodes. You passed "+n);for(var s=d.values(),b=s.next();!b.done;){if(n(b.value))return!0;b=s.next()}}}function h(a,d){this.id=a,this.links=null,this.data=d}function i(a,d){a.links?a.links.add(d):a.links=new Set([d])}function t(a,d,e,c){this.fromId=a,this.toId=d,this.data=e,this.id=c}function v(a,d){return a.toString()+"👉 "+d.toString()}return ve}var We=Ue(),ze=le(We);let oe=null,X=null,Y={};self.onmessage=({data:g})=>{const{nodes:f,links:h,complete:i,stepsPerFrame:t}=g;X=ze(),f.forEach(a=>X.addNode(a.id,a)),h.forEach(a=>X.addLink(a.source,a.target)),oe=Ae(X,{dimensions:3,springLength:4,springCoefficient:2,dragCoefficient:1,theta:0,gravity:-11,timeStep:.4});for(const a in Y){const d=Y[a],e=oe.getBody(a);e&&(e.pos.x=d.x,e.pos.y=d.y)}function v(){for(let a=0;a<5;a++)oe.step();Y={},X.forEachNode(a=>{const d=oe.getNodePosition(a.id);Y[a.id]={x:d.x,y:d.y}}),self.postMessage({positions:Y}),setTimeout(v,16)}v()}})();
