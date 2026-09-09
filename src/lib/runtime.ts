/** Public builds consume only an exported, allowlisted GitHub snapshot. */
export const publicShowcase = import.meta.env.MODE === "showcase";
