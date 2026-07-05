import { buildScopebaseSection } from "./sections/scopeBase";
import { buildSection1Section } from "./sections/section-1";
import { buildSection2Section } from "./sections/section-2";
import { buildSection3Section } from "./sections/section-3";
import { buildSection4Section } from "./sections/section-4";
import { buildSection5Section } from "./sections/section-5";
import { buildSection6Section } from "./sections/section-6";
import { buildSection7Section } from "./sections/section-7";
import { buildSection8Section } from "./sections/section-8";
import { buildSection9Section } from "./sections/section-9";
import {
  buildGamepadFocusRingStylesheet,
  buildPullModelsStylesheet,
  buildModalPortalStylesheet,
} from "./sections/gamepadAndPullModels";

/** Scoped Deck/QAM CSS injected once under `.bonsai-scope`. */
export function buildBonsaiScopeStylesheet(): string {
  return (
    buildScopebaseSection() +
    buildSection1Section() +
    buildSection2Section() +
    buildSection3Section() +
    buildSection4Section() +
    buildSection5Section() +
    buildSection6Section() +
    buildSection7Section() +
    buildSection8Section() +
    buildSection9Section() +
    buildGamepadFocusRingStylesheet() +
    buildPullModelsStylesheet()
  );
}

export { buildGamepadFocusRingStylesheet, buildPullModelsStylesheet, buildModalPortalStylesheet };
