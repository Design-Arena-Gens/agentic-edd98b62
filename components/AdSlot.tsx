"use client";
import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT, DEFAULT_AD_SLOT } from '../config/ads';

type Props = {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
};

export default function AdSlot({ slot = DEFAULT_AD_SLOT, style, format = 'auto' }: Props) {
  const ref = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) {
    return <div className="ad" aria-label="Ad placeholder" />;
  }

  return (
    <ins
      ref={ref as any}
      className="adsbygoogle ad"
      style={{ display: 'block', minHeight: 90, ...(style || {}) }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
