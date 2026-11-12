// Store-Build-Erkennung (Play-Store-Edition von VitalOS). Owner-/Private-Builds
// setzen weder VITE_VOS_EDITION noch VITE_VOS_PRODUCT_BUILD und bleiben unverändert.
const STORE_EDITIONS = ["store", "observe", "operate"];

export const IS_STORE_BUILD = STORE_EDITIONS.includes(import.meta.env?.VITE_VOS_EDITION)
  || import.meta.env?.VITE_VOS_PRODUCT_BUILD === "1";
