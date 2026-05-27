export async function GET() {
  return new Response(
    `google.com, pub-8011470049569108, DIRECT, f08c47fec0942fa0`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      }
    }
  );
}
