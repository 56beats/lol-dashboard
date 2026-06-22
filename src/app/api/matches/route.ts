import { getAccount, getMatchIds } from "@/lib/riot";

export async function GET() {
  const account = await getAccount();

  const matches = await getMatchIds(account.puuid, 20);

  return Response.json(matches);
}
