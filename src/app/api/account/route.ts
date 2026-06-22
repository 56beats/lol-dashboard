import { getAccount } from "@/lib/riot";

export async function GET() {
  try {
    const account = await getAccount();

    return Response.json(account);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "failed",
      },
      {
        status: 500,
      }
    );
  }
}
