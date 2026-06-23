/**
 * TFT特性の発動段階ごとの見た目を返す
 *
 * style:
 * 0 = 未発動
 * 1 = ブロンズ
 * 2 = シルバー
 * 3 = ゴールド
 * 4 = プリズム
 */
export function getTraitBadgeClass(style?: number) {
  switch (style) {
    case 4:
      return "border-cyan-300/40 bg-cyan-400/20 text-cyan-200";

    case 3:
      return "border-yellow-300/40 bg-yellow-400/20 text-yellow-200";

    case 2:
      return "border-slate-200/40 bg-slate-300/20 text-slate-100";

    case 1:
      return "border-orange-300/40 bg-orange-500/20 text-orange-200";

    default:
      return "border-white/10 bg-white/10 text-slate-300";
  }
}
