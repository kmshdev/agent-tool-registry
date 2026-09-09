<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { timelineScroll } from '../lib/timeline-scroll';
  import type { Entry } from '../lib/types';
  import MorphIcon from './primitives/MorphIcon.svelte';
  import {revealCard} from '../lib/text-motion';
  import RepoArtwork from './RepoArtwork.svelte';
  let {entries,onselect}:{entries:Entry[];onselect:(id:string)=>void}=$props();
  let limit=$state(60);
  let track=$state<HTMLDivElement>(null!);
  let scene=$state<HTMLDivElement>(null!);
  let sceneHeight=$state(900);
  let windowStart=$state(0);
  let windowEnd=$state(8);
  let stride=$state(410);
  let gap=$state(50);
  let controller:ReturnType<typeof timelineScroll>|undefined;
  onMount(()=>{
    controller=timelineScroll(track,scene,()=>Math.min(limit,ordered.length),metrics=>{
      windowStart=metrics.start;windowEnd=metrics.end;stride=metrics.stride;gap=metrics.gap;sceneHeight=metrics.height;
    });
    return()=>controller?.destroy();
  });
  async function jump(year:string){
    const index=ordered.findIndex(entry=>(entry.starredAt?.slice(0,4)||'Undated')===year);
    if(index<0)return;
    limit=ordered.length;await tick();controller?.measure();await tick();controller?.seek(index*controller.stride);
  }
  $effect(()=>{void limit;void entries;void tick().then(()=>controller?.measure());});
  let ordered=$derived([...entries].sort((a,b)=>(b.starredAt??'').localeCompare(a.starredAt??'')));
  let years=$derived([...new Set(ordered.map(e=>e.starredAt?.slice(0,4)||'Undated'))]);
</script>
<div class="timeline-navigation" aria-label="Jump to year"><span> / Starred collection</span>{#each years as year}<button onclick={()=>jump(year)}>{year}</button>{/each}<span class="scroll-label">Scroll to explore →</span></div>
<div class="timeline-scroll-scene" bind:this={scene} style:height={`${sceneHeight}px`}><div class="timeline-sticky">
<!-- svelte-ignore a11y_no_noninteractive_tabindex (The overflow region needs focus for native arrow-key scrolling.) -->
<div class="star-timeline" bind:this={track} role="region" aria-label="Starred repository timeline" tabindex="0">{#if windowStart>0}<div class="timeline-spacer" aria-hidden="true" style:width={`${windowStart*stride-gap}px`}></div>{/if}
{#each ordered.slice(windowStart,Math.min(windowEnd,limit)) as entry,localIndex (entry.id)}
  {@const i=windowStart+localIndex}
  <div data-timeline-index={i} data-year={i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4) ? entry.starredAt?.slice(0,4)||'Undated' : undefined} class="timeline-slot" class:alternate={i%2===1}>{#if i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4)}<h2 class="timeline-year" id={`year-${entry.starredAt?.slice(0,4)||'Undated'}`}>{entry.starredAt?.slice(0,4)||'Undated'}</h2>{/if}
  <button class="timeline-card" use:revealCard style:--card-angle={`${i%2===0?-1.2:1.2}deg`} data-proximity-card onclick={()=>onselect(entry.id)}><span class="timeline-date">{entry.starredAt?new Date(entry.starredAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Saved'}</span><div class="repo-art"><RepoArtwork {entry} variant={i}/><span class="repo-language">{entry.language||entry.category}</span></div><span class="timeline-copy"><span class="eyebrow">{entry.owner} / {entry.language||'Repository'}</span><strong>{entry.name}</strong><span>{entry.description}</span><span class="timeline-meta">★ {(entry.stars??0).toLocaleString()}<MorphIcon icon="arrow"/></span></span></button></div>
{/each}{#if windowEnd<Math.min(limit,ordered.length)}<div class="timeline-spacer" aria-hidden="true" style:width={`${(Math.min(limit,ordered.length)-windowEnd)*stride-gap}px`}></div>{/if}</div></div></div>
{#if limit<ordered.length}<button class="pill-button timeline-more" onclick={()=>limit+=60}>Show more · {ordered.length-limit} remaining<MorphIcon icon="plus"/></button>{/if}
