<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { scroll } from 'motion';
  import type { Entry } from '../lib/types';
  import MorphIcon from './primitives/MorphIcon.svelte';
  import {revealText,revealCard} from '../lib/text-motion';
  import RepoArtwork from './RepoArtwork.svelte';
  let {entries,onselect}:{entries:Entry[];onselect:(id:string)=>void}=$props();
  let limit=$state(60);
  let track=$state<HTMLDivElement>(null!);
  let scene=$state<HTMLDivElement>(null!);
  let sceneHeight=$state(900);
  let projected=0;
  onMount(()=>{
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const measure=()=>{sceneHeight=(reduced?0:Math.max(0,track.scrollWidth-track.clientWidth))+track.parentElement!.clientHeight;};
    const observer=new ResizeObserver(measure);observer.observe(track);measure();
    const stop=reduced?()=>{}:scroll((progress:number)=>{projected=progress*Math.max(0,track.scrollWidth-track.clientWidth);track.scrollLeft=projected;},{target:scene,offset:['start start','end end']});
    const horizontal=()=>{const box=scene.getBoundingClientRect();if(!reduced&&box.top<=0&&box.bottom>=track.parentElement!.clientHeight&&Math.abs(track.scrollLeft-projected)>2)window.scrollTo({top:window.scrollY+box.top+track.scrollLeft});};
    track.addEventListener('scroll',horizontal,{passive:true});
    return()=>{stop();observer.disconnect();track.removeEventListener('scroll',horizontal);};
  });
  async function jump(year:string){limit=ordered.length;await tick();sceneHeight=(matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,track.scrollWidth-track.clientWidth))+track.parentElement!.clientHeight;await tick();const target=track.querySelector<HTMLElement>(`[data-year="${year}"]`);if(target&&matchMedia('(prefers-reduced-motion: reduce)').matches){track.scrollTo({left:target.offsetLeft});return;}if(target)window.scrollTo({top:window.scrollY+scene.getBoundingClientRect().top+target.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  $effect(()=>{void limit;void entries.length;void tick().then(()=>{if(track?.isConnected)sceneHeight=(matchMedia('(prefers-reduced-motion: reduce)').matches?0:Math.max(0,track.scrollWidth-track.clientWidth))+track.parentElement!.clientHeight;});});
  let ordered=$derived([...entries].sort((a,b)=>(b.starredAt??'').localeCompare(a.starredAt??'')));
  let years=$derived([...new Set(ordered.map(e=>e.starredAt?.slice(0,4)||'Undated'))]);
</script>
<div class="timeline-navigation" aria-label="Jump to year"><span> / Starred collection</span>{#each years as year}<button onclick={()=>jump(year)}>{year}</button>{/each}<span class="scroll-label">Scroll to explore →</span></div>
<div class="timeline-scroll-scene" bind:this={scene} style:height={`${sceneHeight}px`}><div class="timeline-sticky">
<!-- svelte-ignore a11y_no_noninteractive_tabindex (The overflow region needs focus for native arrow-key scrolling.) -->
<div class="star-timeline" bind:this={track} role="region" aria-label="Starred repository timeline" tabindex="0">{#each ordered.slice(0,limit) as entry,i (entry.id)}
  <div data-year={i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4) ? entry.starredAt?.slice(0,4)||'Undated' : undefined} class="timeline-slot" class:alternate={i%2===1}>{#if i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4)}<h2 class="timeline-year" id={`year-${entry.starredAt?.slice(0,4)||'Undated'}`}>{entry.starredAt?.slice(0,4)||'Undated'}</h2>{/if}
  <button class="timeline-card" use:revealCard style:--card-angle={`${i%2===0?-1.2:1.2}deg`} data-proximity-card onclick={()=>onselect(entry.id)}><span class="timeline-date">{entry.starredAt?new Date(entry.starredAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Saved'}</span><div class="repo-art"><RepoArtwork {entry} variant={i}/><span class="repo-language">{entry.language||entry.category}</span></div><span class="timeline-copy"><span class="eyebrow">{entry.owner} / {entry.language||'Repository'}</span><strong use:revealText>{entry.name}</strong><span>{entry.description}</span><span class="timeline-meta">★ {(entry.stars??0).toLocaleString()}<MorphIcon icon="arrow"/></span></span></button></div>
{/each}</div></div></div>
{#if limit<ordered.length}<button class="pill-button timeline-more" onclick={()=>limit+=60}>Show more · {ordered.length-limit} remaining<MorphIcon icon="plus"/></button>{/if}
