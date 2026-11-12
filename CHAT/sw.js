/* Forever Connect — service worker.
   Only used to display notifications (required on Android) and to bring the open
   chat tab to the front when a notification is tapped. It does not cache or store anything. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const base = (data.url || '').split('#')[0];
    const target = all.find((c) => c.url.split('#')[0] === base) || all[0];
    if (target) {
      try { await target.focus(); } catch (err) {}
      target.postMessage({ type: 'fc-open', kind: data.kind || 'msg' });
      return;
    }
    // The chat page was closed (the session ended with it) — open the app home.
    if (data.url && self.clients.openWindow) await self.clients.openWindow(data.url);
  })());
});
