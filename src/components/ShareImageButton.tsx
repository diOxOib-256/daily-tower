import { useState } from 'react';
import { openXShare } from '../utils/share';
import {
  generateProgressShareImage,
  type ProgressShareImageParams,
} from '../utils/shareImage';
import { playSfx } from '../utils/sound';

interface ShareImageButtonProps extends ProgressShareImageParams {
  /** The X post text that accompanies the image. */
  text: string;
  label?: string;
}

/**
 * Builds the progress share image (with the equipped title drawn in) and
 * shares it: Web Share API with the file when available (mobile), else
 * downloads the PNG and opens the X compose screen so the player can
 * attach it.
 */
export function ShareImageButton({
  text,
  label = '🖼️ 画像でシェア',
  ...imageParams
}: ShareImageButtonProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => {
      setFeedback((cur) => (cur === message ? null : cur));
    }, 6000);
  };

  const handleClick = async () => {
    if (busy) return;
    playSfx('click');
    setBusy(true);
    try {
      const blob = await generateProgressShareImage(imageParams);
      const file = new File([blob], 'daily-tower-share.png', {
        type: 'image/png',
      });
      const nav = navigator as Navigator & {
        canShare?: (data: { files: File[] }) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        showFeedback('共有しました。');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'daily-tower-share.png';
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 4000);
        await openXShare(text);
        showFeedback(
          'シェア画像を保存しました。Xの投稿画面で画像を添付してください。',
        );
      }
    } catch {
      showFeedback('シェア画像を作成できませんでした。');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-500/40 bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-fuchsia-200 transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
      >
        <span>{label}</span>
      </button>
      {feedback && (
        <p
          role="status"
          className="max-w-xs text-center text-[11px] leading-snug text-amber-300"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
