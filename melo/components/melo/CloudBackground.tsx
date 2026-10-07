"use client";

import { useEffect, useRef, useState } from "react";

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

export function CloudBackground({ reduced }: { reduced: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [videoAllowed, setVideoAllowed] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation })
      .connection;
    const updatePreference = () => {
      const limitedData =
        connection?.saveData ||
        connection?.effectiveType === "slow-2g" ||
        connection?.effectiveType === "2g";
      setVideoAllowed(!reduced && !limitedData);
    };

    updatePreference();
    connection?.addEventListener("change", updatePreference);
    return () => connection?.removeEventListener("change", updatePreference);
  }, [reduced]);

  useEffect(() => {
    const element = video.current;
    if (!element || !videoAllowed) return;

    element.muted = true;
    element.defaultMuted = true;
    const resume = () => {
      if (document.visibilityState === "visible") {
        void element.play().catch(() => {});
      } else {
        element.pause();
      }
    };

    resume();
    element.addEventListener("canplay", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      element.pause();
      element.removeEventListener("canplay", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [videoAllowed]);

  return (
    <div className="cloud-background" aria-hidden="true">
      <svg className="cloud-color-defs" width="0" height="0">
        <defs>
          <filter id="melo-cloud-color" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="0.1828 0.6151 0.0621 0 0.06 0.1913 0.6437 0.0650 0 0.12 0.1998 0.6723 0.0679 0 0.18 0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      <img
        className="cloud-poster"
        src="/hero-clouds.jpg"
        alt=""
        fetchPriority="high"
      />
      <img
        className="ice-scene-plate"
        src="/cloud-ice-scene.webp"
        alt=""
        fetchPriority="high"
      />
      {videoAllowed && (
        <video
          ref={video}
          className={`cloud-video ${failed ? "is-failed" : ""}`}
          src="/hero-clouds.mp4"
          poster="/hero-clouds.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        />
      )}
      <div className="cloud-mint-light" />
      <div className="cloud-copy-shade" />
      <div className="cloud-ground-light" />
    </div>
  );
}
