/**
 * TFT迚ｹ諤ｧ縺ｮ逋ｺ蜍墓ｮｵ髫弱＃縺ｨ縺ｮ隕九◆逶ｮ繧定ｿ斐☆
 *
 * style:
 * 0 = 譛ｪ逋ｺ蜍・
 * 1 = 繝悶Ο繝ｳ繧ｺ
 * 2 = 繧ｷ繝ｫ繝舌・
 * 3 = 繧ｴ繝ｼ繝ｫ繝・
 * 4 = 繝励Μ繧ｺ繝
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

