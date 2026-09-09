<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { animate } from 'motion';
  import { createDialKit, DialRoot } from 'dialkit/svelte';
  import MorphIcon from './MorphIcon.svelte';
  let { title, onclose, children, tuning = false, wide = false }: { title: string; onclose: () => void; children: Snippet; tuning?: boolean; wide?: boolean } = $props();
  let dialog = $state<HTMLDialogElement>(null!);
  let panel = $state<HTMLDivElement>(null!);
  let replay = $state(0);
  const values = createDialKit('Modal entrance', {
    entrance: { visualDuration: [.4,.1,1.2,.05], bounce: [.18,0,.65,.01] },
    overlayOpacity: [.32,0,.8,.01],
    borderRadius: [12,0,40,1],
    replay: { type: 'action' },
  }, { onAction: action => { if (action === 'replay') replay++; } });
  let ready = $state(false);
  onMount(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow; document.body.style.overflow='hidden';
    dialog.showModal(); ready = true;
    return () => { dialog.close(); document.body.style.overflow=overflow; previous?.focus(); };
  });
  $effect(() => {
    void replay;
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = animate(panel, { opacity: [0,1], y: [28,0], scale: [.96,1] }, reduced ? { duration: 0 } : { type: 'spring', visualDuration: values.entrance.visualDuration, bounce: values.entrance.bounce });
    return () => animation.stop();
  });
</script>
<dialog bind:this={dialog} class="spring-dialog" aria-label={title} oncancel={(event)=>{ event.preventDefault(); onclose(); }} onclick={(event)=>{ if(event.target===dialog) onclose(); }} style={`--overlay-opacity:${values.overlayOpacity}`}>
  <div bind:this={panel} class="spring-panel" class:wide style:border-radius={`${values.borderRadius}px`}>
    <header><h2>{title}</h2><button type="button" class="icon-button" aria-label={`Close ${title}`} onclick={onclose}><MorphIcon icon="close"/></button></header>
    {@render children()}
    {#if tuning}<div class="modal-tuning"><DialRoot mode="inline" theme="dark" productionEnabled defaultOpen /></div>{/if}
  </div>
</dialog>
<style>
  .spring-dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:24px;border:0;background:transparent;overflow:auto;color:inherit}
  .spring-dialog[open]{display:grid;place-items:center}
  .spring-dialog::backdrop{background:rgb(18 22 31 / var(--overlay-opacity))}
  .spring-panel{width:min(100%,640px);background:var(--surface,#fff);padding:28px;box-shadow:0 24px 100px #171b2326}
  .spring-panel.wide{width:min(100%,1180px)}
  header{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:24px}
  h2{margin:0;font-size:24px;line-height:1.25}
  .modal-tuning{margin-top:24px;border-top:1px solid #dedee3;padding-top:16px}
  @media(max-width:600px){.spring-dialog{padding:12px}.spring-panel{padding:20px}}
</style>
