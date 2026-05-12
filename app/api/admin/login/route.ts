export async function POST(req: Request) {
  const { code } = await req.json();
  return code && code === process.env.ADMIN_ACCESS_CODE ? new Response(null, { status: 200 }) : new Response(null, { status: 401 });
}
