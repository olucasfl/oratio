import { ITEMS } from "../../pages/Pote/domain/catalog"
import { COMBOS } from "../../pages/Pote/domain/score"
import { CLASSIFICATION_TEXT } from "../../pages/Pote/domain/content"

/*
 Lista de TODOS os ícones do Google (Material Symbols Rounded) que o app usa.
 O `index.html` carrega a fonte já recortada para estes nomes
 (`icon_names=...`), então um ícone fora desta lista não aparece (a caixa fica
 vazia). `Icon.test.ts` garante que esta lista e a URL do `index.html` são o
 mesmo conjunto. Para usar um ícone novo: some aqui E em `index.html`.
*/
export const UI_ICONS = [
  "add_circle",
  "admin_panel_settings",
  "arrow_back",
  "arrow_forward",
  "auto_awesome",
  "auto_stories",
  "bar_chart",
  "block",
  "bolt",
  "bubble_chart",
  "cancel",
  "check_circle",
  "chevron_right",
  "connected_tv",
  "counter_1",
  "counter_2",
  "emoji_events",
  "error",
  "event_busy",
  "favorite",
  "flag",
  "grain",
  "groups",
  "hexagon",
  "hourglass_bottom",
  "hourglass_empty",
  "info",
  "inventory_2",
  "lock",
  "mail",
  "meeting_room",
  "menu_book",
  "more_time",
  "pause",
  "pause_circle",
  "person_add",
  "person_remove",
  "play_arrow",
  "play_circle",
  "save",
  "search",
  "search_off",
  "send",
  "skip_next",
  "stop_circle",
  "thumb_up",
  "timer",
  "trending_down",
  "trending_up",
  "volunteer_activism",
  "warning",
  "wifi_off",
] as const

/** UI + catálogo do jogo + combos + classificações, sem repetição, em ordem alfabética. */
export const ALL_ICON_NAMES: string[] = [
  ...new Set<string>([
    ...UI_ICONS,
    ...ITEMS.map((i) => i.icon),
    ...COMBOS.map((c) => c.icon),
    ...Object.values(CLASSIFICATION_TEXT).map((c) => c.icon),
  ]),
].sort()
