<script lang="ts">
  import { onMount } from 'svelte';
  let root=$state<HTMLDivElement>(null!);
  let visible=$state(false);
  onMount(()=>{const observer=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);observer.observe(root);return()=>observer.disconnect();});
  let {variant=0, compact=false, caption=true}:{variant?:number;compact?:boolean;caption?:boolean}=$props();
  const patterns=['orbit','maze','rings','maze'];
</script>
<div class="pattern-study study-{variant%4}" class:compact class:in-view={visible} bind:this={root} aria-hidden="true">
  <div class="study-surface" style:--study-mask={`url('/patterns/snapattern-${patterns[variant%4]}.svg')`}></div>
  {#if visible}<svg viewBox="0 0 400 300" fill="none" class="study-sculpture">
    {#each Array.from({length:24}) as _,i}
      {#if variant%4===0}<ellipse cx={82+i*10} cy="150" rx={20+Math.sin(i/23*Math.PI)*49} ry={24+Math.sin(i/23*Math.PI)*95} style:--i={i}/>
      {:else if variant%4===1}<rect x={100+i*2.6} y={50+i*2.6} width={200-i*5.2} height={200-i*5.2} rx="24" transform={`rotate(${i*4} 200 150)`} style:--i={i}/>
      {:else if variant%4===2}<ellipse cx="200" cy="150" rx={125-i*3} ry={100-i*2} transform={`rotate(${i*8} 200 150)`} style:--i={i}/>
      {:else}<ellipse cx="200" cy={80+i*6} rx={30+Math.sin(i/23*Math.PI)*100} ry="38" style:--i={i}/>{/if}
    {/each}
  </svg>{/if}
  {#if caption}<span class="study-coordinate">{['01 / ORBITAL','02 / SIGNAL','03 / RESONANCE','04 / STACK'][variant%4]}</span>{/if}
</div>
<style>
.pattern-study{--ink:#94bef5;--ground:#092740;position:relative;width:100%;height:100%;overflow:hidden;background:var(--ground);color:var(--ink)}
.study-1{--ink:#8fe3bc;--ground:#07332f}.study-2{--ink:#f6c278;--ground:#362b20}.study-3{--ink:#d5b2f1;--ground:#292440}
.study-surface{position:absolute;inset:-25%;background:var(--ink);mask-image:var(--study-mask);mask-size:cover;opacity:.1}
.study-sculpture{position:absolute;inset:8%;width:84%;height:84%;stroke:currentColor;stroke-width:.7;overflow:visible}
.study-coordinate{position:absolute;bottom:12px;left:14px;font:9px var(--mono);opacity:1}
@media(prefers-reduced-motion:no-preference){
.study-surface{animation:drift 26s ease-in-out infinite alternate;animation-play-state:paused}
.study-sculpture{animation:sculpt 12s ease-in-out infinite alternate;animation-play-state:paused}
.study-sculpture>*{transform-box:fill-box;transform-origin:center;animation:breathe 7s ease-in-out infinite alternate;animation-delay:calc(var(--i)*-180ms);animation-play-state:paused}
:global(.in-view)>.study-surface,:global(.in-view)>.study-sculpture,:global(.in-view)>.study-sculpture>*{animation-play-state:running}
.study-1 .study-sculpture{animation-name:turn}.study-2 .study-sculpture{animation-name:turn;animation-direction:alternate-reverse}.study-3 .study-sculpture{animation-duration:17s}
@keyframes drift{to{transform:translate3d(8%,5%,0) rotate(18deg)}}
@keyframes sculpt{from{transform:rotate(-12deg) scale(.88)}to{transform:rotate(12deg) scale(1.06)}}
@keyframes turn{from{transform:rotate(-25deg) scale(.85)}to{transform:rotate(35deg) scale(1.05)}}
@keyframes breathe{to{opacity:.45;scale:1 .75}}
}
.compact .study-coordinate{display:none}.compact .study-surface{opacity:.17}
</style>
