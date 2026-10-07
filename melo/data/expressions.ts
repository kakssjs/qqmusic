export type Expression = 'happy' | 'wink' | 'surprise' | 'listen' | 'calm' | 'love' | 'care';
export type ExpressionConfig = { id: Expression; label: string; line: string; spriteIndex: number };
export const expressions: ExpressionConfig[] = [
  { id: 'happy', label: '开心', line: '今天也想，把好心情分你一半。', spriteIndex: 0 },
  { id: 'wink', label: '俏皮', line: '嘿，给你一个专属的音乐暗号。', spriteIndex: 1 },
  { id: 'surprise', label: '惊喜', line: '下一首，会不会刚好是你的惊喜？', spriteIndex: 2 },
  { id: 'listen', label: '沉浸', line: '先不说话，一起听完这段旋律。', spriteIndex: 3 },
  { id: 'calm', label: '温柔', line: '慢一点没关系，我在这里。', spriteIndex: 4 },
  { id: 'love', label: '比心', line: '喜欢的旋律，和喜欢的你。', spriteIndex: 5 },
  { id: 'care', label: '关心', line: '今天辛苦啦，不必一直很有力气。', spriteIndex: 6 },
];

export function expressionForMood(mood: string): Expression {
  if (mood === 'bright') return 'happy';
  if (mood === 'tired' || mood === 'sad') return 'care';
  if (mood === 'focus') return 'listen';
  return 'calm';
}

function detectMessageExpression(text: string): Expression | undefined {
  if (/累|失败|难过|压力|失落|难受|焦虑|疲惫|委屈|孤独|担心/.test(text)) return 'care';
  if (/开玩笑|笑话|逗你|哈哈|嘻嘻|有趣|调皮/.test(text)) return 'wink';
  if (/惊喜|惊讶|意外|没想到|真的吗|居然/.test(text)) return 'surprise';
  if (/喜欢|爱你|心动|比心|好喜欢/.test(text)) return 'love';
  if (/听歌|音乐|旋律|专注|沉浸|聆听|放首歌/.test(text)) return 'listen';
  if (/开心|快乐|高兴|很好|成功|棒极了|太棒/.test(text)) return 'happy';
}

export function expressionForMessage(text: string, reply = ''): Expression {
  return detectMessageExpression(text) ?? detectMessageExpression(reply) ?? 'calm';
}
