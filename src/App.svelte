<script lang="ts">
  import { onMount, tick } from 'svelte';
  import SpringModal from './components/primitives/SpringModal.svelte';
  import { initializeSound, toggleSound, cue } from './lib/sound';
  let soundEnabled = $state(true);
  let consoleOpen = $state(false);
  import { Toaster, toast } from 'svelte-sonner';
  import WorkIcon from './components/WorkIcon.svelte';
  import FolderIcon from './components/FolderIcon.svelte';
  import Badge from './components/Badge.svelte';
  import { parseRoute, routeHash } from './lib/routes';
  import { Layers, Search, Plus, RefreshCw, Download, Activity, Star, Terminal, GitFork as Github, AppWindow, Bot, Blocks, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight, Menu, X, Check, Cable, FolderHeart, Filter, ArrowDownUp, AlertCircle } from '@lucide/svelte';
  import EditorialHome from './components/EditorialHome.svelte';
  import StarTimeline from './components/StarTimeline.svelte';
  import RepoPreview from './components/RepoPreview.svelte';
  import ToolIcon from './components/ToolIcon.svelte';
  import Inspector from './components/Inspector.svelte';
  import { color, relative, type Entry, type Snapshot } from './lib/types';

  let data = $state<Snapshot>({ revision: -1, entries: [], sources: [], categories: [], activity: [] });
  let loading = $state(true);
  let connected = $state(false);
  let error = $state('');
  let query = $state('');
  let section = $state('all');
  let category = $state('all');
  let status = $state('all');
  let view = $state<'overview' | 'map' | 'list' | 'activity'>('overview');
  let selectedId = $state('');
  let page = $state(0);
  let sort = $state('relevance');
  let minimumStars = $state(0);
  let mobileNav = $state(false);
  let drawerWasOpen = false;
  $effect(() => {
    if (mobileNav) {
      drawerWasOpen = true;
      void tick().then(() => document.querySelector<HTMLButtonElement>('.sidebar nav button.active, .sidebar nav button')?.focus());
    } else if (drawerWasOpen) {
      drawerWasOpen = false;
      void tick().then(() => document.querySelector<HTMLButtonElement>('.mobile-menu')?.focus());
    }
  });
  function tabKeydown(event: KeyboardEvent) {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    const buttons=Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const index=buttons.indexOf(event.target as HTMLButtonElement);
    if(index<0)return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
    buttons[next].click();buttons[next].focus();
  }
  function globalKeydown(event: KeyboardEvent) {
    if(event.key==='Escape'){consoleOpen=false;showAdd=false;mobileNav=false;sourcesOpen=false;return;}
    if (!event.ctrlKey && !event.metaKey && !event.altKey && !mobileNav && !document.querySelector('dialog[open]') && !(event.target as HTMLElement).closest('input,textarea,select,[contenteditable="true"]')) {
      const shortcuts:Record<string,typeof view>={o:'overview',i:'list',m:'map',a:'activity'};
      const next=shortcuts[event.key.toLowerCase()];
      if(next){event.preventDefault();if(next==='overview')navigate('all');view=next;sourcesOpen=false;selectedId='';consoleOpen=false;window.scrollTo({top:0});}
      if(event.key.toLowerCase()==='c'){event.preventDefault();consoleOpen=!consoleOpen;}
    }
    if(event.key!=='Tab'||!mobileNav)return;
    const controls=Array.from(document.querySelectorAll<HTMLElement>('.sidebar a[href], .sidebar button:not(:disabled)')).filter(el=>el.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
  let showAdd = $state(false);
  let addName = $state('');
  let addDescription = $state('');
  let addUrl = $state('');
  let addCategory = $state('Development');
  let adding = $state(false);
  let routeReady = $state(false);
  let routeRevision = $state(0);

  let sourcesOpen = $state(false);
  function routeMotion(node: HTMLElement, _key: string) {
    let animation: Animation | undefined;
    return { update() { animation?.cancel(); if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) animation=node.animate([{opacity:.6,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'}); }, destroy(){animation?.cancel();} };
  }
  const navigation = [
    { id: 'all', label: 'All resources', icon: Layers },
    { id: 'cli', label: 'Command line', icon: Terminal },
    { id: 'brew', label: 'Toolchains', icon: Blocks },
    { id: 'agents', label: 'Agents & skills', icon: Bot },
    { id: 'apps', label: 'Mac applications', icon: AppWindow },
    { id: 'github', label: 'GitHub stars', icon: Github },
  ];
  let sectionTitle = $derived(navigation.find(item=>item.id===section)?.label ?? (section==='favorites'?'Favorites':'Saved resources'));
  const spotlight = ['rg', 'vp', 'uv', 'cargo', 'gh', 'codex', 'firecrawl', 'steel', 'playwright-cli', 'reviewer', 'svelte-file-editor'];
  let filtered = $derived.by(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const entries = data.entries.filter(entry => (section === 'all' || (section === 'favorites' ? entry.favorite : section === 'custom' ? entry.source === 'custom' : entry.source === section)) && (category === 'all' || entry.category === category) && (status === 'all' || entry.status === status) && (minimumStars === 0 || (entry.stars ?? 0) >= minimumStars) && terms.every(term => `${entry.name} ${entry.owner ?? ''} ${entry.description} ${entry.tags.join(' ')} ${entry.kind} ${entry.category}`.toLowerCase().includes(term)));
    return entries.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'stars') return (b.stars ?? 0) - (a.stars ?? 0) || a.name.localeCompare(b.name);
      if (sort === 'recent') return (b.updatedAt ?? b.observedAt ?? '').localeCompare(a.updatedAt ?? a.observedAt ?? '');
      return Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || (spotlight.indexOf(a.name) + 1 || 999) - (spotlight.indexOf(b.name) + 1 || 999) || Number(a.source === 'github') - Number(b.source === 'github') || a.name.localeCompare(b.name);
    });
  });
  let selected = $derived(data.entries.find(entry => entry.id === selectedId));
  let related = $derived(selected ? data.entries.filter(entry => entry.category === selected.category && entry.id !== selected.id && entry.source !== 'github').slice(0, 3) : []);
  let pages = $derived(Math.max(1, Math.ceil(filtered.length / 40)));
  let visible = $derived(filtered.slice(page * 40, (page + 1) * 40));
  let refreshing = $derived(data.sources.some(source => source.status === 'refreshing'));
  let favorites = $derived(data.entries.filter(entry => entry.favorite).length);
  let localCount = $derived(data.entries.filter(entry => entry.status === 'Installed').length);
  let sourceErrors = $derived(data.sources.filter(source => source.status === 'error'));
  let count = (id: string) => id === 'all' ? data.entries.length : data.entries.filter(entry => entry.source === id).length;
  $effect(() => { void [query, section, category, status, sort, minimumStars]; page = 0; });
  $effect(() => { if (page >= pages) page = pages - 1; });
  function notify(message: string) { if (/could not|failed|error/i.test(message)) toast.error(message); else toast.success(message); }
  function applyRoute() { const route = parseRoute(window.location.hash); view=route.view; section=route.section; selectedId=route.selectedId; sourcesOpen=route.sourcesOpen; query=''; category='all'; status='all'; minimumStars=0; mobileNav=false; }
  $effect(()=> { const hash=routeHash({view,section,selectedId,sourcesOpen}); if(routeReady && window.location.hash!==hash) { window.history.pushState(null,'',hash); routeRevision++; } });
  async function request(url: string, method = 'GET', body?: unknown) {
    const response = await fetch(url, { method, ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  }
  let loadingSnapshot: Promise<void> | null = null;
  let loadAgain = false;
  let announcedRevision = -1;
  async function load() {
    if (loadingSnapshot) { loadAgain = true; return loadingSnapshot; }
    loadingSnapshot = (async () => {
      try { const snapshot = await request('/api/registry') as Snapshot; if (snapshot.revision >= data.revision) data = snapshot; error = ''; }
      catch (cause) { error = cause instanceof Error ? cause.message : 'Registry unavailable'; }
      finally { loading = false; loadingSnapshot = null; if (!error && (loadAgain || announcedRevision > data.revision)) { loadAgain = false; void load(); } }
    })();
    return loadingSnapshot;
  }
  onMount(() => {
    soundEnabled = initializeSound();
    applyRoute();
    if (!window.location.hash) window.history.replaceState(null,'',routeHash({view,section,selectedId,sourcesOpen}));
    routeReady=true;
    window.addEventListener('popstate',applyRoute);
    window.addEventListener('hashchange',applyRoute);
    void load();
    const stream = new EventSource('/api/events');
    stream.onopen = () => { connected = true; };
    stream.onmessage = event => {
      try {
        const revision:unknown = JSON.parse(event.data).revision;
        if (typeof revision !== 'number' || !Number.isSafeInteger(revision)) return;
        announcedRevision = Math.max(announcedRevision, revision);
        if (!loadingSnapshot && announcedRevision > data.revision) void load();
      } catch { /* Ignore malformed events; polling remains the fallback. */ }
    };
    stream.onerror = () => connected = false;
    const fallback = setInterval(() => void load(), 15000);
    return () => { stream.close(); clearInterval(fallback); window.removeEventListener('popstate',applyRoute); window.removeEventListener('hashchange',applyRoute); };
  });
  async function refresh(source = 'all') { const id=toast.loading('Requesting refresh…'); try { await request('/api/refresh', 'POST', { source }); await load(); toast.success('Refresh requested',{id,description:'Source status will update as each scan completes.'}); } catch (cause) { toast.error('Refresh failed',{id,description:String(cause)}); } }
  async function annotate(entry: Entry, patch: { favorite?: boolean; notes?: string }) { await request(`/api/entries/${encodeURIComponent(entry.id)}`, 'PATCH', patch); await load(); }
  async function favorite(entry: Entry) { try { const wasFavorite=entry.favorite; await annotate(entry, { favorite: !wasFavorite }); toast.success(wasFavorite?'Removed from favorites':'Saved to favorites',{description:entry.name,action:{label:'Undo',onClick:()=>{void annotate(entry,{favorite:Boolean(wasFavorite)}).catch(()=>toast.error('Could not undo favorite'));}}}); } catch { notify('Could not save favorite'); } }
  async function saveNotes(entry: Entry, notes: string) { try { await annotate(entry, { notes }); cue('success'); toast.success('Note saved',{description:entry.name}); } catch { notify('Could not save note'); throw new Error('Save failed'); } }
  async function remove(entry: Entry) { try { await request(`/api/entries/${encodeURIComponent(entry.id)}`, 'DELETE'); selectedId = ''; await load(); notify('Record removed'); } catch { notify('Could not remove record'); } }
  function navigate(id: string) { window.scrollTo({top:0}); cue('page'); minimumStars = 0; section = id; query = ''; category = 'all'; status = 'all'; view = 'list'; mobileNav = false; sourcesOpen = false; selectedId=''; }
  function exportData() {
    const content = JSON.stringify({ exportedAt: new Date().toISOString(), revision: data.revision, entries: filtered }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'codex-tool-registry.json'; link.click(); URL.revokeObjectURL(url); notify(`${filtered.length.toLocaleString()} records exported`);
  }
  async function add() {
    adding = true;
    try { const result = await request('/api/entries', 'POST', { name: addName, description: addDescription, category: addCategory, url: addUrl }); await load(); showAdd = false; navigate('custom'); selectedId = result.id; addName = ''; addDescription = ''; addUrl = ''; notify('Resource added'); }
    catch (cause) { notify(cause instanceof Error ? cause.message : 'Could not add resource'); }
    finally { adding = false; }
  }
</script>

<svelte:head><title>Build for Codex — Tool Registry</title><meta name="description" content="Your local tools, agents, applications, and GitHub discoveries." /><meta name="theme-color" content="#031a2b" /></svelte:head>
<svelte:window onkeydown={globalKeydown} onpointerdown={(event)=>{if(!(event.target as Element).closest(".terminal-console"))consoleOpen=false;}} />
<a class="skip-link" href="#registry-main" onclick={(event)=>{event.preventDefault();document.getElementById('registry-main')?.focus();}}>Skip to content</a>
<div class="app-shell">
  {#if mobileNav}<button class="nav-scrim" aria-label="Close navigation" onclick={() => mobileNav = false}></button>{/if}
  <aside class:mobile-open={mobileNav} class="sidebar" role={mobileNav?'dialog':undefined} aria-modal={mobileNav?true:undefined} aria-label="Workspace navigation">
    <a class="brand" href="/" aria-label="Build for Codex home"><span class="brand-mark"><svg viewBox="0 0 120 48" aria-hidden="true"><path fill="currentColor" d="M10 4h38q12 0 12 12v9H19v4h41v7q0 12-12 12H12Q0 48 0 36V16Q0 4 10 4Zm62 0h36q12 0 12 12v9H60v-9Q60 4 72 4ZM79 29h22v19H79Z"/></svg></span><span>Build <span class="brand-sub">for Codex</span></span><span class="brand-dot"></span></a>
    <div class="workspace-switch"><span class="workspace-avatar">K</span><span>Personal workspace<small>Local registry</small></span><ChevronDown size={13} /></div>
    <div class="nav-label">WORKSPACE</div>
    <nav aria-label="Registry navigation">{#each navigation as item}<button data-source={item.id} class:active={section === item.id && !sourcesOpen} title={item.label} aria-label={item.label} onclick={() => navigate(item.id)}><FolderIcon name={item.id} /><span class="nav-tooltip">{item.label}</span><small>{count(item.id).toLocaleString()}</small></button>{/each}</nav>
    <div class="nav-label collection-label">COLLECTIONS<button class="icon-button" aria-label="Add resource" title="Add resource" onclick={() => showAdd = true}><Plus size={14} /></button></div>
    <nav aria-label="Collections"><button class:active={section === 'favorites' && !sourcesOpen} title="Favorites" onclick={() => navigate('favorites')}><Star size={16} /><span>Favorites</span><small>{favorites}</small></button><button class:active={section === 'custom' && !sourcesOpen} title="Saved resources" onclick={() => navigate('custom')}><FolderHeart size={16} /><span>Saved resources</span><small>{count('custom')}</small></button></nav>
    <div class="sidebar-bottom"><button class:active={sourcesOpen} class="source-nav" title="Connected sources" onclick={() => { sourcesOpen = !sourcesOpen; mobileNav = false; }}><Cable size={16} /><span>Connected sources</span><span class:has-error={sourceErrors.length} class="source-count">5</span></button><div class="sync-footer"><span class:offline={!connected} class="live-dot"></span><span>{connected ? 'Live sync enabled' : 'Connecting…'}<small>Local · every 60 seconds</small></span></div><div class="profile"><span class="profile-avatar">K</span><span>kmshdev<small>Personal</small></span><span class="profile-local">LOCAL</span></div></div>
  </aside>
  <main inert={mobileNav} id="registry-main" tabindex="-1" class="workspace" class:overview-mode={view === 'overview'}>
    <header class="terminal-nav">
      <button class="mobile-menu" aria-label="Open navigation" onclick={() => mobileNav = true}><Menu size={14}/></button>
      <button class="terminal-logo" aria-label="Home" onclick={()=>{navigate('all');view='overview';}}>▰</button>
      <div class="terminal-links" role="tablist" tabindex="-1" aria-label="Registry view" onkeydown={tabKeydown}>
        {#each [{id:'overview',key:'O',label:'Overview'},{id:'list',key:'I',label:'Inventory'},{id:'map',key:'M',label:'Map'},{id:'activity',key:'A',label:'Activity'}] as tab}
          <button role="tab" tabindex={view===tab.id?0:-1} aria-selected={view===tab.id&&!sourcesOpen} onclick={()=>{if(tab.id==='overview')navigate('all');view=tab.id as typeof view;sourcesOpen=false;selectedId='';window.scrollTo({top:0});}}><span>[{tab.key}]</span> {tab.label}</button>
        {/each}
      </div>
      <div class="terminal-console"><button aria-expanded={consoleOpen} aria-controls="console-actions" onclick={()=>consoleOpen=!consoleOpen}>[C] <span>Console</span> {consoleOpen?'−':'+'}</button>
        {#if consoleOpen}<div id="console-actions" class="console-actions"><span class="console-status"><i class="live-dot" class:offline={!connected}></i>{connected?'Registry connected':'Registry offline'}</span><button onclick={()=>{showAdd=true;consoleOpen=false;}}><Plus size={14}/>Add resource</button><button disabled={refreshing} onclick={()=>{refresh();consoleOpen=false;}}><RefreshCw size={14}/>{refreshing?'Refreshing…':'Refresh all sources'}</button><button disabled={loading} onclick={()=>{exportData();consoleOpen=false;}}><Download size={14}/>Export inventory</button><button aria-pressed={soundEnabled} onclick={()=>soundEnabled=toggleSound()}>Sound {soundEnabled?'on':'off'}</button><button onclick={()=>{sourcesOpen=true;consoleOpen=false;}}>Connected sources</button></div>{/if}
      </div>
    </header>
    <div class="page-heading" class:home-heading={view==='overview' && !sourcesOpen}><div><div class="route-breadcrumb"><button onclick={()=>{navigate('all');view='overview';}}>Workspace</button><ChevronRight size={14}/><span>{sourcesOpen ? 'Sources' : view==='overview' ? 'Overview' : sectionTitle}</span></div><h1>{sourcesOpen ? 'Connected sources' : view === 'overview' ? 'Capability overview' : view === 'list' ? sectionTitle : view === 'map' ? 'Capability map' : 'Activity log'}<span class="title-count">{(sourcesOpen?data.sources.length:filtered.length).toLocaleString()}</span></h1></div><Badge label={refreshing ? 'Syncing' : connected ? 'Live registry' : 'Offline'} tone={connected?'success':'warning'} dot /></div>
    {#if error}<div class="error-banner" role="alert"><AlertCircle size={15} />{error}<button onclick={() => load()}>Retry</button></div>{/if}
    {#if sourceErrors.length && !sourcesOpen}<button class="error-banner" onclick={() => sourcesOpen = true}><AlertCircle size={15} />{sourceErrors.length} source unavailable · retained last successful data<ArrowUpRight size={14} /></button>{/if}
    <div class="content-shell" class:overview-content={view === 'overview'} class:with-inspector={Boolean(selected) && !sourcesOpen}>
      <section class="registry-content" data-route-revision={routeRevision} use:routeMotion={`${view}:${section}:${sourcesOpen}`}>
        {#if sourcesOpen}
          <div class="view-tabs source-panel-bar"><h2 class="eyebrow">/ SOURCE HEALTH</h2><button class="icon-button" title="Close sources" aria-label="Close sources" onclick={() => sourcesOpen = false}><X size={16} /></button></div>
          <div class="sources-list">{#each data.sources.filter(source => source.id !== 'custom') as source}<div class="source-row"><span class="source-logo"><ToolIcon kind={{ cli: 'CLI', brew: 'Toolchain', apps: 'Mac app', agents: 'Agent', github: 'Repository' }[source.id] ?? ''} size={22} /></span><div><h3>{source.name}</h3><p>{source.count.toLocaleString()} records <span>·</span> {relative(source.updatedAt)}</p>{#if source.error}<p class="source-error">{source.error}</p>{/if}</div><span class:unhealthy={source.status === 'error'} class="source-health"><i></i>{source.status}</span><button class="icon-button" title={`Refresh ${source.name}`} aria-label={`Refresh ${source.name}`} disabled={source.status === 'refreshing'} onclick={() => refresh(source.id)}><RefreshCw size={15} /></button></div>{/each}<div class="schedule-line"><Activity size={14} /><span>Local sources: 60s</span><span>GitHub: 15m</span></div></div>
        {:else}

          {#if view !== 'activity' && view !== 'overview'}<div class="filter-bar"><label class="search"><Search size={15} /><input aria-label="Search resources" placeholder="Search your resources…" bind:value={query} />{#if query}<button class="icon-button" title="Clear search" aria-label="Clear search" onclick={() => query = ''}><X size={13} /></button>{/if}</label>{#if minimumStars > 0}<button class="active-lens" title="Clear popularity filter" onclick={() => minimumStars = 0}>≥ {minimumStars.toLocaleString()} stars<X size={12} /></button>{/if}<label class="filter-select"><Filter size={13} /><select aria-label="Filter capability" bind:value={category}><option value="all">All capabilities</option>{#each data.categories as name}<option value={name}>{name}</option>{/each}</select></label><label class="filter-select status-filter"><span class="tiny-dot"></span><select aria-label="Filter status" bind:value={status}><option value="all">All status</option><option>Installed</option><option>Starred</option><option>Cached</option><option>Saved</option></select></label>{#if view === 'list' && section !== 'github'}<label class="sort-select" title="Sort resources"><ArrowDownUp size={14} /><select aria-label="Sort resources" bind:value={sort}><option value="relevance">Recommended</option><option value="name">Name</option><option value="stars">Stars</option><option value="recent">Updated</option></select></label>{/if}</div>{/if}
          {#if view === 'overview'}<EditorialHome {data} {connected} {loading} onselect={(id) => selectedId = id} onsearch={(text) => { navigate('all'); query = text; }} onsource={navigate} />
          {:else if loading}<div class="empty-state"><RefreshCw size={25} class="spinning" /><h2>Loading registry</h2></div>
          {:else if view === 'activity'}<div class="activity-list">{#each data.activity as item}<div class="activity-row"><span class:activity-error={item.status === 'error'} class="activity-icon">{#if item.status === 'error'}<AlertCircle size={15} />{:else}<Check size={15} />{/if}</span><div><strong>{item.message}</strong><p>{item.detail}</p></div><time title={item.at}>{relative(item.at)}</time></div>{:else}<div class="empty-state"><Activity size={28} /><h2>No activity yet</h2><button class="text-button" onclick={() => refresh()}>Refresh sources</button></div>{/each}</div>
          {:else if !filtered.length}<div class="empty-state"><Search size={28} /><h2>{section === 'favorites' ? 'No favorites yet' : section === 'custom' ? 'Your collection is empty' : 'No matching resources'}</h2>{#if section === 'custom'}<button class="text-button" onclick={() => showAdd = true}>Add resource</button>{:else}<button class="text-button" onclick={() => { query = ''; category = 'all'; status = 'all'; section = 'all'; minimumStars = 0; }}>View all resources</button>{/if}</div>
          {:else if view === 'map'}<div class="map-container">{#await import('./components/CapabilityMap.svelte')}<div class="empty-state" role="status">Loading map…</div>{:then module}<module.default entries={filtered} selected={selectedId} onselect={(id) => selectedId = id} />{:catch}<div class="empty-state" role="alert">Could not load the map. Reload the page to try again.</div>{/await}</div>
          {:else if section === 'github'}<StarTimeline entries={filtered} onselect={(id)=>selectedId=id}/>{:else}<div class="table-scroll"><table><thead><tr><th scope="col" class="favorite-cell"><span class="sr-only">Favorite</span></th><th>Resource</th><th class="category-cell">Capability</th><th class="status-cell">Status</th><th class="meta-cell">Source</th><th scope="col" class="arrow-cell"><span class="sr-only">Details</span></th></tr></thead><tbody>{#each visible as entry}<tr class:selected-row={selectedId === entry.id}><td class="favorite-cell"><button class:starred={entry.favorite} class="icon-button row-star" title={entry.favorite ? 'Remove favorite' : 'Add favorite'} aria-label={`${entry.favorite ? 'Unfavorite' : 'Favorite'} ${entry.name}`} onclick={() => favorite(entry)}><Star size={13} fill={entry.favorite ? 'currentColor' : 'none'} /></button></td><td><button class="resource-cell" data-repo-id={entry.source === 'github' ? entry.id : undefined} onclick={() => selectedId = entry.id}><span class="tool-symbol" style:color={color(entry.category)} style:background={`color-mix(in srgb, ${color(entry.category)} 10%, transparent)`}><ToolIcon kind={entry.kind} /></span><span class="resource-copy"><strong>{entry.name}</strong><small>{entry.description || entry.owner || entry.kind}</small><span class="mobile-record-status">{entry.status} · {entry.kind}</span></span></button></td><td class="category-cell"><span class="category-value"><i style:background={color(entry.category)}></i>{entry.category}</span></td><td class="status-cell"><Badge label={entry.status} tone={entry.status==='Installed'?'success':entry.status==='Starred'?'info':'neutral'} dot /></td><td class="meta-cell">{entry.source === 'github' ? 'GitHub' : entry.source === 'cli' ? 'PATH' : entry.source === 'brew' ? 'Homebrew' : entry.source === 'apps' ? 'macOS' : entry.source === 'agents' ? entry.kind : 'Manual'}</td><td class="arrow-cell"><button class="icon-button" aria-label={`View ${entry.name}`} title={`View ${entry.name}`} onclick={() => selectedId = entry.id}><ChevronRight size={14} /></button></td></tr>{/each}</tbody></table></div><div class="pagination"><span>{page * 40 + 1}–{Math.min((page + 1) * 40, filtered.length)} of {filtered.length.toLocaleString()}</span><div><button class="icon-button" title="Previous page" aria-label="Previous page" disabled={page === 0} onclick={() => page--}><ChevronLeft size={15} /></button><span>{page + 1} / {pages}</span><button class="icon-button" title="Next page" aria-label="Next page" disabled={page + 1 >= pages} onclick={() => page++}><ChevronRight size={15} /></button></div></div>{/if}
        {/if}
      </section>
      {#if selected && !sourcesOpen}<SpringModal wide={selected.source==='github'} title={selected.name} onclose={() => selectedId = ''}><Inspector entry={selected} {related} onclose={() => selectedId = ''} onfavorite={favorite} onsave={saveNotes} onselect={(id) => selectedId = id} onremove={remove} /></SpringModal>{/if}
    </div>
    <footer class="workspace-footer"><span><span class:offline={!connected} class="live-dot"></span>{connected ? 'Registry connected' : 'Reconnecting to registry'}</span><span>{#if data.revision<0}{loading?'Loading your inventory…':'Snapshot unavailable'}{:else}{data.entries.filter(entry => entry.source !== 'github').length.toLocaleString()} local records <span class="footer-separator">/</span> {count('github').toLocaleString()} starred <span class="footer-separator">/</span> Revision {data.revision}{/if}</span></footer>
  </main>
</div>
<Toaster position="bottom-right" theme="dark" closeButton richColors offset="48px" toastOptions={{class:'registry-toast'}} />
{#if showAdd}
  <SpringModal title="Add resource" onclose={() => showAdd = false} tuning>
    <form onsubmit={(event) => { event.preventDefault(); void add(); }}><label>Name<input required maxlength="120" bind:value={addName} placeholder="Resource name" /></label><label>URL<input type="url" bind:value={addUrl} placeholder="https://" /></label><label>Capability<select bind:value={addCategory}>{#each data.categories as name}<option>{name}</option>{/each}</select></label><label>Description<textarea maxlength="2000" rows="3" bind:value={addDescription} placeholder="Description"></textarea></label><div class="modal-actions"><button type="button" class="text-button" onclick={() => showAdd = false}>Cancel</button><button class="primary-button" type="submit" disabled={adding || !addName.trim()}><Plus size={14} />{adding ? 'Adding…' : 'Add resource'}</button></div></form>
  </SpringModal>
{/if}

<RepoPreview entries={data.entries} onselect={(id) => selectedId = id} />
