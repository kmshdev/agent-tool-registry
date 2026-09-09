export type Entry = {
  id: string;
  name: string;
  source: string;
  kind: string;
  status: string;
  category: string;
  description: string;
  tags: string[];
  path?: string;
  paths?: string[];
  url?: string;
  owner?: string;
  language?: string;
  stars?: number;
  version?: string;
  command?: string;
  model?: string;
  evidence: string;
  categoryBasis?: string;
  dependencies?: string[];
  observedAt?: string;
  updatedAt?: string;
  starredAt?: string;
  favorite?: boolean;
  notes?: string;
  system?: boolean;
  archived?: boolean;
};
export type Source = {
  id: string;
  name: string;
  status: string;
  count: number;
  updatedAt?: string;
  starredAt?: string;
  attemptedAt?: string;
  error?: string;
};
export type Activity = {
  id: string;
  source: string;
  at: string;
  message: string;
  detail: string;
  status: string;
};
export type Snapshot = {
  revision: number;
  entries: Entry[];
  sources: Source[];
  categories: string[];
  activity: Activity[];
};
export const color = (category: string) =>
  ({
    Agents: "#b4a1ed",
    "Browser & web": "#75bbf4",
    Development: "#91cca7",
    Automation: "#edb278",
    Infrastructure: "#df9aad",
    Data: "#dfca7e",
    Design: "#ea9b84",
    Media: "#afbddf",
    Search: "#7bd2c2",
    System: "#9caaa7",
    Other: "#b2b2b2",
  })[category] ?? "#b2b2b2";
export const relative = (date?: string) => {
  if (!date) return "Never";
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return minutes < 1
    ? "Just now"
    : minutes < 60
      ? `${minutes}m ago`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)}h ago`
        : `${Math.floor(minutes / 1440)}d ago`;
};
