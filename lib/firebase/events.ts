// Single source of truth for Firebase Analytics (GA4) events.
// Event names use GA4 snake_case. login/logout/sign_up/search/page_view
// reuse GA4 recommended names for built-in reporting.
export interface AnalyticsEventMap {
  page_view: { page_path: string };
  login: { method: string };
  logout: Record<string, never>;
  sign_up: { method: string };
  signup_step: { step: number; step_name: string };
  signup_abandon: { step: number };
  centro_select: { centro_id: string; source: "list" | "map" | "autocomplete" };
  centro_view_insumos: { centro_id: string };
  centro_share: { centro_id: string };
  insumo_filter: { filter_type: string; value: string };
  map_interaction: { action: "marker_click" | "zoom"; centro_id?: string };
  nav_click: { target: string };
  search: { search_term: string; context: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
