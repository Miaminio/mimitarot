export interface TarotCard {
  id: number;
  name: string;
  nameEn: string;
  arcana: 'major' | 'minor';
  suit?: string;
  upright: string;
  reversed: string;
  description: string;
}

const majorArcana: TarotCard[] = [
  { id: 0, name: '愚者', nameEn: 'The Fool', arcana: 'major', upright: '新开始、冒险、自由', reversed: '鲁莽、冒险、停滞', description: '愚者代表着一段全新旅程的开始，象征着无限可能与纯真的勇气。' },
  { id: 1, name: '魔术师', nameEn: 'The Magician', arcana: 'major', upright: '创造力、意志力、技能', reversed: '欺骗、操控、缺乏方向', description: '魔术师掌握四元素之力，代表将想法化为现实的能力。' },
  { id: 2, name: '女祭司', nameEn: 'The High Priestess', arcana: 'major', upright: '直觉、神秘、内在智慧', reversed: '隐秘、脱离直觉', description: '女祭司守护潜意识的大门，象征深层智慧与直觉力量。' },
  { id: 3, name: '女皇', nameEn: 'The Empress', arcana: 'major', upright: '丰盛、母性、自然', reversed: '依赖、空虚、过度放纵', description: '女皇象征大地的丰饶与创造力，代表滋养与成长。' },
  { id: 4, name: '皇帝', nameEn: 'The Emperor', arcana: 'major', upright: '权威、结构、稳定', reversed: '专制、僵化、控制', description: '皇帝代表秩序与权威，象征领导力与坚实的基础。' },
  { id: 5, name: '教皇', nameEn: 'The Hierophant', arcana: 'major', upright: '传统、信仰、教导', reversed: '叛逆、非传统', description: '教皇是精神世界的引导者，代表传统智慧与信仰体系。' },
  { id: 6, name: '恋人', nameEn: 'The Lovers', arcana: 'major', upright: '爱情、和谐、选择', reversed: '失衡、不和谐、错误选择', description: '恋人牌象征深层的连接与重要的人生抉择。' },
  { id: 7, name: '战车', nameEn: 'The Chariot', arcana: 'major', upright: '决心、胜利、意志力', reversed: '失控、缺乏方向', description: '战车代表凭借意志力克服障碍，勇往直前。' },
  { id: 8, name: '力量', nameEn: 'Strength', arcana: 'major', upright: '勇气、耐心、内在力量', reversed: '自我怀疑、软弱', description: '力量牌展现的是温柔而坚定的内在勇气。' },
  { id: 9, name: '隐士', nameEn: 'The Hermit', arcana: 'major', upright: '内省、寻求真理、独处', reversed: '孤立、逃避', description: '隐士提灯独行，象征向内探索与灵性觉醒。' },
  { id: 10, name: '命运之轮', nameEn: 'Wheel of Fortune', arcana: 'major', upright: '命运、转变、机遇', reversed: '厄运、抗拒变化', description: '命运之轮永不停息，提醒我们万事皆有轮回。' },
  { id: 11, name: '正义', nameEn: 'Justice', arcana: 'major', upright: '公正、真相、因果', reversed: '不公、逃避责任', description: '正义牌代表因果法则与公平裁决。' },
  { id: 12, name: '倒吊人', nameEn: 'The Hanged Man', arcana: 'major', upright: '牺牲、放手、新视角', reversed: '拖延、抗拒', description: '倒吊人以全新的角度看世界，在放手中获得领悟。' },
  { id: 13, name: '死神', nameEn: 'Death', arcana: 'major', upright: '结束、转变、新生', reversed: '抗拒改变、停滞', description: '死神并非终结，而是深刻蜕变与重生的开始。' },
  { id: 14, name: '节制', nameEn: 'Temperance', arcana: 'major', upright: '平衡、耐心、和谐', reversed: '失衡、过度', description: '节制天使将水在两杯间缓缓倾倒，象征调和与平衡。' },
  { id: 15, name: '恶魔', nameEn: 'The Devil', arcana: 'major', upright: '束缚、诱惑、物质', reversed: '释放、觉醒', description: '恶魔牌揭示我们内心的枷锁与被束缚的欲望。' },
  { id: 16, name: '塔', nameEn: 'The Tower', arcana: 'major', upright: '剧变、觉醒、突破', reversed: '逃避灾难、恐惧变化', description: '高塔倒塌，旧的结构被摧毁，为重建铺路。' },
  { id: 17, name: '星星', nameEn: 'The Star', arcana: 'major', upright: '希望、灵感、宁静', reversed: '失望、缺乏信心', description: '星星在夜空中闪耀，带来治愈与无尽希望。' },
  { id: 18, name: '月亮', nameEn: 'The Moon', arcana: 'major', upright: '幻觉、直觉、潜意识', reversed: '困惑消散、恢复清明', description: '月光下万物模糊，象征迷雾中的探索与潜意识。' },
  { id: 19, name: '太阳', nameEn: 'The Sun', arcana: 'major', upright: '快乐、成功、活力', reversed: '暂时挫折、过度乐观', description: '太阳普照大地，带来温暖、喜悦与生命力。' },
  { id: 20, name: '审判', nameEn: 'Judgement', arcana: 'major', upright: '重生、觉醒、召唤', reversed: '自我怀疑、拒绝召唤', description: '号角吹响，灵魂被唤醒，迎接全新的使命。' },
  { id: 21, name: '世界', nameEn: 'The World', arcana: 'major', upright: '完成、整合、成就', reversed: '未完成、缺乏闭合', description: '世界牌是大阿尔卡纳的终章，象征圆满与成就。' },
];

