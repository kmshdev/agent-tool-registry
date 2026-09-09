<script lang="ts">
  import Icon from '@iconify/svelte';
  import { workIcons } from '../lib/work-icons';
  let { name, size = 22 }: { name: string; size?: number } = $props();
</script>
<Icon icon={workIcons[name] ?? workIcons.all} width={size} height={size} aria-hidden="true" />
