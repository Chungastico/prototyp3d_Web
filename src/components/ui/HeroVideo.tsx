'use client';

import React, { useRef } from 'react';

interface HeroVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

/**
 * A video component that plays once and stays on the last frame.
 */
export default function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className={className}
      muted
      autoPlay
      playsInline
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  );
}
