<script lang="ts">
  import { publicShowcase } from '../lib/runtime';
  import { X, Star, Copy, Check, ArrowUpRight, Trash2 } from '@lucide/svelte';
  import ToolIcon from './ToolIcon.svelte';
  import PatternStudy from './PatternStudy.svelte';
  import { color, relative, type Entry } from '../lib/types';
  let { entry, related, onclose, onfavorite, onsave, onselect, onremove }: { entry: Entry; related: Entry[]; onclose: () => void; onfavorite: (entry: Entry) => void; onsave: (entry: Entry, notes: string) => Promise<void>; onselect: (id: string) => void; onremove: (entry: Entry) => void } = $props();
  let draft = $state('');
  let saved = $state(false);
  let copied = $state(false);
  let previousId = '';
  $effect(() => { if (entry.id !== previousId) { previousId = entry.id; draft = entry.notes ?? ''; saved = false; } });
  async function copy() { try { await navigator.clipboard.writeText(entry.command || entry.path || entry.url || entry.name); copied = true; setTimeout(() => copied = false, 1800); } catch { copied = false; } }
</script>
<aside class="inspector" aria-label="Tool details">
  <div class="inspector-top"><span>RECORD DETAILS</span><button class="icon-button" aria-label="Close details" title="Close details" onclick={onclose}><X size={15} /></button></div>
  {#if entry.source==='github'}<div class="repo-detail-art" aria-hidden="true"><PatternStudy variant={entry.name.length%4}/></div>{/if}
  <div class="detail-heading"><span class="detail-symbol" style:color={color(entry.category)} style:background={`color-mix(in srgb, ${color(entry.category)} 12%, transparent)`}><ToolIcon kind={entry.kind} size={26} /></span>{#if !publicShowcase}<button class:starred={entry.favorite} class="icon-button favorite-large" aria-label={entry.favorite ? 'Remove favorite' : 'Add favorite'} title={entry.favorite ? 'Remove favorite' : 'Add favorite'} onclick={() => onfavorite(entry)}><Star size={17} fill={entry.favorite ? 'currentColor' : 'none'} /></button>{/if}</div>
  <h2>{entry.name}</h2>
  {#if entry.owner}<span class="owner">{entry.owner} / {entry.name}</span>{/if}
  <div class="detail-badges"><span class:installed={entry.status === 'Installed'} class="status"><i></i>{entry.status}</span><span class="kind-text">{entry.kind}</span>{#if entry.archived}<span class="archived">Archived</span>{/if}</div>
  <p class="detail-description">{entry.description || 'No description provided by this source.'}</p>
  {#if entry.url}<a class="open-source" href={entry.url} target="_blank" rel="noreferrer">Open source <ArrowUpRight size={14} /></a>{/if}
  {#if entry.homepage}<a class="open-source" href={entry.homepage} target="_blank" rel="noreferrer">Visit website <ArrowUpRight size={14}/></a>{/if}
  <section class="detail-section"><h3>Properties</h3><dl><div><dt>Capability</dt><dd><i class="category-dot" style:background={color(entry.category)}></i>{entry.category}</dd></div><div><dt>Source</dt><dd>{({ cli: 'Local PATH', brew: 'Homebrew', apps: 'macOS', agents: 'Configuration', github: 'GitHub', custom: 'Manual' })[entry.source]}</dd></div>{#if entry.version}<div><dt>Version</dt><dd class="mono">{entry.version}</dd></div>{/if}{#if entry.language}<div><dt>Language</dt><dd>{entry.language}</dd></div>{/if}{#if entry.stars !== undefined}<div><dt>Stars</dt><dd>{entry.stars.toLocaleString()}</dd></div>{/if}{#if entry.model}<div><dt>Model</dt><dd>{entry.model}</dd></div>{/if}{#if !publicShowcase}<div><dt>Observed</dt><dd title={entry.observedAt}>{relative(entry.observedAt)}</dd></div>{/if}</dl></section>
  {#if entry.command || entry.path}<section class="detail-section"><div class="section-heading"><h3>{entry.command ? 'Invocation' : 'Location'}</h3><button class="icon-button" title="Copy invocation or path" aria-label="Copy invocation or path" onclick={copy}>{#if copied}<Check size={14} />{:else}<Copy size={14} />{/if}</button></div><code class="command-block">{entry.command || entry.path}</code>{#if entry.command && entry.path}<p class="path-text">{entry.path}</p>{/if}</section>{/if}
  {#if entry.tags.length}<section class="detail-section"><h3>Tags</h3><div class="tags">{#each entry.tags.slice(0, 12) as tag}<span>{tag}</span>{/each}</div></section>{/if}
  <section class="detail-section"><h3>Evidence</h3><p class="evidence">{entry.evidence}</p><p class="classification">{entry.categoryBasis}</p></section>
  {#if !publicShowcase}  <section class="detail-section"><div class="section-heading"><h3><label for="record-notes">Your notes</label></h3>{#if saved}<span class="saved">Saved</span>{/if}</div><textarea id="record-notes" placeholder="Add a note…" rows="3" maxlength="8000" bind:value={draft} oninput={() => saved = false}></textarea><button class="text-button save-note" disabled={draft === (entry.notes ?? '')} onclick={async () => { await onsave(entry, draft); saved = true; }}>Save note</button></section>{/if}
  {#if related.length}<section class="detail-section"><h3>Same capability</h3>{#each related as item}<button class="related-row" onclick={() => onselect(item.id)}><span style:color={color(item.category)}><ToolIcon kind={item.kind} size={14} /></span><span>{item.name}<small>{item.kind}</small></span><ArrowUpRight size={12} /></button>{/each}</section>{/if}
  {#if entry.source === 'custom'}<button class="danger-button" onclick={() => onremove(entry)}><Trash2 size={14} />Remove record</button>{/if}
</aside>
