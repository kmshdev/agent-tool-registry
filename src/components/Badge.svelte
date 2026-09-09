<script lang="ts">
 let { label, tone = 'neutral', dot = false }: { label: string; tone?: 'neutral'|'success'|'info'|'warning'; dot?: boolean } = $props();
</script>
<span class="badge" class:success={tone==='success'} class:info={tone==='info'} class:warning={tone==='warning'}>{#if dot}<i aria-hidden="true"></i>{/if}{label}</span>
<style>
.badge{display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:4px 7px;font:500 12px/1.2 var(--mono);border:1px solid var(--color-border-strong);border-radius:4px;background:var(--color-bg-muted);color:var(--color-text-secondary)}.badge i{width:5px;height:5px;border-radius:50%;background:currentColor}.success{background:var(--color-success-bg);color:var(--color-success-text);border-color:var(--color-success-border)}.info{background:var(--color-info-bg);color:var(--color-info-text);border-color:var(--color-info-border)}.warning{background:var(--color-warning-bg);color:var(--color-warning-text);border-color:var(--color-warning-border)}
</style>
