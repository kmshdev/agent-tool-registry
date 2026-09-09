<script lang="ts">
  import type { Entry } from '../lib/types';
  import PatternStudy from './PatternStudy.svelte';
  import BoxStudy from './BoxStudy.svelte';
  let {entry,variant}:{entry:Entry;variant:number}=$props();
  let failed=$state(false);
</script>
{#if entry.previewUrl&&!failed}<img class="project-screenshot" src={entry.previewUrl} alt={`Screenshot of ${entry.name}'s project website`} loading="lazy" decoding="async" onerror={()=>failed=true}/>{:else if variant%3===0}<BoxStudy {variant}/>{:else}<PatternStudy {variant} compact/>{/if}
<style>.project-screenshot{width:100%;height:100%;object-fit:cover;object-position:top;display:block;transition:transform .6s cubic-bezier(.16,1,.3,1)}:global(.timeline-card:hover) .project-screenshot{transform:scale(1.035)}@media(prefers-reduced-motion:reduce){.project-screenshot{transition:none}}</style>
