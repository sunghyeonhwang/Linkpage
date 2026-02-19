export default async function handler(req: any, res: any) {
  const { default: app } = await import('../apps/server/src/app.js');

  // Vercel already parses the body — mark it so Express body-parser skips
  if (req.body !== undefined) {
    req._body = true;
  }

  return app(req, res);
}
