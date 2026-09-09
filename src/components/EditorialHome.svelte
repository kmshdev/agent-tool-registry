<script lang="ts">
  import type { Snapshot } from '../lib/types';
  import StarTimeline from './StarTimeline.svelte';
  import Counter from './Counter.svelte';
  import WorkIcon from './WorkIcon.svelte';
  import WelcomeText from './primitives/WelcomeText.svelte';
  import MorphIcon from './primitives/MorphIcon.svelte';
  import { revealText, cursorProximity } from '../lib/text-motion';
  import { cue } from '../lib/sound';
  let {data,onselect,onsource,onsearch}:{data:Snapshot;onselect:(id:string)=>void;onsource:(source:string)=>void;onsearch:(query:string)=>void}=$props();
  let query=$state('');
  let hovered=$state(-1);
  const groups=[{id:'cli',title:'A command for every idea.',label:'Command line',detail:'Your installed tools, ready to build.'},{id:'agents',title:'Meet your collaborators.',label:'Agents & skills',detail:'Specialists and workflows in your workspace.'},{id:'apps',title:'Made for your Mac.',label:'Applications',detail:'Explore the software already at your fingertips.'},{id:'brew',title:'Build on solid foundations.',label:'Toolchains',detail:'The runtimes and packages powering your workspace.'}];
  const patterns=['orbit','maze','rings','maze'];
  let featured=$derived(data.entries.filter(e=>e.favorite).slice(0,4));
</script>
<div class="editorial-home">
  <section class="hero"><div class="eyebrow"><WelcomeText /></div><h1 use:revealText>Your next idea.<br/>Already <span>equipped.</span></h1><div class="hero-bottom"><p>Tools, agents, and discoveries.<br/>One place to build what’s next.</p><form onsubmit={e=>{e.preventDefault();onsearch(query);}}><WorkIcon name="all"/><input aria-label="Find a capability" placeholder="Find your next tool" bind:value={query}/><button aria-label="Search registry"><MorphIcon icon="arrow"/></button></form></div></section>
  <div class="editorial-grid">{#each groups as group,i}<section class="feature" data-proximity-card><div class="section-label">/ {group.label}<span><Counter value={data.entries.filter(e=>e.source===group.id).length}/></span></div><button class="feature-art art-{i}" aria-label={`Browse ${group.label}`} onpointerenter={()=>hovered=i} onpointerleave={()=>hovered=-1} onclick={()=>{cue('press');onsource(group.id);}}><div class="pattern" style:--pattern={`url('/patterns/snapattern-${patterns[i]}.svg')`}></div><span class="art-index">FIG. 0{i+1}</span><span class="art-symbol"><WorkIcon name={group.id} size={92}/></span><span class="art-action"><MorphIcon icon={hovered===i?'arrow':'plus'}/></span></button><h2 use:cursorProximity>{group.title}</h2><p>{group.detail}</p><button class="pill-button" onclick={()=>onsource(group.id)}>Explore {group.label.toLowerCase()}<MorphIcon icon="arrow" size={16}/></button></section>{/each}</div>
  {#if featured.length}<section class="favorites-editorial"><div class="section-label">/ Within reach</div>{#each featured as entry}<button onclick={()=>onselect(entry.id)}><WorkIcon name={entry.source}/><strong>{entry.name}</strong><span>{entry.category}</span><MorphIcon icon="arrow"/></button>{/each}</section>{/if}
  <section id="starred-collection" class="collection-invitation" data-proximity-card><span class="eyebrow">/ A personal internet</span><h2 use:cursorProximity>Good things.<br/>Saved for later.</h2><button class="pill-button" onclick={()=>onsource('github')}>Explore {data.entries.filter(e=>e.source==='github').length.toLocaleString()} starred repositories<MorphIcon icon="arrow"/></button></section>
<StarTimeline entries={data.entries.filter(e=>e.source==='github')} {onselect}/>
</div>
