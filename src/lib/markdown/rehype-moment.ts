import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

type MomentElement = Element & {
  tagName: "moment";
  properties: {
    id: string;
    reasoning: string;
  };
};

const isMomentElement = (node: Element): node is MomentElement =>
  node.tagName === "moment" && typeof node.properties?.id === "string";

export const rehypeMoment: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node: Element) => {
      if (!isMomentElement(node)) return;

      // Transform the moment element properties into a more React-friendly format
      (node as any).properties = {
        className: "my-2 rounded-lg border bg-muted p-4",
        "data-moment-id": node.properties.id,
        "data-moment-reasoning": node.properties.reasoning,
      };
    });
  };
};
