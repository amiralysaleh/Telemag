import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNELS = [
  'persianvpnhub',
  'mitivpn',
  'Break_the_barriers',
  'MatinSenPaii',
  'worldsmoments',
  'iliaen',
  'newscenter',
  'dirty_kids',
  'mahsa_alert',
  'mizangorup',
  'INTERNETFORIRAN',
  'VahidOnline',
  'IranintlTV',
  'pm_afshaa',
  'NetAccount'
];

const DATA_FILE = path.join(__dirname, '../public/data.json');

function parseSizeMB(sizeStr: string): number {
  const match = sizeStr.match(/([\d.]+)\s*(KB|MB|GB|B)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return val * 1024;
  if (unit === 'MB') return val;
  if (unit === 'KB') return val / 1024;
  if (unit === 'B') return val / (1024 * 1024);
  return 0;
}

interface Message {
  id: string;
  channel: string;
  text: string;
  html: string;
  date: string;
  images: string[];
  files: { name: string; size: string }[];
  link: string;
  timestamp: number;
}

async function scrapeChannel(channelName: string): Promise<Message[]> {
  console.log(`Scraping ${channelName}...`);
  try {
    const response = await axios.get(`https://t.me/s/${channelName}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const messages: Message[] = [];

    $('.tgme_widget_message').each((i, el) => {
      const $el = $(el);
      const id = $el.attr('data-post') || '';
      if (!id) return;

      const text = $el.find('.tgme_widget_message_text').text().trim();
      const html = $el.find('.tgme_widget_message_text').html() || '';
      const date = $el.find('.tgme_widget_message_date time').attr('datetime') || '';
      const link = `https://t.me/${channelName}/${id.split('/')[1]}`;
      
      // Images
      const images: string[] = [];
      $el.find('.tgme_widget_message_photo_wrap').each((j, imgEl) => {
        const style = $(imgEl).attr('style');
        if (style) {
          const match = style.match(/url\('(.+?)'\)/);
          if (match && match[1]) {
            images.push(match[1]);
          }
        }
      });

      // Files (basic extraction)
      let hasLargeFile = false;
      const files: { name: string; size: string }[] = [];
      $el.find('.tgme_widget_message_document').each((k, fileEl) => {
          const name = $(fileEl).find('.tgme_widget_message_document_title').text().trim();
          const size = $(fileEl).find('.tgme_widget_message_document_extra').text().trim();
          if (name) {
            if (parseSizeMB(size) > 5) {
              hasLargeFile = true;
            }
            files.push({ name, size });
          }
      });

      if (hasLargeFile) return; // Skip message if it contains a file > 5MB

      messages.push({
        id,
        channel: channelName,
        text,
        html,
        date,
        images,
        files,
        link,
        timestamp: new Date(date).getTime()
      });
    });

    return messages;
  } catch (error) {
    console.error(`Error scraping ${channelName}:`, error);
    return [];
  }
}

async function main() {
  let existingData: Message[] = [];
  
  // Ensure public directory exists
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error reading existing data, starting fresh.');
    }
  }

  const allNewMessages: Message[] = [];

  for (const channel of CHANNELS) {
    const messages = await scrapeChannel(channel);
    allNewMessages.push(...messages);
  }

  // Merge and deduplicate
  // We prioritize new data but keep old data if it's not in the new batch (archive mode)
  // OR we just update. The prompt implies "save every 1 hour", suggesting an archive.
  // However, for a simple JSON file, it might grow too large. 
  // Let's keep the last 1000 messages total for performance in this demo, 
  // or just deduplicate by ID.
  
  const dataMap = new Map<string, Message>();
  
  // Load existing
  existingData.forEach(msg => dataMap.set(msg.id, msg));
  
  // Add new (overwriting if updated)
  allNewMessages.forEach(msg => dataMap.set(msg.id, msg));

  // Convert back to array, filter out messages older than 24 hours, and sort by date
  const now = Date.now();
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  const sortedData = Array.from(dataMap.values())
    .filter(msg => (now - msg.timestamp) <= TWENTY_FOUR_HOURS)
    .sort((a, b) => b.timestamp - a.timestamp);

  // Limit to prevent infinite growth in this demo (optional, but good for JSON performance)
  // Let's keep 500 for now.
  const limitedData = sortedData.slice(0, 500);

  fs.writeFileSync(DATA_FILE, JSON.stringify(limitedData, null, 2));
  console.log(`Saved ${limitedData.length} messages to ${DATA_FILE}`);
}

main();
