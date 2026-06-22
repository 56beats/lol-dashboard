import { getMatch } from "@/src/lib/riot";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const match = await getMatch(id);

  return Response.json(match);
}
