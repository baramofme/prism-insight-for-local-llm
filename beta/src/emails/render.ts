import { render } from "@react-email/render";
import type { ReactElement } from "react";

export async function renderEmailToHtml(component: ReactElement): Promise<string> {
  return await render(component, { pretty: true });
}

export async function renderEmailToText(component: ReactElement): Promise<string> {
  return await render(component, { plainText: true });
}
