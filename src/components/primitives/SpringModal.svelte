<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { animate } from 'motion';
  import { createDialKit, DialRoot } from 'dialkit/svelte';
  import MorphIcon from './MorphIcon.svelte';
  let { title, onclose, children, tuning = false, wide = false, resource = false }: { title: string; onclose: () => void; children: Snippet; tuning?: boolean; wide?: boolean; resource?: boolean } = $props();
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
<dialog bind:this={dialog} class="spring-dialog" class:resource aria-label={title} oncancel={(event)=>{ event.preventDefault(); onclose(); }} onclick={(event)=>{ if(event.target===dialog) onclose(); }} style={`--overlay-opacity:${values.overlayOpacity}`}>
  <div bind:this={panel} class="spring-panel" class:wide class:resource style:border-radius={`${values.borderRadius}px`}>
    {#if !resource}<header><h2>{wide?'Resource details':title}</h2><button type="button" class="icon-button" aria-label={`Close ${title}`} onclick={onclose}><MorphIcon icon="close"/></button></header>{/if}
    {@render children()}
    {#if tuning}<details class="modal-tuning"><summary>Motion controls</summary><DialRoot mode="inline" theme="dark" productionEnabled defaultOpen /></details>{/if}
  </div>
</dialog>
<style>
  .spring-dialog{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:24px;border:0;background:transparent;overflow:auto;color:inherit}
  .spring-dialog[open]{display:grid;place-items:center}
  .spring-dialog::backdrop{background:rgb(18 22 31 / var(--overlay-opacity))}
  .spring-panel{width:min(100%,640px);background:var(--surface,#fff);padding:28px;border:1px solid var(--line);box-shadow:0 24px 100px #0005}
  .spring-panel.wide{width:min(100%,1180px)}
  header{position:sticky;top:-28px;z-index:2;background:var(--surface);padding:12px 0;display:flex;align-items:center;justify-content:space-between;gap:24px;margin-bottom:24px}
  h2{margin:0;font-size:var(--type-18);line-height:1.25}
  .modal-tuning{margin-top:24px;border-top:1px solid var(--line);padding-top:16px}
  summary{cursor:pointer;font:var(--type-12) var(--mono);color:var(--muted);padding-bottom:12px}
  .spring-dialog.resource::backdrop{background:rgb(222 202 176 / .8);backdrop-filter:blur(8px)}
  .spring-panel.resource{width:min(100%,1180px);padding:0;border:0;background:var(--paper-surface);color:var(--paper-ink);box-shadow:0 38px 36px -18px rgb(44 35 20 / .32),0 14px 54px rgb(44 35 20 / .12);overflow:clip;color-scheme:light}
  @media(max-width:600px){.spring-dialog{padding:12px}.spring-panel{padding:20px}}
</style>
