<script setup lang="ts">
// LangSwitcher (Frontend 1.8) – Globe-Trigger + aufklappbares Dropdown (reka-ui, die
// shadcn-vue-Basis; A11y/Keyboard/Escape liefert reka-ui). Bewahrt das Design-System:
// Trigger im dunklen Header (--ink-*), schwebendes Panel hell (--surface/--line/--ink),
// IBM Plex, kein Links-Akzentstreifen. switchTo() ruft setLocale + persistiert den Cookie
// (useLanguageSwitch). EN faellt bis zur Textmigration auf DE zurueck (en.json leer).
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from 'reka-ui'
import { Globe, ChevronDown, Check } from 'lucide-vue-next'

const { locale, locales, switchTo } = useLanguageSwitch()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger class="lang-trigger" :aria-label="$t('header.langAria')">
      <Globe :size="16" aria-hidden="true" />
      <span class="lang-trigger__code">{{ locale.toUpperCase() }}</span>
      <ChevronDown :size="13" aria-hidden="true" class="lang-trigger__chev" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent class="lang-menu" :side-offset="8" align="end">
        <!-- RadioGroup -> aktive Locale ist programmatisch erkennbar (aria-checked), nicht
             nur visuell (Codex-A11y). @select uebergibt loc.code typsicher an switchTo. -->
        <DropdownMenuRadioGroup :model-value="locale">
          <DropdownMenuRadioItem
            v-for="loc in locales"
            :key="loc.code"
            :value="loc.code"
            class="lang-menu__item"
            @select="switchTo(loc.code)"
          >
            <Check :size="14" class="lang-menu__check" aria-hidden="true" />
            <span>{{ loc.name }}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style scoped>
/* Trigger – sitzt im dunklen Header. */
.lang-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 6px 8px;
  border-radius: var(--r);
  color: var(--ink-text-soft);
  cursor: pointer;
  transition: color 0.12s ease;
}
.lang-trigger:hover {
  color: var(--ink-text);
}
.lang-trigger:focus-visible {
  outline: 2px solid var(--ink-text);
  outline-offset: 2px;
}
.lang-trigger__code {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1;
}
.lang-trigger__chev {
  opacity: 0.55;
  transition: transform 0.16s ease;
}
.lang-trigger[data-state='open'] .lang-trigger__chev {
  transform: rotate(180deg);
}
</style>

<!-- Unscoped: der Dropdown-Content wird per Portal in den <body> gerendert, scoped-Styles
     greifen dort nicht. Eindeutige .lang-menu-Klassen vermeiden Kollisionen. -->
<style>
.lang-menu {
  min-width: 168px;
  padding: 6px;
  background: var(--surface);
  /* kraeftiger Rahmen statt Schatten (kein Shadow-Token im System; flaches Laborjournal). */
  border: 1px solid var(--line-strong);
  border-radius: var(--r);
  z-index: 60;
}
.lang-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--r);
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  font-size: 14px;
  color: var(--ink);
  cursor: pointer;
  outline: none;
  user-select: none;
}
.lang-menu__item[data-highlighted] {
  background: var(--canvas);
}
.lang-menu__check {
  flex: 0 0 auto;
  color: var(--ink);
  opacity: 0;
}
.lang-menu__item[data-state='checked'] {
  font-weight: 600;
}
.lang-menu__item[data-state='checked'] .lang-menu__check {
  opacity: 1;
}
</style>
