<script lang="ts">
  import { featuredProjects } from '../lib/featured-projects';
  import type { Snapshot } from '../lib/types';
  import StarTimeline from './StarTimeline.svelte';
  import NumberFlow from '@number-flow/svelte';
  import PatternStudy from './PatternStudy.svelte';
  import { inViewMotion } from '../lib/text-motion';
  import WorkIcon from './WorkIcon.svelte';
  import BoxStudy from './BoxStudy.svelte';
  import MorphIcon from './primitives/MorphIcon.svelte';
  import { revealText } from '../lib/text-motion';
  import { cue } from '../lib/sound';
  let {data,connected,loading,onselect,onsource,publicShowcase=false}:{data:Snapshot;publicShowcase?:boolean;connected:boolean;loading:boolean;onselect:(id:string)=>void;onsource:(source:string)=>void}=$props();
  let tickerPaused=$state(false);
  let hovered=$state(-1);
  let sourceLabels=$derived<Record<string,string>>(publicShowcase?{Design:'Design',Agents:'Agents & AI',Development:'Development',Automation:'Automation','Browser & web':'Browser & web'}:{cli:'Commands',brew:'Packages',agents:'Agents & skills',apps:'Mac apps',github:'Starred repos'});
  let featured=$derived(data.entries.filter(e=>e.favorite).slice(0,4));
</script>
<div class="editorial-home">
  <section class="hero terminal-hero"><div class="eyebrow"><span class="terminal-prompt">~/kmsh.dev</span> <span>{publicShowcase?'— notes from the internet':'— a personal workspace'}</span></div><h1><span use:revealText>Welcome to a</span><br/><span use:revealText>small corner of mind</span><br/><em use:revealText>KMSH.DEV</em><span class="terminal-caret" aria-hidden="true">▌</span></h1><div class="hero-bottom"><p>Hope you visit this page<br/>as seldomly as I do.</p></div></section>
  <div class="editorial-grid">{#each featuredProjects as group,i}<section class="feature" data-proximity-card><div class="section-label">/ {group.kind==='Contribution'?'Open-source contribution':'Selected project'}<span>{String(i+1).padStart(2,'0')}</span></div><button class="feature-art art-{i}" onpointerenter={()=>hovered=i} onpointerleave={()=>hovered=-1} onclick={()=>{cue('press');onselect(group.id);}}>{#if i%2===0}<BoxStudy variant={i}/>{:else}<PatternStudy variant={i} caption={false}/>{/if}<span class="art-index"><span>{group.language}</span><span>{group.archived?'Archived':'Open source'}</span></span><span class="art-action"><MorphIcon icon={hovered===i?'arrow':'plus'}/></span></button><h2 use:revealText>{group.name}</h2><p>{group.description}</p><button class="pill-button" onclick={()=>onselect(group.id)}>Explore project<MorphIcon icon="arrow" size={16}/></button></section>{/each}</div>
  <section class="live-ticker" aria-label="Live registry statistics" use:inViewMotion><span class="ticker-label"><i class="live-dot" class:offline={!connected&&!publicShowcase}></i> {publicShowcase?'DISCOVERIES':'REGISTRY'} / {loading?'LOADING':data.revision<0?'UNAVAILABLE':publicShowcase?'COLLECTION':connected?'LIVE':'OFFLINE'}</span><div class="ticker-window"><div class="ticker-track" style:animation-play-state={tickerPaused?'paused':undefined}>{#each [0,1] as copy}<div class="ticker-group" aria-hidden={copy===1 ? 'true' : undefined}>{#each Object.entries(sourceLabels) as [id,label]}<span>{label}<b>{#if loading||data.revision<0}—{:else}<NumberFlow value={data.entries.filter(e=>publicShowcase?e.category===id:e.source===id).length}/>{/if}</b></span>{/each}<span>{publicShowcase?'Saved repositories':'Snapshot'} <b>{publicShowcase?data.entries.length:data.revision<0?'—':`r${data.revision}`} </b></span></div>{/each}</div></div><button class="ticker-toggle" aria-label={tickerPaused?'Play ticker':'Pause ticker'} aria-pressed={tickerPaused} onclick={()=>tickerPaused=!tickerPaused}>{tickerPaused?'Play':'Pause'}</button></section>
  {#if featured.length}<section class="favorites-editorial"><div class="section-label">/ Within reach</div>{#each featured as entry}<button onclick={()=>onselect(entry.id)}><WorkIcon name={entry.source}/><strong>{entry.name}</strong><span>{entry.category}</span><MorphIcon icon="arrow"/></button>{/each}</section>{/if}
  <section id="starred-collection" class="collection-invitation" data-proximity-card><span class="eyebrow">/ A personal internet</span><blockquote class="collection-quote">Iron rusts from disuse; stagnant water loses its purity and in cold weather becomes frozen; even so does inaction sap the vigor of the mind. So we must stretch ourselves to the very limits of human possibility. Anything less is a sin against both God and man.</blockquote><button class="pill-button" onclick={()=>onsource('github')}>Explore {data.revision<0?'your':data.entries.filter(e=>e.source==='github').length.toLocaleString()} starred repositories<MorphIcon icon="arrow"/></button></section>
{#if data.entries.some(e=>e.source==='github')}<StarTimeline entries={data.entries.filter(e=>e.source==='github')} {onselect}/>{/if}
</div>
