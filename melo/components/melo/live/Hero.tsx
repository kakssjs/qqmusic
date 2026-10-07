"use client";
import { useEffect, useRef, useState } from "react";
const videoUrl = "/hero-clouds.mp4";
export function Hero({ reduced = false }: { reduced?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.muted = true;
    element.defaultMuted = true;
    if (reduced || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.pause();
      return;
    }
    const resume = () => {
      if (document.visibilityState === "visible")
        void element.play().catch(() => {});
    };
    resume();
    element.addEventListener("canplay", resume);
    document.addEventListener("visibilitychange", resume);
    document.addEventListener("pointerdown", resume, { once: true });
    return () => {
      element.pause();
      element.removeEventListener("canplay", resume);
      document.removeEventListener("visibilitychange", resume);
      document.removeEventListener("pointerdown", resume);
    };
  }, [reduced]);
  return (
    <section id="home" className="meet-hero video-hero h-screen font-geist">
      <img
        src="/hero-clouds.jpg"
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
      />
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-clouds.jpg"
        src={videoUrl}
        aria-hidden="true"
        onError={() => setFailed(true)}
      />
      {failed && (
        <img
          src="/hero-clouds.jpg"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
          alt=""
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] md:hidden mobile-gradient"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] hidden md:block desktop-gradient"
      />
      <div className="video-hero-content relative z-10 flex flex-1 flex-col justify-between px-5 py-4 sm:px-6 sm:py-6 md:px-12 md:py-10 lg:px-16">
        <div className="max-w-3xl pt-2 sm:pt-4 md:pt-8">
          <p className="meet-overline">MEET YOUR MUSIC COMPANION</p>
          <div className="meet-title">
            <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-6xl lg:text-7xl">
              Melo
            </h1>
            <p>AI音乐陪伴伙伴</p>
          </div>
        </div>
        <div className="video-hero-bottom max-w-3xl pb-2 sm:pb-4 md:pb-6">
          <h2>
            有时候，你需要的不是一首歌，
            <br />
            <span>而是一位懂你的朋友。</span>
          </h2>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-6 sm:gap-4 md:mt-8">
            <a href="#chat" className="meet-button">
              开始和 Melo 聊聊 <span>✳</span>
            </a>
          </div>
          <div className="ability-tags mt-6 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md sm:mt-8 sm:gap-4 sm:px-5 sm:py-3.5 md:mt-10">
            <div className="flex -space-x-2.5" aria-hidden="true">
              {["774909", "1222271", "91227"].map((id) => (
                <img
                  key={id}
                  src={`https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=100`}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-white/30 object-cover sm:h-8 sm:w-8"
                />
              ))}
            </div>
            <div>
              <span>Emotion AI</span>
              <i />
              <span>Music Companion</span>
              <i />
              <span>Memory</span>
            </div>
          </div>
          <a href="#chat" className="meet-scroll">
            SCROLL TO CONNECT <span />
          </a>
        </div>
      </div>
    </section>
  );
}
