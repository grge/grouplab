export type Relation = string | [string, string];

export interface PresentOpts {
  generators: string[];
  relations: Relation[];
}

const inverse = (w: string) =>
  w.split("").reverse().map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join("");
const base   = (g: string) => g.toLowerCase();
const isInv  = (g: string) => g === g.toUpperCase();

export class PresentationGroup {
  readonly generators: string[];
  readonly relations: Array<[string, string]>;
  constructor(opts: PresentOpts) {
    this.generators = opts.generators;
    this.relations = opts.relations.map((r) =>
      typeof r === "string" ? [r, ""] : (Array.isArray(r) && r.length === 2 ? r : (() => {throw new Error("Bad relation")})())
    );
  }
  get relators(): string[] { return this.relations.map(([r1,r2]) => r1 + inverse(r2)); }
}

export interface GraphState {
  inEdges: Array<[string, Record<string,string>]>,
  outEdges: Array<[string, Record<string,string>]>,
  unfinished: string[],
}

const mapToObj = (m: Map<string,string>) => Object.fromEntries(m);
const objToMap = (o: Record<string,string>) => new Map(Object.entries(o));

export class GraphBuilder {
  readonly G: PresentationGroup;
  readonly inEdges = new Map<string, Map<string,string>>();
  readonly outEdges = new Map<string, Map<string,string>>();
  private unfinished: string[];
  private mergeQueue: Array<[string,string]> = [];
  private subgroupGenerators: string[];

  constructor(group: PresentationGroup, subgroupGenerators: string[] = [], resume?: GraphState) {
    this.G = group;
    this.subgroupGenerators = subgroupGenerators;

    if (resume) {
      for (const [n,obj] of resume.inEdges) this.inEdges.set(n, objToMap(obj));
      for (const [n,obj] of resume.outEdges) this.outEdges.set(n, objToMap(obj));
      this.unfinished = [...resume.unfinished];
    } else {
      this.ensure("");
      this.unfinished = [""];
      for (const w in subgroupGenerators) {
        let c=""; for (const g of w) c=this.define(c,g); this.merge(c,"");
      }
    }
  }

  /*────────── incremental API ─────────*/
  step(): boolean {
    if (!this.unfinished.length) return false;
    const current = this.unfinished.shift()!;
    for (const rel of this.G.relators) { this.scan(current, rel); if (!this.outEdges.has(current)) break; }
    if (this.outEdges.has(current)) {
      for (const gen of this.G.generators) {
        if (!this.outEdges.get(current)!.has(base(gen))) this.unfinished.push(this.define(current, gen));
        if (!this.inEdges.get(current)!.has(base(gen)))  this.unfinished.push(this.define(current, inverse(gen)));
      }
    }
    return this.unfinished.length>0;
  }

  run(max=Infinity){let s=0; while(s<max && this.step()) ++s; return this.unfinished.length;}

  exportState(): GraphState {
    return {
      inEdges:[...this.inEdges].map(([n,m])=>[n,mapToObj(m)]),
      outEdges:[...this.outEdges].map(([n,m])=>[n,mapToObj(m)]),
      unfinished:[...this.unfinished],
    };
  }
  static importState(pg:PresentationGroup,g:subgroupGenerators, state:GraphState){return new GraphBuilder(pg,g,state);}

  /*────────── internals ─────────*/
  private ensure(n:string){ if(!this.outEdges.has(n)){ this.outEdges.set(n,new Map()); this.inEdges.set(n,new Map()); }}
  private connect(a:string,b:string,g:string){ const bse=base(g); this.ensure(a); this.ensure(b); if(isInv(g)){ this.inEdges.get(a)!.set(bse,b); this.outEdges.get(b)!.set(bse,a);} else { this.outEdges.get(a)!.set(bse,b); this.inEdges.get(b)!.set(bse,a);} }
  private define(n:string,g:string){const nn=n+g; this.connect(n,nn,g); return nn;}
  private follow(n:string,g:string){const bse=base(g); return isInv(g)?this.inEdges.get(n)?.get(bse):this.outEdges.get(n)?.get(bse);}

  private scan(node:string,rel:string){
    let f=node,i=0;
    let b=node,j=rel.length-1;
    for(const g of rel){
      const nxt=this.follow(f,g); if(nxt === undefined)break; f=nxt;++i;
    }
    if(i===rel.length){
      if(f!==node)this.merge(f,node);
      return;
    }
    for(const g of inverse(rel.slice(i))){
      const nxt=this.follow(b,g);
      if(nxt === undefined)break; b=nxt;--j;
    }
    if(i>j){
      this.merge(b,f); return;
    }
    while(i<j){
      const nn=this.define(f,rel[i]);
      this.unfinished.push(nn);
      f=nn;++i;
    }
    this.connect(f,b,rel[i]);
  }

  private merge(a:string,b:string){ this.mergeQueue=[[a,b]]; while(this.mergeQueue.length){ const [x,y]=this.mergeQueue.shift()!; const[w,l]=this.chooseWinner(x,y); this.contract(l,w);} }
  private chooseWinner(u:string,v:string):[string,string]{ const ua=this.outEdges.has(u); const va=this.outEdges.has(v); if(ua&&!va) return [u,v]; if(va&&!ua) return [v,u]; if(u.length<v.length) return [u,v]; if(v.length<u.length) return [v,u]; return [u,v].sort() as [string,string]; }

  private contract(loser:string,winner:string){ if(loser===winner||!this.outEdges.has(loser)) return; this.ensure(winner);
    // move outgoing
    for(const [b,t] of this.outEdges.get(loser)!) {
      this.ensure(t);
      const ex=this.outEdges.get(winner)!.get(b);
      if(ex && ex!==t) this.mergeQueue.push([ex,t]);
      this.outEdges.get(winner)!.set(b,t);
      this.inEdges.get(t)!.set(b,winner);
    }
    // move incoming
    for(const [b,s] of this.inEdges.get(loser)!) {
      this.ensure(s);
      const ex=this.inEdges.get(winner)!.get(b);
      if(ex && ex!==s) this.mergeQueue.push([ex,s]);
      this.inEdges.get(winner)!.set(b,s);
      this.outEdges.get(s)!.set(b,winner);
    }
    this.outEdges.delete(loser); this.inEdges.delete(loser); this.unfinished=this.unfinished.filter(n=>n!==loser);
  }
}
