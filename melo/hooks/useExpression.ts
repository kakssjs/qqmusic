"use client";
import { useCallback, useState } from 'react';
import { expressions, type Expression } from '../data/expressions';
export function useExpression(initial: Expression = 'happy') {
  const [expression, update] = useState<Expression>(initial);
  const setExpression = useCallback((next: Expression) => {
    if (expressions.some(e => e.id === next)) update(next);
  }, []);
  return { expression, setExpression };
}
