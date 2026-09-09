<script lang="ts">
  import { animate } from 'motion';
  import { onMount, untrack } from 'svelte';
  let { icon = 'menu', size = 24 }: { icon?: 'menu' | 'close' | 'arrow' | 'minus' | 'plus'; size?: number } = $props();
  // Fixed correspondence: three permanent slots, each with one cubic segment.
  const geometry = {
    menu: [[4,6,20,6,1],[4,12,20,12,1],[4,18,20,18,1]],
    close: [[5,5,19,19,1],[5,5,19,19,0],[5,19,19,5,1]],
    arrow: [[12,5,19,12,1],[4,12,19,12,1],[12,19,19,12,1]],
    plus: [[12,4,12,20,1],[4,12,20,12,1],[4,12,20,12,0]],
    minus: [[4,12,20,12,0],[4,12,20,12,1],[4,12,20,12,0]],
  };
  let slots = $state<number[][]>(geometry.menu.map(slot => [...slot]));
  let mounted = $state(false);
  onMount(() => { mounted = true; });
  function path(slot: number[]) {
    const [x,y,a,b] = slot;
    return `M${x},${y}C${x+(a-x)/3},${y+(b-y)/3} ${x+2*(a-x)/3},${y+2*(b-y)/3} ${a},${b}`;
  }
  $effect(() => {
    const target = geometry[icon];
    if (!mounted) return;
    const initial = untrack(() => slots.map(slot => [...slot]));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { slots = target.map(slot => [...slot]); return; }
    const animation = animate(0, 1, { duration: .24, ease: 'easeOut', onUpdate: progress => {
      slots = target.map((slot,i) => slot.map((value,j) => initial[i][j] + (value-initial[i][j])*progress));
    }});
    return () => animation.stop();
  });
</script>
<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  {#each slots as slot, i (i)}<path d={path(slot)} opacity={slot[4]} />{/each}
</svg>
