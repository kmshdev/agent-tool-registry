<script lang="ts">
  import Terminal from '@lucide/svelte/icons/terminal';
  import Bot from '@lucide/svelte/icons/bot';
  import BookOpen from '@lucide/svelte/icons/book-open';
  import AppWindow from '@lucide/svelte/icons/app-window';
  import Github from '@lucide/svelte/icons/git-fork';
  import Blocks from '@lucide/svelte/icons/blocks';
  import Link from '@lucide/svelte/icons/link';
  let { kind, size = 16 }: { kind: string; size?: number } = $props();
  const icons = { CLI: Terminal, Agent: Bot, Skill: BookOpen, 'Mac app': AppWindow, Repository: Github, Toolchain: Blocks, Package: Blocks, Resource: Link };
  let Icon = $derived(icons[kind as keyof typeof icons] ?? Blocks);
</script>
<Icon {size} strokeWidth={1.6} />
