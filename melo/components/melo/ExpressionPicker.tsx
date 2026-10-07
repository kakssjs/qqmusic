"use client";
import { useEffect, useRef } from 'react';
import { expressions, type Expression } from '../../data/expressions';
import { PaintedExpression } from './PaintedExpression';
export function ExpressionPicker({ expression, setExpression, close, reduced }: { expression: Expression; setExpression: (e: Expression) => void; close: () => void; reduced: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key) && panel.current?.contains(document.activeElement)) {
        e.preventDefault();
        const buttons = [...panel.current.querySelectorAll<HTMLButtonElement>('.expression-option')];
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? 6 : (current + (e.key === 'ArrowRight'?1:6)) % 7;
        buttons[next]?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [close]);
  return <div ref={panel} id="expression-picker" className="expression-picker" role="group" aria-label="Melo 表情选择器">
    <div className="picker-heading"><span>此刻，想看见哪一个我？</span><button onClick={close} aria-label="关闭表情选择器">×</button></div>
    <div className="expression-options">{expressions.map(e => <button key={e.id} className="expression-option" aria-label={`选择${e.label}表情`} aria-pressed={expression===e.id} onClick={() => setExpression(e.id)}>
      <span className="expression-avatar painted-avatar"><PaintedExpression expression={e.id} reduced={reduced} thumbnail/></span><small>{e.label}</small>
    </button>)}</div>
  </div>;
}
