import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const LANDING_PATHS = new Set([
  "/",
  "/gioi-thieu",
  "/thanh-toan",
  "/huong-dan",
  "/tai-lieu",
]);

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (!LANDING_PATHS.has(location.pathname) || location.hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.hash]);

  return null;
}
