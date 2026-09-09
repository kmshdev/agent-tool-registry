<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { ArrowUpRight, Star, GitFork, X, FolderGit2 } from '@lucide/svelte';
  import { relative, type Entry } from '../lib/types';
  let { entries, onselect }: { entries: Entry[]; onselect: (id: string) => void } = $props();
  let entry = $state<Entry>();
  let left = $state(0), top = $state(0);
  let card = $state<HTMLDivElement>();
  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    if (entry && card) void tick().then(() => { if (card) top = Math.max(12, Math.min(top, window.innerHeight - card.offsetHeight - 12)); });
  });
  const close = () => { clearTimeout(timer); entry = undefined; };
  onMount(() => {
    let suppressHover=false;
    const dismiss=()=>{suppressHover=true;close();};
    const leave=(event:PointerEvent)=>{ const trigger=(event.target as Element).closest?.('[data-repo-id]'); if(trigger && !(event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) suppressHover=false; };
    const show = (event: Event) => {
      if(event.type==='pointerover' && suppressHover)return;
      if(event.type==='focusin')suppressHover=false;
      const target = event.target as Element;
      if (card?.contains(target)) { clearTimeout(timer); return; }
      const trigger = target.closest<HTMLElement>('[data-repo-id]');
      if (!trigger) { clearTimeout(timer); timer = setTimeout(close, 180); return; }
      clearTimeout(timer);
      const found = entries.find(item => item.id === trigger.dataset.repoId);
      if (!found) return;
      const rect = trigger.getBoundingClientRect();
      left = Math.max(12, Math.min(rect.left + 35, window.innerWidth - 372));
      top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - 352));
      entry = found;
    };
    const scroll = () => {
      if (!entry) return;
      const focused = document.activeElement?.closest<HTMLElement>('[data-repo-id]');
      if (focused) { const rect = focused.getBoundingClientRect(); if (rect.bottom > 0 && rect.top < window.innerHeight) { show({ target: focused } as unknown as Event); return; } }
      close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    document.addEventListener('pointerover', show);
    document.addEventListener('focusin', show);
    document.addEventListener('keydown', escape);
    document.addEventListener('click', dismiss);
    document.addEventListener('pointerout',leave);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', scroll, true);
    return () => { close(); document.removeEventListener('pointerover', show); document.removeEventListener('focusin', show); document.removeEventListener('keydown', escape); document.removeEventListener('click', dismiss); document.removeEventListener('pointerout',leave); window.removeEventListener('resize', close); window.removeEventListener('scroll', scroll, true); };
  });
</script>
{#if entry}
  <div bind:this={card} class="repo-preview" style:left={`${left}px`} style:top={`${top}px`} role="region" aria-label={`Repository preview: ${entry.name}`}>
    <div class="preview-top"><span><GitFork size={14} />Repository preview</span><button aria-label="Close repository preview" onclick={close}><X size={15} /></button></div>
    <div class="preview-content"><div class="preview-folder"><FolderGit2 size={29} strokeWidth={1.5} /></div><small>{entry.owner}</small><h2>{entry.name}</h2><p>{entry.description || 'No description provided.'}</p><div class="preview-tags">{#each entry.tags.slice(0,3) as tag}<span>{tag}</span>{/each}</div><div class="preview-meta"><span><Star size={13} />{(entry.stars ?? 0).toLocaleString()}</span><span><i></i>{entry.language || 'Repository'}</span><span>{entry.archived ? 'Archived' : `Updated ${relative(entry.updatedAt)}`}</span></div></div>
    <div class="preview-footer"><button onclick={() => { if (entry) onselect(entry.id); close(); }}>View details<ArrowUpRight size={14} /></button>{#if entry.url}<a href={entry.url} target="_blank" rel="noreferrer">Open GitHub<ArrowUpRight size={14} /></a>{/if}</div>
  </div>
{/if}
<style>
.repo-preview{position:fixed;z-index:100;width:360px;max-width:calc(100vw - 24px);background:linear-gradient(150deg,#353631,#22231f);color:#efefe8;border:1px solid #ffffff30;border-radius:24px;box-shadow:0 0 0 1px #151610,0 22px 65px #171a1855,inset 0 1px 1px #ffffff12;font-family:Arial,sans-serif;overflow:hidden}
.preview-top{height:48px;margin:0 16px;border-bottom:1px solid #ffffff15;display:flex;align-items:center;justify-content:space-between;color:#a5a79d;font-size:11px}.preview-top span{display:flex;gap:8px;align-items:center}.repo-preview button{cursor:pointer}.preview-top button{display:grid;place-items:center;width:32px;height:32px;border:1px solid #ffffff10;background:#ffffff09;color:#ccc;border-radius:50%}.preview-content{padding:17px 22px}.preview-folder{float:right;width:47px;height:43px;background:linear-gradient(#93bafe,#4a83e5);border-radius:10px;color:#eaf2ff;box-shadow:inset 0 1px 2px #fff9,0 5px 12px #0004;display:grid;place-items:center}.preview-content small{font-size:11px;color:#999c91}.preview-content h2{font-size:22px;line-height:1.25;text-wrap:balance;font-weight:500;color:#f2f2ec;margin:5px 55px 12px 0;overflow-wrap:anywhere}.preview-content p{font-size:13px;line-height:1.6;color:#c1c3b9;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.preview-tags{display:flex;gap:5px;overflow:hidden}.preview-tags span{border-radius:12px;padding:4px 8px;background:#ffffff0a;color:#b7d8ad;font-size:10px;white-space:nowrap}.preview-meta{display:flex;align-items:center;flex-wrap:wrap;gap:9px 13px;margin-top:17px;font-size:10px;color:#a5a89d}.preview-meta span{display:flex;align-items:center;gap:5px}.preview-meta i{width:6px;height:6px;border-radius:50%;background:#84bcf8}.preview-footer{border-top:1px solid #ffffff15;padding:12px 16px;display:flex;justify-content:space-between;gap:10px}.preview-footer button,.preview-footer a{display:flex;align-items:center;justify-content:center;gap:8px;font-size:11px;border-radius:20px;padding:9px 13px;color:#dedfd6;background:linear-gradient(#494b44,#363831);border:1px solid #ffffff20;text-decoration:none;box-shadow:inset 0 1px 1px #ffffff10}.preview-footer a{background:#e9ebe3;color:#262922}.repo-preview :focus-visible{outline:2px solid #9acaff;outline-offset:2px}
</style>
