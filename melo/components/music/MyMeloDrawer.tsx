"use client";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "../ui/sheet";
import { MyMelo } from "./MyMelo";
import { CompanionExtras } from "../melo/live/CompanionExtras";
import type { LiveMelo } from "../melo/live/useLiveMelo";
export function MyMeloDrawer({ melo }: { melo: LiveMelo }) {
  return (
    <Sheet open={melo.myMeloOpen} onOpenChange={melo.setMyMeloOpen}>
      <SheetContent side="right" className="my-melo-drawer" data-lenis-prevent>
        <SheetTitle>MY MELO · 我的音乐空间</SheetTitle>
        <SheetDescription>
          收藏、听过的声音，和那些被留下的瞬间。
        </SheetDescription>
        <MyMelo melo={melo} />
        <div className="drawer-routes">
          <button
            onClick={() => {
              melo.setMyMeloOpen(false);
              document.getElementById("journey")?.scrollIntoView();
            }}
          >
            本月音乐足迹 ↗
          </button>
          <h3>音乐旅程</h3>
          {melo.records
            .filter((e) => e.payload.journey?.outcome)
            .slice(0, 5)
            .map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  melo.replay(e);
                  melo.setMyMeloOpen(false);
                  document.getElementById("mood-journey")?.scrollIntoView();
                }}
              >
                {e.payload.journey?.targetLabel} · 4 TRACKS ↗
              </button>
            ))}
          <button
            onClick={() => {
              melo.setMyMeloOpen(false);
              document.getElementById("memory")?.scrollIntoView();
            }}
          >
            被留下来的音乐瞬间 ↗
          </button>
        </div>
        <CompanionExtras melo={melo} />
      </SheetContent>
    </Sheet>
  );
}
