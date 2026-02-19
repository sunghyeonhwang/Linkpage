const TRACK_BASE = '/api/public/track';

function send(url: string, body: object) {
  const json = JSON.stringify(body);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([json], { type: 'application/json' }));
    return;
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json,
    keepalive: true,
  }).catch(() => {});
}

export function trackView(profileId: string) {
  send(`${TRACK_BASE}/view`, { profileId });
}

export function trackClick(linkId: string, profileId: string) {
  send(`${TRACK_BASE}/click`, { linkId, profileId });
}
