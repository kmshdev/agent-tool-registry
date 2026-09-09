<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte';
  import Layers from '@lucide/svelte/icons/layers';
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import ToolIcon from './ToolIcon.svelte';
  let { data, selected = false }: { data: { label: string; subtitle: string; color: string; kind?: string; repoId?: string; hub?: boolean; root?: boolean; compact?: boolean }; selected?: boolean } = $props();
</script>
<div data-repo-id={data.repoId} class:compact={data.compact} class:hub={data.hub} class:root={data.root} class:selected class="registry-node" style:--node-color={data.color}>
  {#if !data.root}<Handle type="target" position={data.compact && data.hub ? Position.Top : Position.Left} />{/if}
  <span class="node-icon">{#if data.root || data.hub}<Layers size={17} strokeWidth={1.5} />{:else}<ToolIcon kind={data.kind ?? ''} size={17} />{/if}</span>
  <span class="node-copy"><strong>{data.label}</strong><small>{data.subtitle}</small></span>
  {#if !data.root && !data.hub}<ArrowUpRight class="node-arrow" size={12} />{/if}
  {#if data.root || data.hub}<Handle type="source" position={data.compact && data.root ? Position.Bottom : Position.Right} />{/if}
</div>
<style>
.registry-node{width:248px;min-height:86px;padding:17px;display:flex;align-items:center;gap:11px;background:#0b2b40;border:1px solid #31516a;border-radius:6px;box-shadow:0 3px 10px #292c3510;color:#bdcedd}
.registry-node:hover,.registry-node.selected{border-color:#7466c8;background:#15374c}
.node-icon{color:#7bd7d0;background:#134256;width:36px;height:36px;display:grid;place-items:center;border-radius:4px;flex-shrink:0}
.node-copy{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.node-copy strong{font-weight:500;font-size:var(--type-14);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.node-copy small{font-size:var(--type-12);color:#89abc1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hub{width:210px;min-height:80px;background:#10344a}.root{width:205px;min-height:95px;background:#174556;border-color:#4c8192}.root .node-copy strong{font-size:var(--type-16)}:global(.node-arrow){color:#89abc1}
:global(.svelte-flow__handle){width:5px;height:5px;background:#818b86;border:1px solid #242827;min-width:5px;min-height:5px}
.compact{width:160px;min-height:62px;padding:9px;gap:8px}.compact.hub{width:145px;min-height:62px}.compact.root{width:175px;min-height:74px}.compact .node-icon{width:25px;height:28px}.compact .node-copy strong{font-size:var(--type-12)}.compact .node-copy small{font-size:var(--type-10)}
</style>
