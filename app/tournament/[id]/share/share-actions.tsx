'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

export function ShareActions({ url, title, tournamentId }: { url: string; title: string; tournamentId: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    pendo.track('tournament_qr_code_generated', { tournament_id: tournamentId });
  }, [tournamentId]);

  async function copyUrl() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    pendo.track('tournament_url_shared', { tournament_id: tournamentId, share_method: 'copy' });
  }

  async function shareUrl() {
    if (navigator.share) {
      await navigator.share({ title, url });
      pendo.track('tournament_url_shared', { tournament_id: tournamentId, share_method: 'native' });
      return;
    }

    await copyUrl();
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        data-action="copy-url"
        onClick={copyUrl}
        className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-white px-3 py-3 text-sm font-bold uppercase tracking-wider text-ink shadow-hard active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button
        type="button"
        data-action="share-url"
        onClick={shareUrl}
        className="inline-flex items-center justify-center gap-2 border-2 border-blood bg-blood px-3 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-hard-blood active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share
      </button>
    </div>
  );
}
