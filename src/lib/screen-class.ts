/**
 * Split a page shell's classes so the header stays a sibling of the scroller.
 * Bottom padding moves into the scrolling content. It clears the tab bar
 * at the end of the list, and it scrolls away so rows can pass under a
 * translucent native tab bar. The gap stays on the shell for the browser,
 * and the matching `screen-pad-*` class recreates that gap inside the iOS
 * scroller.
 */
export function partitionScreenClass(className = ""): { main: string; body: string } {
  const tokens = className.trim().split(/\s+/).filter(Boolean);
  const main: string[] = [];
  const body: string[] = [];
  let gap: string | null = null;
  for (const token of tokens) {
    if (token.startsWith("pb-")) {
      body.push(token);
      continue;
    }
    if (token.startsWith("gap-")) gap = token;
    main.push(token);
  }
  if (gap) body.push(gap);
  if (gap === "gap-4") body.push("screen-pad-4");
  else if (gap === "gap-6") body.push("screen-pad-6");
  else if (gap === "gap-8") body.push("screen-pad-8");
  return { main: main.join(" "), body: body.join(" ") };
}