const suits = [
  { name: '权杖', nameEn: 'Wands', element: '火' },
  { name: '圣杯', nameEn: 'Cups', element: '水' },
  { name: '宝剑', nameEn: 'Swords', element: '风' },
  { name: '星币', nameEn: 'Pentacles', element: '土' },
];

const courtCards = ['侍从', '骑士', '王后', '国王'];
const courtCardsEn = ['Page', 'Knight', 'Queen', 'King'];

const numberMeanings: Record<string, { upright: string; reversed: string }> = {
  'Ace': { upright: '新机遇、潜力', reversed: '错失机会、延迟' },
  '2': { upright: '平衡、选择、合作', reversed: '失衡、犹豫不决' },
  '3': { upright: '成长、创造、团队', reversed: '过度扩张、缺乏规划' },
  '4': { upright: '稳定、基础、休息', reversed: '不安、停滞' },
  '5': { upright: '挑战、冲突、变化', reversed: '和解、恢复' },
  '6': { upright: '和谐、回忆、慷慨', reversed: '不平等、执着过去' },
  '7': { upright: '反思、评估、信念', reversed: '缺乏远见、分散' },
  '8': { upright: '行动、速度、力量', reversed: '阻碍、急躁' },
  '9': { upright: '即将完成、坚韧', reversed: '疲惫、未尽之事' },
  '10': { upright: '完成、圆满、传承', reversed: '过度负担、抗拒结束' },
  'Page': { upright: '学习、好奇、消息', reversed: '不成熟、犹豫' },
  'Knight': { upright: '行动、追求、热情', reversed: '冲动、鲁莽' },
  'Queen': { upright: '滋养、直觉、成熟', reversed: '情绪化、过度保护' },
  'King': { upright: '掌控、智慧、领导', reversed: '专横、固执' },
};

function generateMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  let id = 22;
  
  for (const suit of suits) {
    // Number cards 1-10
    for (let num = 1; num <= 10; num++) {
      const label = num === 1 ? 'Ace' : String(num);
      const labelCn = num === 1 ? '王牌' : String(num);
      const meanings = numberMeanings[label] || numberMeanings['2'];
      cards.push({
        id: id++,
        name: `${suit.name}${labelCn}`,
        nameEn: `${label} of ${suit.nameEn}`,
        arcana: 'minor',
        suit: suit.name,
        upright: meanings.upright,
        reversed: meanings.reversed,
        description: `${suit.name}${labelCn}属于${suit.element}元素，代表${meanings.upright}的能量。`,
      });
    }
    // Court cards
    for (let i = 0; i < courtCards.length; i++) {
      const meanings = numberMeanings[courtCardsEn[i]];
      cards.push({
        id: id++,
        name: `${suit.name}${courtCards[i]}`,
        nameEn: `${courtCardsEn[i]} of ${suit.nameEn}`,
        arcana: 'minor',
        suit: suit.name,
        upright: meanings.upright,
        reversed: meanings.reversed,
        description: `${suit.name}${courtCards[i]}代表${suit.element}元素中${meanings.upright}的人格特质。`,
      });
    }
  }
  return cards;
}

export const allTarotCards: TarotCard[] = [...majorArcana, ...generateMinorArcana()];

export const getRandomCards = (count: number): TarotCard[] => {
  const shuffled = [...allTarotCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getMajorArcana = (): TarotCard[] => majorArcana;
