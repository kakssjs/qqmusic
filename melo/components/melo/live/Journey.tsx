"use client";
import { monthlyJournal } from "../../../lib/music/monthly-journal";
import { personality, moodNames } from "../../../data/experience";
import { findTrack } from "../../../data/music/catalog";
import { recordTrack } from "../../../lib/music/recommendation";
import { CharacterPresence } from "../CharacterPresence";
import type { LiveMelo } from "./useLiveMelo";
export function Journey({ melo }: { melo: LiveMelo }) {
  const journal = monthlyJournal(melo.records),
    p = personality(melo.records);
  const story = melo.records.find((e) => e.type === "story")?.payload.story;
  return (
    <section id="journey" className="world-section journal-section">
      <div className="world-section-meta">
        <span>08 / MY JOURNEY</span>
        <span>留给自己的，一本音乐日记</span>
      </div>
      <header className="monthly-journal-intro reveal">
        <div>
          <p className="world-label">MONTHLY MUSIC JOURNAL</p>
          <h2>YOUR {journal.name}</h2>
          <strong className="journal-month">
            {String(journal.month).padStart(2, "0")}
          </strong>
        </div>
        <div className="journal-opening">
          <p>{journal.summary}</p>
          <small>
            {Math.floor(journal.seconds / 60)} MINUTES · {journal.nights} NIGHTS
            · {journal.moments.length} MOMENTS
          </small>
          <span>每一个数字，都来自我们真实一起度过的时间。</span>
        </div>
      </header>
      <div className="journal-personality reveal">
        <p className="world-label">01 / YOUR MUSIC PERSONALITY</p>
        <h3>{p.title}</h3>
        <p>{p.caption}</p>
        <div className="personality-words">
          <span>{p.dominant}</span>
          <span>{p.time}</span>
          {p.keywords.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </div>
      <div className="monthly-moments reveal">
        <div className="monthly-moments-heading">
          <p className="world-label">02 / THREE MOMENTS</p>
          <h3>这个月，留住了这些。</h3>
        </div>
        {journal.moments.length ? (
          <div className="journal-moment-grid">
            {journal.moments.slice(0, 3).map((e) => {
              const track = findTrack(recordTrack(e));
              return (
                <article key={e.id}>
                  <time>
                    {new Date(
                      e.payload.momentAt || e.createdAt,
                    ).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  {track && (
                    <img
                      src={track.cover}
                      alt=""
                      width={250}
                      height={250}
                      loading="lazy"
                    />
                  )}
                  <h4>{e.payload.text || "一段音乐旅程"}</h4>
                  <p>
                    {e.payload.journey
                      ? `${moodNames[e.payload.journey.from] || "此刻"} → ${e.payload.journey.targetLabel}`
                      : moodNames[e.payload.mood || ""] || "这一刻的心情"}
                  </p>
                  <button
                    className="world-text-button"
                    onClick={() => {
                      melo.replay(e);
                      document
                        .getElementById(
                          e.payload.journey ? "mood-journey" : "music",
                        )
                        ?.scrollIntoView({
                          behavior: melo.reduced ? "auto" : "smooth",
                        });
                    }}
                  >
                    再听一次 ↗
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="journal-empty">
            还没有这个月的记忆。<a href="#chat">从一句今天的心情开始 ↗</a>
          </p>
        )}
      </div>
      <div className="journal-sound reveal">
        <div>
          <p className="world-label">03 / YOUR SOUND</p>
          <h3>
            属于你的声音，
            <br />
            正在慢慢形成。
          </h3>
        </div>
        <dl>
          <div>
            <dt>偏爱的音乐能量</dt>
            <dd>{p.energy}</dd>
          </div>
          <div>
            <dt>喜欢的声音</dt>
            <dd>
              {melo.preferences.likedStyles.join(" / ") ||
                "听到喜欢的歌，就把它留下。"}
            </dd>
          </div>
          <div>
            <dt>常常靠近的时刻</dt>
            <dd>
              {melo.preferences.preferredScenes.join(" · ") ||
                "每一段真实聆听，都是一个新的开始。"}
            </dd>
          </div>
        </dl>
      </div>
      <div className="journal-signoff reveal">
        <CharacterPresence melo={melo} />
        <div>
          <p className="world-label">04 / OUR NEXT PAGE</p>
          <h3>
            下个月，
            <br />
            也一起听吧。
          </h3>
          {story ? (
            <p className="journal-story">{story}</p>
          ) : (
            <p>我们一起听过的声音，会把真实的瞬间连成故事。</p>
          )}
          <button
            className="world-text-button"
            disabled={!!melo.busy || !melo.ready || !melo.records.length}
            onClick={() => void melo.story()}
          >
            {melo.busy === "story"
              ? "Melo 正在写…"
              : story
                ? "更新我的音乐故事 ↗"
                : "把我们的瞬间写成故事 ↗"}
          </button>
          <small>音乐故事依据已保存记录生成，可能包含本月之前的瞬间。</small>
        </div>
      </div>
    </section>
  );
}
