<script lang="ts">
  // Svelte adaptation of Rare UI Animated Counter's digit wheel and fade mask.
  // Copyright Swami Malode, MIT. See THIRD_PARTY_NOTICES.md.
  let { value }: { value: number } = $props();
  const wheel = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  let formatted = $derived(value.toLocaleString('en-US'));
</script>
<span class="counter" role="img" aria-label={formatted}>
  {#each [...formatted] as char, index (formatted.length - index)}
    {#if /\d/.test(char)}
      <span class="digit" aria-hidden="true"><span class="wheel" style:transform={`translateY(-${Number(char) * 1.5}em)`}>{#each wheel as face}<span>{face}</span>{/each}</span></span>
    {:else}<span aria-hidden="true">{char}</span>{/if}
  {/each}
</span>
<style>
  .counter{display:inline-flex;font-variant-numeric:tabular-nums;line-height:1.5}
  .digit{position:relative;width:.63em;height:1.5em;overflow:hidden;mask-image:linear-gradient(transparent,#000 22%,#000 78%,transparent)}
  .wheel{position:absolute;inset:0 0 auto;transition:transform .6s cubic-bezier(.22,1,.36,1)}
  .wheel span{display:flex;align-items:center;justify-content:center;height:1.5em}
  @media(prefers-reduced-motion:reduce){.wheel{transition:none}}
</style>
