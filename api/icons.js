import { promises as fs } from 'fs';
import path from 'path';

const ICONS_FILE = path.resolve(process.cwd(), 'api', 'icons.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(ICONS_FILE, 'utf-8');
      res.status(200).json(JSON.parse(data));
    } catch {
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    try {
      const { name, url } = req.body;
      if (!name || !url) return res.status(400).json({ error: 'Missing name or url' });
      let icons = [];
      try {
        icons = JSON.parse(await fs.readFile(ICONS_FILE, 'utf-8'));
      } catch {}
      const newIcon = { id: Date.now().toString(), name, url };
      icons.unshift(newIcon);
      await fs.writeFile(ICONS_FILE, JSON.stringify(icons, null, 2));
      res.status(201).json(newIcon);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 