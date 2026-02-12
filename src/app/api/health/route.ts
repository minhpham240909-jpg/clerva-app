export async function GET() {
  return Response.json({ status: 'ok', app: 'adecis', time: new Date().toISOString() })
}
