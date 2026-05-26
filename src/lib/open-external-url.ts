export function openExternalUrl(url: string): Window | null {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return null;
}

export function openPendingExternalTab(): Window | null {
  const tab = window.open("about:blank", "_blank");
  if (tab) {
    try {
      tab.opener = null;
    } catch {
      // Ignore cross-browser opener assignment errors.
    }
  }
  return tab;
}

export function navigatePendingExternalTab(tab: Window | null, url: string): void {
  if (tab && !tab.closed) {
    tab.location.replace(url);
    return;
  }
  openExternalUrl(url);
}
