import { Denops } from "https://deno.land/x/denops_std@v1.0.0/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v1.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v1.0.0/helper/mod.ts";

async function req(q: unknown): Promise<any[]> {
  const resp = await fetch(
    `https://customsearch.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${q}`,
    {
      headers: {
        accept: "application/json",
      },
    }
  );
  const json = await resp.json();
  const results = json.items.map((i) => ({
    title: i["title"],
    link: i["link"],
  }));

  return results;
}

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async search(q: unknown): Promise<void> {
      ensureString(q);
      const res = await req(q);
      await res.forEach((result, i) => {
        denops.call("setline", 3 * i + 1, `title: ${result["title"]}`);
        denops.call("setline", 3 * i + 2, `link: ${result["link"]}`);
        denops.call("setline", 3 * i + 3, "----");
      });
    },
  };

  await execute(
    denops,
    `command! -nargs=1 GoogleSearch call denops#request('${denops.name}', 'search', [<q-args>])`
  );
}
