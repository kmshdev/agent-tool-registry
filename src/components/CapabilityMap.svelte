<script lang="ts">
  import { SvelteFlow, Background, BackgroundVariant, Controls, type Node, type Edge } from '@xyflow/svelte';
  import '@xyflow/svelte/dist/style.css';
  import RegistryNode from './RegistryNode.svelte';
  import { publicShowcase } from '../lib/runtime';
  import { color, type Entry } from '../lib/types';
  let { entries, selected, onselect }: { entries: Entry[]; selected: string; onselect: (id: string) => void } = $props();
  let viewport = $state(1024);
  let compact = $derived(viewport <= 760);
  let fitOptions = $derived({ padding: compact ? { top: '60px' as const, bottom: '65px' as const, left: '14px' as const, right: '14px' as const } : { top: '50px' as const, bottom: '50px' as const, left: '40px' as const, right: '40px' as const } });
  const nodeTypes = { registry: RegistryNode };
  const priority = ['rg', 'vp', 'uv', 'cargo', 'gh', 'firecrawl', 'steel', 'playwright-cli', 'codex', 'reviewer', 'svelte-file-editor', 'loopy', 'docker', 'jq'];
  let ordered = $derived([...entries].sort((a, b) => (Number(b.favorite) || 0) - (Number(a.favorite) || 0) || ((priority.indexOf(a.name) + 1 || 1000) - (priority.indexOf(b.name) + 1 || 1000)) || Number(a.source === 'github') - Number(b.source === 'github') || a.name.localeCompare(b.name)));
  let groups = $derived([...new Set(ordered.map((entry) => entry.category))].slice(0, compact ? 2 : 3));
  let graph = $derived.by(() => {
    const nodes: Node[] = [{ id: 'root', type: 'registry', position: compact ? { x: 85, y: 0 } : { x: 0, y: Math.max(0, groups.length * 115 - 50) }, data: { label: publicShowcase?'Open-source discoveries':'Your toolkit', subtitle: `${entries.length.toLocaleString()} matching records`, color: '#a7d2b5', root: true, compact } }];
    const edges: Edge[] = [];
    for (const [index, category] of groups.entries()) {
      const id = `category:${category}`;
      const members = ordered.filter((entry) => entry.category === category);
      const shown = members.slice(0, 2);
      nodes.push({ id, type: 'registry', position: compact ? { x: 0, y: index * 180 + 160 } : { x: 300, y: index * 230 + 50 }, data: { label: category, subtitle: `${members.length.toLocaleString()} records`, color: color(category), hub: true, compact } });
      edges.push({ id: `root:${id}`, source: 'root', target: id, type: 'smoothstep', style: `stroke:${color(category)};stroke-opacity:.6;stroke-width:1.6;stroke-dasharray:5 5` });
      for (const [j, entry] of shown.entries()) {
        nodes.push({ id: entry.id, type: 'registry', position: compact ? { x: 185, y: index * 180 + 120 + j * 80 } : { x: 625, y: index * 230 + j * 100 }, selected: selected === entry.id, data: { label: entry.name, subtitle: `${entry.kind} · ${entry.source === 'github' ? entry.owner : entry.status}`, kind: entry.kind, repoId: entry.source === 'github' ? entry.id : undefined, color: color(category), compact } });
        edges.push({ id: `${id}:${entry.id}`, source: id, target: entry.id, type: 'smoothstep', style: `stroke:${color(category)};stroke-opacity:.6;stroke-width:1.4` });
      }
    }
    return { nodes, edges };
  });
</script>
<svelte:window bind:innerWidth={viewport} />
<div class="map" aria-label="Capability relationship map">
  <div class="map-label"><span class="live-dot"></span>CAPABILITY MAP <span class="map-sub">/ {graph.nodes.length - groups.length - 1} {publicShowcase?'repositories':'tools'} shown</span></div>
  {#key `${compact}:${groups.join('|')}`}
    <SvelteFlow nodes={graph.nodes} edges={graph.edges} {nodeTypes} fitView fitViewOptions={fitOptions} minZoom={0.25} maxZoom={1.7} nodesDraggable={false} nodesConnectable={false} colorMode="dark" onnodeclick={({ node }) => { if (!node.id.startsWith('category:') && node.id !== 'root') onselect(node.id); }} proOptions={{ hideAttribution: false }}>
      <Background variant={BackgroundVariant.Dots} gap={24} size={0.5} patternColor="#426177" />
      <Controls showLock={false} fitViewOptions={fitOptions} />
    </SvelteFlow>
  {/key}
  <div class="map-legend"><span>Category membership</span>{#each groups as category}<span><i style:background={color(category)}></i>{category}</span>{/each}</div>
</div>
<style>
  .map :global(.svelte-flow){--xy-background-color:#062337}.map{position:relative;height:100%;min-height:380px;background:#062337}.map-label{position:absolute;left:24px;top:22px;z-index:2;display:flex;align-items:center;gap:8px;font-size:var(--type-12);color:#87aac2}.map-sub{color:#62728b;margin-left:5px}.map-legend{position:absolute;bottom:22px;right:20px;z-index:2;display:flex;gap:12px;font-size:var(--type-12);color:#87aac2;flex-wrap:wrap;max-width:70%;justify-content:flex-end}.map-legend span{display:flex;align-items:center;gap:5px}.map-legend i{width:5px;height:5px;border-radius:50%}
  :global(.svelte-flow__attribution){font-size:var(--type-10)!important;background:transparent!important;color:#838c85!important}
  :global(.svelte-flow__controls){box-shadow:none!important;border:1px solid #3b413c;border-radius:5px;overflow:hidden;bottom:20px;left:12px}
  :global(.svelte-flow__controls-button){background:#123448!important;color:#bcd9e8!important;border-bottom:1px solid #315269!important;width:40px!important;height:40px!important}
  @media(max-width:700px){.map-label{left:14px}.map-legend{display:none}:global(.svelte-flow__controls){flex-direction:row!important}:global(.svelte-flow__controls-button){border-bottom:0!important;border-right:1px solid #3b413c!important}}
</style>
