<script lang="ts">
  import { createDialKit, DialRoot } from 'dialkit/svelte';
  let { onchange, onreplay }: {
    onchange: (settings: { entrance: { visualDuration:number; bounce:number }; overlayOpacity:number; borderRadius:number }) => void;
    onreplay: () => void;
  } = $props();
  const values = createDialKit('Modal entrance', {
    entrance: { visualDuration: [.4,.1,1.2,.05], bounce: [.18,0,.65,.01] },
    overlayOpacity: [.32,0,.8,.01],
    borderRadius: [12,0,40,1],
    replay: { type: 'action' },
  }, { onAction: action => { if (action === 'replay') onreplay(); } });
  $effect(()=>onchange({entrance:{visualDuration:values.entrance.visualDuration,bounce:values.entrance.bounce},overlayOpacity:values.overlayOpacity,borderRadius:values.borderRadius}));
</script>
<DialRoot mode="inline" theme="dark" productionEnabled defaultOpen />
