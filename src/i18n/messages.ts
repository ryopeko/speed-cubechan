/*
 * UI text in each language. `{name}` in a message is filled in by translate().
 * English is the source: every key in `en` must also be in `ja`.
 */

const en = {
  "site.name": "Speed Cube-chan",
  "site.description": "An OLL & PLL practice tool",
  "site.mascot": "Cube-chan",
  "lang.label": "Language",

  "list.title": "Patterns",
  "list.kind": "Kind",
  "list.all": "All",
  "list.statuses": "Statuses to show",
  "list.summary": "{learned} / {total} learned · {practicing} practicing",
  "list.empty": "No matches",

  "status.none": "Not yet",
  "status.practicing": "Practicing",
  "status.learned": "Learned",
  "status.learnedMark": "✓ Learned",
  "status.label": "Learning status",
  // The one-character badge on practicing rows of the list.
  "status.practicingBadge": "↻",

  "pattern.title": "{name} | Speed Cube-chan",
  "pattern.ogAlt": "The {name} case",
  "pattern.qrLabel": "QR code for the {name} page",
  "pattern.qrNote": "Scan it with your phone's camera to open this {name} page.",

  "practice.title": "Practice",
  "practice.pageTitle": "Practice | Speed Cube-chan",
  "practice.emptyBefore": "No learned patterns yet. Mark some as “Learned” in the ",
  "practice.emptyLink": "list",
  "practice.emptyAfter": ".",
  "practice.intro": "Shows one at random from your {count} learned patterns.",
  "practice.start": "Start",
  "practice.details": "Details",
  "practice.prompt": "Recall the algorithm for this case, then reveal the answer.",
  "practice.next": "Next ▶",
  "practice.reveal": "Show answer",

  "player.alg": "Algorithm",
  "player.setup": "Setup",
  "player.algNote": "From this case, the algorithm solves it.",
  "player.setupNote": "From solved, the setup builds this case.",
  "player.steps": "Moves",
  "player.toStartShort": "⏮ Start",
  "player.toStartLong": "⏮ Back to start",
  "player.backShort": "◀ Back",
  "player.backLong": "◀ Back 1 move",
  "player.turn": "Turn {move} ▶",
  "player.end": "Done",
  "player.pause": "⏸ Pause",
  "player.replay": "↺ Play again",
  "player.play": "▶ Auto play",
  "player.speed": "Speed",
  "player.speedSlow": "Slow",
  "player.speedNormal": "Normal",
  "player.speedFast": "Fast",
  "player.speedDopa": "Dopa",
  "player.progress": "{position} / {total} moves",
  "player.solved": " · Solved",
  "player.built": " · Case built",
  "player.current": "Move just made",
  "player.upcoming": "Next move",

  "settings.label": "Display settings",
  "settings.background": "Background",
  "settings.backgroundOption": "Background: {name}",
  "settings.bgGreige": "Greige",
  "settings.bgGray": "Gray",
  "settings.bgMat": "Matte",
  "settings.bgWhite": "White",
  "settings.grid": "Floor grid",
  "settings.light": "Light",
  "settings.contrast": "Contrast",
  "settings.resetLight": "Reset lighting",

  "share.label": "Share",
  "share.copy": "Copy link",
  "share.copied": "Link copied",
  "share.copyFailed": "Couldn't copy the link",
  "share.x": "Post on X",

  "dopa.start": "DOPA MODE",

  "og.tagline": "An OLL & PLL practice tool",
  "og.kind": "{kind} practice",

  "terms.title": "Terms of Service",
  "terms.pageTitle": "Terms of Service | Speed Cube-chan",
} as const;

export type MessageKey = keyof typeof en;

const ja: Record<MessageKey, string> = {
  "site.name": "スピードキュービちゃん",
  "site.description": "OLL・PLL の練習ツール",
  "site.mascot": "キュービちゃん",
  "lang.label": "言語",

  "list.title": "パターン一覧",
  "list.kind": "種類",
  "list.all": "すべて",
  "list.statuses": "表示する状態",
  "list.summary": "{learned} / {total} 覚えた・練習中 {practicing}",
  "list.empty": "該当なし",

  "status.none": "まだ",
  "status.practicing": "練習中",
  "status.learned": "覚えた",
  "status.learnedMark": "✓ 覚えた",
  "status.label": "覚えた状態",
  "status.practicingBadge": "練",

  "pattern.title": "{name} | スピードキュービちゃん",
  "pattern.ogAlt": "{name} のケースの図",
  "pattern.qrLabel": "{name} のページの QR コード",
  "pattern.qrNote": "スマホのカメラで読み取ると、この {name} のページが開きます。",

  "practice.title": "練習",
  "practice.pageTitle": "練習 | スピードキュービちゃん",
  "practice.emptyBefore": "覚えたパターンがありません。",
  "practice.emptyLink": "一覧",
  "practice.emptyAfter": "で「覚えた」を付けてください。",
  "practice.intro": "覚えた {count} 個の中から、ランダムに 1 つ出します。",
  "practice.start": "はじめる",
  "practice.details": "詳細",
  "practice.prompt": "この形の手順を思い出してから、答えを見てください。",
  "practice.next": "次へ ▶",
  "practice.reveal": "答えを見る",

  "player.alg": "アルゴリズム",
  "player.setup": "セットアップ",
  "player.algNote": "この形から、アルゴリズムで揃えます。",
  "player.setupNote": "揃った状態から、セットアップでこの形を作ります。",
  "player.steps": "手順",
  "player.toStartShort": "⏮ 最初",
  "player.toStartLong": "⏮ 最初に戻す",
  "player.backShort": "◀ 戻す",
  "player.backLong": "◀ 1 手戻す",
  "player.turn": "{move} を回す ▶",
  "player.end": "おわり",
  "player.pause": "⏸ 止める",
  "player.replay": "↺ もう一度再生",
  "player.play": "▶ 自動で再生",
  "player.speed": "速さ",
  "player.speedSlow": "ゆっくり",
  "player.speedNormal": "ふつう",
  "player.speedFast": "はやい",
  "player.speedDopa": "ドパ",
  "player.progress": "{position} / {total} 手",
  "player.solved": " ・ 揃いました",
  "player.built": " ・ 形ができました",
  "player.current": "いま回した手",
  "player.upcoming": "次の手",

  "settings.label": "表示の設定",
  "settings.background": "背景",
  "settings.backgroundOption": "背景: {name}",
  "settings.bgGreige": "グレージュ",
  "settings.bgGray": "グレー",
  "settings.bgMat": "マット",
  "settings.bgWhite": "白",
  "settings.grid": "床のグリッド",
  "settings.light": "光の強さ",
  "settings.contrast": "コントラスト",
  "settings.resetLight": "光を元に戻す",

  "share.label": "共有",
  "share.copy": "リンクをコピー",
  "share.copied": "リンクをコピーしました",
  "share.copyFailed": "コピーできませんでした",
  "share.x": "X でポスト",

  "dopa.start": "ドパモード",

  "og.tagline": "OLL・PLL の練習ツール",
  "og.kind": "{kind} の練習",

  "terms.title": "利用規約",
  "terms.pageTitle": "利用規約 | スピードキュービちゃん",
};

export const MESSAGES = { en, ja } as const;

export type Lang = keyof typeof MESSAGES;
export const LANGS: readonly Lang[] = ["en", "ja"];

export type MessageVars = Readonly<Record<string, string | number>>;

/** The message for `key` in `lang`, with each `{name}` replaced from `vars`. */
export function translate(lang: Lang, key: MessageKey, vars?: MessageVars): string {
  const text: string = MESSAGES[lang][key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m));
}
