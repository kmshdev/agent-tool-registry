<script lang="ts">
  import { Terminal, Bot, BookOpen, AppWindow, GitFork as Github, Blocks, Link } from '@lucide/svelte';
  let { kind, size = 16 }: { kind: string; size?: number } = $props();
  const icons = { CLI: Terminal, Agent: Bot, Skill: BookOpen, 'Mac app': AppWindow, Repository: Github, Toolchain: Blocks, Package: Blocks, Resource: Link };
  let Icon = $derived(icons[kind as keyof typeof icons] ?? Blocks);
</script>
<Icon {size} strokeWidth={1.6} />
