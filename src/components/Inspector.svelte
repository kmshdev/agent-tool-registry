<script lang="ts">
  import { publicShowcase } from '../lib/runtime';
  import { X, Star, Copy, Check, ArrowUpRight, Trash2 } from '@lucide/svelte';
  import { relative, type Entry } from '../lib/types';
  let { entry, related, onclose, onfavorite, onsave, onselect, onremove }: { entry: Entry; related: Entry[]; onclose: () => void; onfavorite: (entry: Entry) => void; onsave: (entry: Entry, notes: string) => Promise<void>; onselect: (id: string) => void; onremove: (entry: Entry) => void } = $props();
  let draft = $state('');
  let saved = $state(false);
  let copied = $state(false);
  let previousId = '';
  let curated = $derived(entry.id.startsWith('project:'));
  let editable = $derived(!publicShowcase && !curated);
  let source = $derived(({ cli: 'Local PATH', brew: 'Homebrew', apps: 'macOS', agents: 'Configuration', github: 'GitHub', custom: 'Manual' } as Record<string,string>)[entry.source] || entry.source);
  let properties = $derived([
    { label: 'Capability', value: entry.category },
    { label: entry.language ? 'Language' : entry.version ? 'Version' : 'Type', value: entry.language || entry.version || entry.kind },
    { label: entry.stars !== undefined ? 'Stars' : entry.model ? 'Model' : 'Status', value: entry.stars !== undefined ? entry.stars.toLocaleString() : entry.model || entry.status },
  ]);
  $effect(() => { if (entry.id !== previousId) { previousId = entry.id; draft = entry.notes ?? ''; saved = false; copied = false; } });
  async function copy() { try { await navigator.clipboard.writeText(entry.command || entry.path || entry.url || entry.name); copied = true; setTimeout(() => copied = false, 1800); } catch { copied = false; } }
</script>
<article class="resource-sheet" aria-label="Tool details">
  <div class="sheet-paper">
    <nav class="sheet-nav" aria-label="Resource actions"><span class="sheet-brand">KMSH.DEV</span><div>{#if entry.url}<a href={entry.url} target="_blank" rel="noreferrer">{source}<ArrowUpRight size={16}/></a>{/if}{#if entry.homepage}<a href={entry.homepage} target="_blank" rel="noreferrer">Website<ArrowUpRight size={16}/></a>{/if}<button aria-label="Close details" onclick={onclose}><X size={20}/></button></div></nav>
    <p class="sheet-breadcrumb">Collection <span>›</span> {entry.kind} <span>›</span> <span>{entry.category}</span></p>
    <h2>{entry.name}</h2>
    <p class="sheet-description">{entry.description || 'No description provided by this source.'}</p>
    <div class="sheet-summary">
      <section><h3><i></i>Purpose</h3><p>{entry.categoryBasis || `A ${entry.kind.toLowerCase()} in the ${entry.category.toLowerCase()} collection.`}</p></section>
      <section><h3><i></i>Provenance</h3><p>{entry.owner ? `${entry.owner} / ${source}` : source}</p><p>{entry.archived ? 'Archived repository' : entry.status}{entry.version ? ` · ${entry.version}` : ''}</p></section>
      <section><h3><i></i>Details</h3><p>{entry.tags.length ? entry.tags.slice(0, 5).join(' · ') : entry.kind}</p>{#if !publicShowcase && !curated}<p>Observed {relative(entry.observedAt)}</p>{/if}</section>
    </div>
  </div>
  <div class="sheet-orange"><div class="sheet-grid">
    <div class="sheet-drawing" aria-hidden="true"><svg viewBox="0 0 440 410" fill="none" stroke="currentColor" stroke-width=".8">
      <g opacity=".65"><path d="M60 292 217 209 379 287 222 374Z M60 292V185L217 102 379 180V287 M60 185 222 266 379 180 M222 266V374 M217 102V209 M74 302V193M365 295V188 M222 359 365 282 M74 287 222 361"/>
      {#each [0,1,2,3,4] as n}<path d={`M${82+n*26} ${174-n*14}v103l160 80M${81+n*26} ${287-n*14}l160 80`}/>{/each}
      <path d="M108 209 215 151 330 208 222 266Z M108 209v45l114 57 108-58v-45 M222 266v45 M135 228 217 185 297 224 215 269Z M135 228v20l80 40 82-45v-19 M215 269v19"/>
      <path d="M267 182V56 Q285 42 305 56V204 M267 56Q285 72 305 56 M267 76Q285 92 305 76 M267 117Q285 133 305 117 M267 158Q285 174 305 158 M267 182Q285 198 305 182 M267 204Q285 220 305 204 M267 204 255 212 283 227 318 208 305 202"/>
      <path d="M166 236v-37l67-36V125l8-4 7 4v49l-67 36v33 M166 199l15 11M233 163l15 11M233 125l8 5 7-5 M241 130v39l-67 36v35"/>
      {#each [0,1,2] as n}<ellipse cx={116+n*38} cy={298+n*19} rx="10" ry="16" transform={`rotate(-28 ${116+n*38} ${298+n*19})`}/>{/each}
      <path d="m55 325 158 79 178-99M55 321v8M213 400v8M391 301v8 M32 185v109M28 185h8M28 294h8" stroke-dasharray="3 4"/></g>
    </svg></div>
    <div class="sheet-specs">{#each properties as property,i}<div class="sheet-spec"><span>{String(i+1).padStart(2,'0')}</span><p><span>{property.label}</span><strong>{property.value}</strong></p></div>{/each}<div class="sheet-spec-spacer"></div><p class="sheet-strapline">A small part of a bigger toolkit.</p><h3>{curated ? 'Built to make room for the next idea.' : entry.kind === 'Repository' ? 'Open the repository. Explore what’s possible.' : 'Good tools start with a closer look.'}</h3><div class="sheet-footer"><span>{entry.owner || source}</span><span>{entry.updatedAt ? new Date(entry.updatedAt).getFullYear() : entry.kind}</span></div></div>
  </div></div>
  {#if editable || entry.command || entry.path || related.length}<div class="sheet-extras">
    {#if entry.command || entry.path}<section><div class="sheet-action-heading"><h3>{entry.command ? 'Invocation' : 'Location'}</h3><button onclick={copy} aria-label="Copy invocation or path">{#if copied}<Check size={18}/>{:else}<Copy size={18}/>{/if}</button></div><code>{entry.command || entry.path}</code>{#if entry.command && entry.path}<p>{entry.path}</p>{/if}</section>{/if}
    <section><h3>Evidence</h3><p>{entry.evidence}</p></section>
    {#if editable}<section><div class="sheet-action-heading"><h3><label for="record-notes">Your notes</label></h3><button onclick={() => onfavorite(entry)} aria-label={entry.favorite ? 'Remove favorite' : 'Add favorite'}><Star size={18} fill={entry.favorite ? 'currentColor' : 'none'}/></button></div><textarea id="record-notes" placeholder="Add a note…" rows="3" maxlength="8000" bind:value={draft} oninput={() => saved = false}></textarea><button class="sheet-save" disabled={draft === (entry.notes ?? '')} onclick={async () => { await onsave(entry, draft); saved = true; }}>{saved ? 'Saved' : 'Save note'}</button></section>{/if}
    {#if related.length}<section><h3>Same capability</h3>{#each related as item}<button class="sheet-related" onclick={() => onselect(item.id)}>{item.name}<ArrowUpRight size={18}/></button>{/each}</section>{/if}
    {#if entry.source === 'custom'}<button onclick={() => onremove(entry)}><Trash2 size={18}/>Remove record</button>{/if}
  </div>{/if}
</article>
