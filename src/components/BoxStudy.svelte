<script lang="ts">
  import { inViewMotion } from '../lib/text-motion';
  let {variant=0}:{variant?:number}=$props();
</script>
<div class="box-study" class:green={variant%4===2} use:inViewMotion aria-hidden="true">
  <span class="box-caption">{variant%4===2?'02 / LOCAL SYSTEM':'00 / INPUT → OUTPUT'}</span>
  <pre>{variant%4===2?`     ┌──────────────┐
     │  WORKSPACE   │░
     └──────┬───────┘░
            │
     ┌──────┴───────┐
     │              │
 ┌───┴────┐    ┌────┴───┐
 │  APPS  │░   │ TOOLS  │░
 └────────┘░   └────────┘░
  ░░░░░░░░░░    ░░░░░░░░░`:` ┌─────────────────────┐
 │ $ build something   │░
 │                     │░
 │  ┌─────┐   ┌─────┐  │░
 │  │ YOU ├──▶│ IDEA│  │░
 │  └─────┘   └──┬──┘  │░
 │               ▼     │░
 │           [ READY ] │░
 └─────────────────────┘░
  ░░░░░░░░░░░░░░░░░░░░░░░`}</pre>
  <span class="box-packet">■</span><span class="box-coordinate">└─ {variant%4===2?'CONNECTED':'AWAITING INPUT'} <i>●</i></span>
</div>
<style>
.box-study{position:absolute;inset:0;display:grid;place-content:center;background:#091e32;color:#87ccec;overflow:hidden;container-type:inline-size}.box-study.green{background:#102b29;color:#a6d4aa}.box-study pre{font:clamp(8px,3.8cqw,17px)/1.35 var(--mono);margin:0;white-space:pre;letter-spacing:0}.box-caption,.box-coordinate{position:absolute;left:18px;font:9px var(--mono);letter-spacing:.04em}.box-caption{top:16px}.box-coordinate{bottom:18px}.box-coordinate i{font-style:normal;color:#f5a76b}.box-packet{position:absolute;left:50%;top:50%;color:#ffb578;opacity:0}.box-study:global(.in-view) .box-packet{animation:packet 5s ease-in-out infinite}.box-study:global(.in-view) .box-coordinate i{animation:blink 2.8s steps(2,end) infinite}@keyframes packet{0%,15%{opacity:0;transform:translate(-55px,0)}25%,55%{opacity:1}75%,100%{opacity:0;transform:translate(65px,0)}}@keyframes blink{50%{opacity:.25}}@media(prefers-reduced-motion:reduce){.box-study:global(.in-view) .box-packet,.box-study:global(.in-view) .box-coordinate i{animation:none}}
</style>
