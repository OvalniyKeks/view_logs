import type { LogItem } from "@/controllers/ApiController";

import type { ShallowRef } from "vue";

export interface VirtualScrollProps {
  container: HTMLElement;
  items: ShallowRef<Array<LogItem>>;
  itemHeight: number;
  indexEl?: number
}

