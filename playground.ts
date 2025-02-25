import type { PlaygroundConfig, PlaygroundConfigs } from "../playground/typings";
import type { Attributes } from "./src";
import { addHooks } from "./src/utils/freezer";

function definePPT(
  title: string,
  taskId: string,
  url?: string,
  note?: string
): PlaygroundConfig<Attributes> {
  return {
    kind: "Slide",
    src: () => import("./src"),
    options: { title, scenePath: `/Slide/${taskId}/${title}` },
    attributes: { taskId, url, note },
    addHooks,
  };
}

const options: PlaygroundConfigs<Attributes> = [
  definePPT(
    "星空1",
    "c734c7e353614685916be03569cd6ed9",
    "https://convertcdn.netless.link/dynamicConvert",
    "https://convertcdn.netless.link/dynamicConvert/c734c7e353614685916be03569cd6ed9/jsonOutput/note.json"
  ),
  definePPT("星空2", "9abed6605bbc11ec88a83b917638a00c"),
  definePPT("星空3", "9abed6605bbc11ec88a83b917638a00c"),
];

export default options;
