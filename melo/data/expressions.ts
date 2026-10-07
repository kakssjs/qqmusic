export type Expression = 'happy' | 'wink' | 'surprise' | 'listen' | 'calm' | 'love' | 'care';
export const expressions: { id: Expression; label: string; line: string }[] = [
  { id: 'happy', label: '开心', line: '今天也想，把好心情分你一半。' },
  { id: 'wink', label: '俏皮', line: '嘿，给你一个专属的音乐暗号。' },
  { id: 'surprise', label: '惊喜', line: '下一首，会不会刚好是你的惊喜？' },
  { id: 'listen', label: '沉浸', line: '先不说话，一起听完这段旋律。' },
  { id: 'calm', label: '温柔', line: '慢一点没关系，我在这里。' },
  { id: 'love', label: '比心', line: '喜欢的旋律，和喜欢的你。' },
  { id: 'care', label: '关心', line: '今天辛苦啦，不必一直很有力气。' },
];
export function expressionForMessage(text: string): Expression {
  if (/累|失败|难过|压力|失落|难受|焦虑|疲惫/.test(text)) return 'care';
  if (/开心|快乐|高兴|很好|成功/.test(text)) return 'happy';
  return 'calm';
}
