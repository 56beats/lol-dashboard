import { getAccount } from "@/lib/riot";

export async function GET() {
  const account = await getAccount();

  return Response.json(account);
}
