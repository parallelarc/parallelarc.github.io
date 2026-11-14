import { lazy, Suspense, useEffect, useState } from "react";
import { useBrowseNavigation } from "../hooks/useBrowseNavigation";

const PortfolioShell = lazy(() => import("./PortfolioShell"));
const COMPACT_QUERY =
  "(max-width: 767px), (max-width: 1023px) and (pointer: coarse)";

function Portfolio() {
  const navigation = useBrowseNavigation();
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_QUERY).matches
  );
  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const update = () => setCompact(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Device determines the initial mode. Explicit browse/terminal URLs preserve
  // the visitor's choice across viewport changes and browser navigation.
  return (
    <Suspense fallback={<p role="status">Loading…</p>}>
      <PortfolioShell navigation={navigation} compact={compact} />
    </Suspense>
  );
}

export default Portfolio;
