export function getChampionImageUrl(champion: string) {
  return `https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/${champion}.png`;
}

export function calcKda(kills: number, deaths: number, assists: number) {
  if (deaths === 0) return "Perfect";
  return ((kills + assists) / deaths).toFixed(2);
}
