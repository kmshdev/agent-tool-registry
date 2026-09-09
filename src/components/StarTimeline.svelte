<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Entry } from '../lib/types';
  import MorphIcon from './primitives/MorphIcon.svelte';
  import {cursorProximity} from '../lib/text-motion';
  let {entries,onselect}:{entries:Entry[];onselect:(id:string)=>void}=$props();
  let limit=$state(60);
  let track=$state<HTMLDivElement>(null!);
  let scene=$state<HTMLDivElement>(null!);
  let sceneHeight=$state(900);
  let projected=0;
  onMount(()=>{
    let frame=0;
    const project=()=>{frame=0;const distance=Math.max(0,track.scrollWidth-track.clientWidth);const height=track.parentElement!.clientHeight;sceneHeight=distance+height;projected=Math.max(0,Math.min(distance,-scene.getBoundingClientRect().top));track.scrollLeft=projected;};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(project);};
    const horizontal=()=>{const box=scene.getBoundingClientRect();if(box.top<=0&&box.bottom>=track.parentElement!.clientHeight&&Math.abs(track.scrollLeft-projected)>2)window.scrollTo({top:window.scrollY+box.top+track.scrollLeft});};
    const observer=new ResizeObserver(schedule);observer.observe(track);if(track.firstElementChild)observer.observe(track.firstElementChild);
    track.addEventListener('scroll',horizontal,{passive:true});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);schedule();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();track.removeEventListener('scroll',horizontal);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
  });
  async function jump(year:string){limit=ordered.length;await tick();sceneHeight=Math.max(0,track.scrollWidth-track.clientWidth)+track.parentElement!.clientHeight;await tick();const target=track.querySelector<HTMLElement>(`[data-year="${year}"]`);if(target)window.scrollTo({top:window.scrollY+scene.getBoundingClientRect().top+target.offsetLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  $effect(()=>{void limit;void entries.length;void tick().then(()=>{if(track?.isConnected)sceneHeight=Math.max(0,track.scrollWidth-track.clientWidth)+track.parentElement!.clientHeight;});});
  let ordered=$derived([...entries].sort((a,b)=>(b.starredAt??'').localeCompare(a.starredAt??'')));
  let years=$derived([...new Set(ordered.map(e=>e.starredAt?.slice(0,4)||'Undated'))]);
</script>
<div class="timeline-navigation" aria-label="Jump to year"><span> / Starred collection</span>{#each years as year}<button onclick={()=>jump(year)}>{year}</button>{/each}<span class="scroll-label">Scroll to explore →</span></div>
<div class="timeline-scroll-scene" bind:this={scene} style:height={`${sceneHeight}px`}><div class="timeline-sticky">
<!-- svelte-ignore a11y_no_noninteractive_tabindex (The overflow region needs focus for native arrow-key scrolling.) -->
<div class="star-timeline" bind:this={track} role="region" aria-label="Starred repository timeline" tabindex="0">{#each ordered.slice(0,limit) as entry,i (entry.id)}
  <div data-year={i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4) ? entry.starredAt?.slice(0,4)||'Undated' : undefined} class="timeline-slot" class:alternate={i%2===1}>{#if i===0 || entry.starredAt?.slice(0,4)!==ordered[i-1].starredAt?.slice(0,4)}<h2 class="timeline-year" id={`year-${entry.starredAt?.slice(0,4)||'Undated'}`}>{entry.starredAt?.slice(0,4)||'Undated'}</h2>{/if}
  <button class="timeline-card" data-proximity-card onclick={()=>onselect(entry.id)}><span class="timeline-date">{entry.starredAt?new Date(entry.starredAt).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'Saved'}</span><div class="repo-art" style:--hue={`${i*47%360}`}><span>{entry.name.slice(0,2)}</span><span class="repo-art-grid"></span></div><span class="timeline-copy"><span class="eyebrow">{entry.owner} / {entry.language||'Repository'}</span><strong use:cursorProximity>{entry.name}</strong><span>{entry.description}</span><span class="timeline-meta">★ {(entry.stars??0).toLocaleString()}<MorphIcon icon="arrow"/></span></span></button></div>
{/each}</div></div></div>
{#if limit<ordered.length}<button class="pill-button timeline-more" onclick={()=>limit+=60}>Show more · {ordered.length-limit} remaining<MorphIcon icon="plus"/></button>{/if}
