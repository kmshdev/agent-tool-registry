<script lang="ts">
  import { onMount } from 'svelte';
  let { text = 'Welcome back, builder.' }: { text?: string } = $props();
  let typed = $state('');
  onMount(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { typed = text; return; }
    const letters = Array.from(text);
    let index = 0;
    const timer = window.setInterval(() => {
      typed = letters.slice(0, ++index).join('');
      if (index >= letters.length) window.clearInterval(timer);
    }, 42);
    return () => window.clearInterval(timer);
  });
</script>
<span class="welcome" aria-label={text}><span aria-hidden="true">{typed}<span class:done={typed===text} class="cursor">▍</span></span></span>
<style>
  .welcome{display:block;min-height:1.5em}.cursor{animation:blink .8s steps(1) 4}.done{opacity:0}
  @keyframes blink{50%{opacity:0}}
  @media(prefers-reduced-motion:reduce){.cursor{display:none}}
</style>
