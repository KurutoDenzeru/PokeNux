<template>
  <div ref="refElement"
    class="container-style duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] container relative isolate w-full transition-transform will-change-transform [perspective:600px]"
    @pointermove="handlePointerMove" @pointerenter="handlePointerEnter" @pointerleave="handlePointerLeave">
    <div
      class="duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] grid h-full origin-center overflow-hidden rounded-sm border border-transparent dark:border-slate-800 transition-transform will-change-transform [transform:rotateY(var(--r-x))_rotateX(var(--r-y))] hover:filter-none hover:[--duration:200ms] hover:[--easing:linear] hover:[--opacity:0.6]">
      <div class="grid size-full mix-blend-soft-light [clip-path:inset(0_0_0_0_round_var(--radius))] [grid-area:1/1]">
        <div :class="['size-full bg-slate-950', props.class]">
          <slot />
        </div>
      </div>
      <div
        class="transition-background duration-[var(--duration)] ease-[var(--easing)] delay-[var(--delay)] will-change-background grid size-full opacity-[var(--opacity)] mix-blend-soft-light transition-opacity [background:radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(255,255,255,0.8)_10%,_rgba(255,255,255,0.65)_20%,_rgba(255,255,255,0)_90%)] [clip-path:inset(0_0_1px_0_round_var(--radius))] [grid-area:1/1]" />
      <div
        class="background-style will-change-background after:grid-area-[inherit] after:bg-repeat-[inherit] after:bg-attachment-[inherit] after:bg-origin-[inherit] after:bg-clip-[inherit] relative grid size-full opacity-[var(--opacity)] mix-blend-color-dodge transition-opacity [background-blend-mode:hue_hue_hue_overlay] [background:var(--pattern),_var(--rainbow),_var(--diagonal),_var(--shade)] [clip-path:inset(0_0_1px_0_round_var(--radius))] [grid-area:1/1] after:bg-[inherit] after:mix-blend-exclusion after:content-[\'\'] after:[background-blend-mode:soft-light,_hue,_hard-light] after:[background-position:center,_0%_var(--bg-y),_calc(var(--bg-x)*_-1)_calc(var(--bg-y)*_-1),_var(--bg-x)_var(--bg-y)] after:[background-size:var(--foil-size),_200%_400%,_800%,_200%]" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useTimeoutFn } from '@vueuse/core'

  interface GlareCardProps {
    class?: string
  }

  const props = defineProps<GlareCardProps>()

  const refElement = ref<HTMLElement | null>(null)
  const isPointerInside = ref(false)

  const state = ref({
    glare: { x: 50, y: 50 },
    background: { x: 50, y: 50 },
    rotate: { x: 0, y: 0 },
  })

  const setCssVars = () => {
    const el = refElement.value
    if (!el) return
    el.style.setProperty('--m-x', `${state.value.glare.x}%`)
    el.style.setProperty('--m-y', `${state.value.glare.y}%`)
    el.style.setProperty('--r-x', `${state.value.rotate.x}deg`)
    el.style.setProperty('--r-y', `${state.value.rotate.y}deg`)
    el.style.setProperty('--bg-x', `${state.value.background.x}%`)
    el.style.setProperty('--bg-y', `${state.value.background.y}%`)
  }

  function handlePointerMove(event: PointerEvent) {
    const rotateFactor = 0.4
    const rect = refElement.value?.getBoundingClientRect()
    if (rect) {
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      const percentage = {
        x: (100 / rect.width) * position.x,
        y: (100 / rect.height) * position.y,
      }
      const delta = {
        x: percentage.x - 50,
        y: percentage.y - 50,
      }
      state.value.background.x = 50 + percentage.x / 4 - 12.5
      state.value.background.y = 50 + percentage.y / 3 - 16.67
      state.value.rotate.x = -(delta.x / 3.5) * rotateFactor
      state.value.rotate.y = (delta.y / 2) * rotateFactor
      state.value.glare.x = percentage.x
      state.value.glare.y = percentage.y
      setCssVars()
    }
  }

  function handlePointerEnter() {
    isPointerInside.value = true
    useTimeoutFn(() => {
      if (isPointerInside.value && refElement.value) {
        refElement.value.style.setProperty('--duration', '0s')
      }
    }, 300)
  }

  function handlePointerLeave() {
    isPointerInside.value = false
    if (refElement.value) {
      refElement.value.style.removeProperty('--duration')
      state.value.rotate = { x: 0, y: 0 }
      setCssVars()
    }
  }

  onMounted(() => {
    // initialize CSS vars
    if (refElement.value) {
      refElement.value.style.setProperty('--duration', '300ms')
      refElement.value.style.setProperty('--easing', 'ease')
      refElement.value.style.setProperty('--opacity', '0')
      // make default corner radius smaller (xs-like)
      refElement.value.style.setProperty('--radius', '6px')
      setCssVars()
    }
  })
</script>

<style scoped>
  .background-style {
    --step: 5%;
    --foil-svg: url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='5' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E");
    --pattern: var(--foil-svg) center/100% no-repeat;
    --rainbow: repeating-linear-gradient(0deg,
        rgb(255, 119, 115) calc(var(--step) * 1),
        rgba(255, 237, 95, 1) calc(var(--step) * 2),
        rgba(168, 255, 95, 1) calc(var(--step) * 3),
        rgba(131, 255, 247, 1) calc(var(--step) * 4),
        rgba(120, 148, 255, 1) calc(var(--step) * 5),
        rgb(216, 117, 255) calc(var(--step) * 6),
        rgb(255, 119, 115) calc(var(--step) * 7)) 0% var(--bg-y) / 200% 700% no-repeat;
    --diagonal: repeating-linear-gradient(128deg,
        #0e152e 0%,
        hsl(180, 10%, 60%) 3.8%,
        hsl(180, 10%, 60%) 4.5%,
        hsl(180, 10%, 60%) 5.2%,
        #0e152e 10%,
        #0e152e 12%) var(--bg-x) var(--bg-y) / 300% no-repeat;
    --shade: radial-gradient(farthest-corner circle at var(--m-x) var(--m-y),
        rgba(255, 255, 255, 0.1) 12%,
        rgba(255, 255, 255, 0.15) 20%,
        rgba(255, 255, 255, 0.25) 120%) var(--bg-x) var(--bg-y) / 300% no-repeat;
    background-blend-mode: hue, hue, hue, overlay;
  }

  .container-style {
    --m-x: 50%;
    --m-y: 50%;
    --r-x: 0deg;
    --r-y: 0deg;
    --bg-x: 50%;
    --bg-y: 50%;
    --duration: 300ms;
    --foil-size: 100%;
    --opacity: 0;
    --radius: 48px;
    --easing: ease;
    --transition: var(--duration) var(--easing);
  }
</style>
