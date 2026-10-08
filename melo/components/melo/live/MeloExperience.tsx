"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MotionConfig } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "../../ui/sheet";
import {
  useLiveMelo,
  type AIConnectionState,
  type AIModelState,
} from "./useLiveMelo";
import { MeloHero } from "../MeloHero";
import { AIChat } from "./AIChat";
import { EmotionAnalysis } from "./EmotionAnalysis";
import { MusicRecommendation } from "./MusicRecommendation";
import { MemorySpace } from "./MemorySpace";
import { Journey } from "./Journey";
import { Contact } from "./Contact";
import { CompanionExtras } from './CompanionExtras';
const nav = [
  ["聊聊", "chat"],
  ["情绪", "emotion"],
  ["音乐", "music"],
  ["记忆", "memory"],
  ["旅程", "journey"],
];
function ConnectionStatus({
  state,
  modelState,
  className,
  onRetry,
  style,
}: {
  state: AIConnectionState;
  modelState: AIModelState;
  className: string;
  onRetry: () => void;
  style?: CSSProperties;
}) {
  const labels: Record<AIConnectionState, string> = {
    checking: "连接中…",
    configured:
      modelState === "ready"
        ? "最近已回复"
        : modelState === "error"
          ? "模型异常"
          : "AI 待验证",
    unconfigured: "AI 未配置",
    offline: "连接失败 · 重试",
  };
  if (state === "offline") {
    return (
      <button
        type="button"
        className={`${className} connection-retry`}
        onClick={onRetry}
        aria-label="AI 服务连接失败，点击重试"
        aria-live="polite"
        style={style}
      >
        {labels[state]}
      </button>
    );
  }
  return (
    <span className={className} role="status" aria-live="polite" style={style}>
      {labels[state]}
    </span>
  );
}
export default function MeloExperience() {
  const melo = useLiveMelo();
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [still, setStill] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.65);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  const noMotion = melo.reduced || still;
  const menuTarget = useRef<string | null>(null);
  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menu]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.dataset.motion = noMotion ? "reduced" : "full";
    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    const click = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      const target = id ? document.querySelector<HTMLElement>(id) : null;
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      history.replaceState(null, "", id!);
      const focus = () => {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      };
      if (lenis) lenis.scrollTo(target, { offset: 0, onComplete: focus });
      else {
        target.scrollIntoView({ behavior: "instant" });
        focus();
      }
    };
    document.addEventListener("click", click);
    const context = gsap.context(() => {
      if (noMotion) return;
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (t) => lenis?.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.from(el, {
          y: 35,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
        }),
      );
      gsap.utils.toArray<HTMLElement>(".music-world .world-title").forEach((el) =>
        gsap.to(el, {
          y: -20,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }),
      );
      gsap.to(".music-world .record-cover", {
        scale: 1.035,
        ease: "none",
        scrollTrigger: { trigger: ".listen-section", start: "top bottom", end: "center top", scrub: 1.4 },
      });
    }, root);
    return () => {
      document.removeEventListener("click", click);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      context.revert();
    };
  }, [noMotion]);
  return (
    <MotionConfig reducedMotion={noMotion ? "always" : "never"}>
      <div ref={root} className={`live-melo cloud-experience ${noMotion ? "live-still" : ""}`}>
        <a href="#chat" className="skip-link">
          跳到 Melo 聊天
        </a>
        <header className={`live-nav ${scrolled ? "is-scrolled" : ""}`}>
          <a href="#home" className="wordmark">
            melo <span>✳</span>
          </a>
          <nav aria-label="主导航" className={menu ? "open" : ""}>
            {nav.map(([text, id]) => (
              <a key={id} href={`#${id}`}>
                {text}
              </a>
            ))}
          </nav>
          <div>
            {scrolled && <a href="#chat" className="world-nav-talk">Talk to Melo ↗</a>}
            <button
              className="live-motion"
              onClick={() => setStill(!still)}
              disabled={melo.reduced}
              aria-pressed={noMotion}
              aria-label={noMotion ? "动态效果已减少" : "减少动态效果"}
            >
              {noMotion ? "静态" : "动态"}
              <i />
            </button>
            <ConnectionStatus
              state={melo.connectionState}
              modelState={melo.modelState}
              className="live-connect"
              onRetry={() => void melo.load()}
            />
            <Sheet open={menu} onOpenChange={setMenu}>
              <SheetTrigger asChild>
                <button
                  className="live-menu"
                  aria-label="打开导航"
                  onClick={() => {
                    menuTarget.current = null;
                  }}
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent
                className="melo-menu-panel"
                showCloseButton={false}
                onCloseAutoFocus={(e) => {
                  if (menuTarget.current) {
                    e.preventDefault();
                    document
                      .getElementById(menuTarget.current)
                      ?.focus({ preventScroll: true });
                    menuTarget.current = null;
                  }
                }}
              >
                <SheetTitle className="sr-only">Melo 导航</SheetTitle>
                <SheetDescription className="sr-only">
                  前往聊天、情绪、音乐、记忆和旅程。
                </SheetDescription>
                <SheetClose className="melo-menu-close" aria-label="关闭导航">
                  <X size={24} />
                </SheetClose>
                <a
                  href="#home"
                  className="menu-brand"
                  onClick={() => {
                    menuTarget.current = "home";
                    setMenu(false);
                  }}
                >
                  melo ✳
                </a>
                <nav aria-label="移动端导航">
                  {nav.map(([text, id], i) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      style={{
                        transitionDelay: menu ? `${(i + 1) * 60}ms` : "0ms",
                      }}
                      onClick={() => {
                        menuTarget.current = id;
                        setMenu(false);
                      }}
                    >
                      {text}
                    </a>
                  ))}
                </nav>
                <ConnectionStatus
                  state={melo.connectionState}
                  modelState={melo.modelState}
                  className="menu-connection"
                  onRetry={() => void melo.load()}
                  style={{ transitionDelay: menu ? "320ms" : "0ms" }}
                />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main>
          {melo.demo&&<aside className="demo-banner" role="status">DEMO MODE · 预设演示，AI 回应为演示脚本，记录独立保存在本机。<a href="?#chat">退出演示，使用真实 AI</a></aside>}
          <MeloHero reduced={noMotion} melo={melo} />
          <div className="music-world" data-reduced={noMotion}>
          <AIChat melo={melo} />
          <EmotionAnalysis melo={melo} />
          <MusicRecommendation melo={melo} />
          <MemorySpace melo={melo} />
          <Journey melo={melo} />
          <CompanionExtras melo={melo} />
          <Contact />
          </div>
        </main>
        {melo.error && (
          <div className="live-toast error" role="alert">
            <p>{melo.error}</p>
            <button disabled={!!melo.busy} onClick={melo.retry}>重新尝试</button>
            {!melo.demo && <a href="?demo=1#chat">体验预设演示</a>}
            <button aria-label="关闭错误提示" onClick={() => melo.setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {melo.status && (
          <div className="live-toast success" role="status" key={melo.status}>
            <p>{melo.status}</p>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
