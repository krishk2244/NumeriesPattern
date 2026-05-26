/**
 * Second batch of hand-curated names. Same merge format / idempotent dedupe
 * as scripts/seed-additional-names.ts.
 *
 * Run: npx tsx scripts/seed-additional-names-2.ts
 */

import * as fs from 'fs'
import * as path from 'path'

interface PoolName {
  name: string
  origin: string
  meaning: string
  gender: string
  era: string
}

const ADDITIONS: Record<string, PoolName[]> = {
  India: [
    { name: 'Aarya', origin: 'Sanskrit', meaning: 'noble, honorable', gender: 'F', era: 'contemporary' },
    { name: 'Aayan', origin: 'Sanskrit', meaning: 'gift of god', gender: 'M', era: 'contemporary' },
    { name: 'Aniket', origin: 'Sanskrit', meaning: 'lord of the world', gender: 'M', era: 'modern' },
    { name: 'Bhavna', origin: 'Sanskrit', meaning: 'feeling, sentiment', gender: 'F', era: 'modern' },
    { name: 'Brijesh', origin: 'Sanskrit', meaning: 'lord of Brij, Krishna', gender: 'M', era: 'classical' },
    { name: 'Chitra', origin: 'Sanskrit', meaning: 'picture, splendid', gender: 'F', era: 'classical' },
    { name: 'Daya', origin: 'Sanskrit', meaning: 'compassion, mercy', gender: 'F', era: 'classical' },
    { name: 'Esha', origin: 'Sanskrit', meaning: 'desire, goddess Parvati', gender: 'F', era: 'modern' },
    { name: 'Hema', origin: 'Sanskrit', meaning: 'gold, golden', gender: 'F', era: 'classical' },
    { name: 'Indra', origin: 'Sanskrit', meaning: 'king of the gods', gender: 'M', era: 'classical' },
    { name: 'Jaya', origin: 'Sanskrit', meaning: 'victory', gender: 'F', era: 'classical' },
    { name: 'Mahesh', origin: 'Sanskrit', meaning: 'great lord, Shiva', gender: 'M', era: 'classical' },
    { name: 'Mohan', origin: 'Sanskrit', meaning: 'enchanting, name of Krishna', gender: 'M', era: 'classical' },
    { name: 'Naveen', origin: 'Sanskrit', meaning: 'new, fresh', gender: 'M', era: 'modern' },
    { name: 'Ojas', origin: 'Sanskrit', meaning: 'vital energy, brilliance', gender: 'M', era: 'contemporary' },
    { name: 'Pradeep', origin: 'Sanskrit', meaning: 'light, lamp', gender: 'M', era: 'modern' },
    { name: 'Reena', origin: 'Sanskrit', meaning: 'jewel, melodious', gender: 'F', era: 'modern' },
    { name: 'Saraswati', origin: 'Sanskrit', meaning: 'goddess of knowledge', gender: 'F', era: 'classical' },
    { name: 'Shanti', origin: 'Sanskrit', meaning: 'peace, tranquility', gender: 'F', era: 'classical' },
    { name: 'Surya', origin: 'Sanskrit', meaning: 'sun, the sun god', gender: 'M', era: 'classical' },
    { name: 'Vinay', origin: 'Sanskrit', meaning: 'humility, courtesy', gender: 'M', era: 'modern' },
  ],
  'United States': [
    { name: 'Alice', origin: 'Germanic', meaning: 'noble', gender: 'F', era: 'classical' },
    { name: 'Alyssa', origin: 'Greek', meaning: 'rational, noble', gender: 'F', era: 'modern' },
    { name: 'Avery', origin: 'Old English', meaning: 'ruler of elves', gender: 'U', era: 'contemporary' },
    { name: 'Brian', origin: 'Celtic', meaning: 'high, noble', gender: 'M', era: 'modern' },
    { name: 'Brooke', origin: 'Old English', meaning: 'small stream', gender: 'F', era: 'modern' },
    { name: 'Cameron', origin: 'Scottish', meaning: 'crooked nose', gender: 'U', era: 'modern' },
    { name: 'Chase', origin: 'French', meaning: 'huntsman', gender: 'M', era: 'contemporary' },
    { name: 'Daniel', origin: 'Hebrew', meaning: 'God is my judge', gender: 'M', era: 'classical' },
    { name: 'Eric', origin: 'Norse', meaning: 'eternal ruler', gender: 'M', era: 'modern' },
    { name: 'Faith', origin: 'Latin', meaning: 'belief, trust', gender: 'F', era: 'classical' },
    { name: 'Gabriel', origin: 'Hebrew', meaning: 'God is my strength', gender: 'M', era: 'classical' },
    { name: 'Hailey', origin: 'Old English', meaning: 'hay meadow', gender: 'F', era: 'contemporary' },
    { name: 'Hunter', origin: 'Old English', meaning: 'hunter', gender: 'M', era: 'contemporary' },
    { name: 'Joseph', origin: 'Hebrew', meaning: 'he will add', gender: 'M', era: 'classical' },
    { name: 'Julia', origin: 'Latin', meaning: 'youthful', gender: 'F', era: 'classical' },
    { name: 'Kayla', origin: 'Hebrew', meaning: 'crown of laurels', gender: 'F', era: 'modern' },
    { name: 'Kevin', origin: 'Irish', meaning: 'handsome, gentle', gender: 'M', era: 'modern' },
    { name: 'Madeline', origin: 'Hebrew', meaning: 'from Magdala', gender: 'F', era: 'classical' },
    { name: 'Nathan', origin: 'Hebrew', meaning: 'gift, given', gender: 'M', era: 'modern' },
    { name: 'Quinn', origin: 'Irish', meaning: 'wisdom, intelligence', gender: 'U', era: 'contemporary' },
    { name: 'Tyler', origin: 'Old English', meaning: 'tile maker', gender: 'M', era: 'modern' },
  ],
  'United Kingdom': [
    { name: 'Archie', origin: 'Germanic', meaning: 'genuine, bold', gender: 'M', era: 'contemporary' },
    { name: 'Bea', origin: 'Latin', meaning: 'she who brings happiness', gender: 'F', era: 'contemporary' },
    { name: 'Brody', origin: 'Scottish', meaning: 'broad eye, ditch', gender: 'M', era: 'modern' },
    { name: 'Cara', origin: 'Irish', meaning: 'friend, beloved', gender: 'F', era: 'modern' },
    { name: 'Dexter', origin: 'Latin', meaning: 'right-handed, skillful', gender: 'M', era: 'modern' },
    { name: 'Edith', origin: 'Old English', meaning: 'prosperous in war', gender: 'F', era: 'classical' },
    { name: 'Elsie', origin: 'Hebrew/Scottish', meaning: 'pledged to God', gender: 'F', era: 'classical' },
    { name: 'Felix', origin: 'Latin', meaning: 'happy, fortunate', gender: 'M', era: 'classical' },
    { name: 'Gemma', origin: 'Italian', meaning: 'precious gem', gender: 'F', era: 'modern' },
    { name: 'Hugo', origin: 'Germanic', meaning: 'mind, intellect', gender: 'M', era: 'classical' },
    { name: 'Iris', origin: 'Greek', meaning: 'rainbow, messenger', gender: 'F', era: 'classical' },
    { name: 'Jasmine', origin: 'Persian', meaning: 'jasmine flower', gender: 'F', era: 'modern' },
    { name: 'Joel', origin: 'Hebrew', meaning: 'Jehovah is God', gender: 'M', era: 'modern' },
    { name: 'Lottie', origin: 'French', meaning: 'free woman', gender: 'F', era: 'contemporary' },
    { name: 'Luna', origin: 'Latin', meaning: 'moon', gender: 'F', era: 'contemporary' },
    { name: 'Niamh', origin: 'Irish', meaning: 'bright, radiant', gender: 'F', era: 'modern' },
    { name: 'Reuben', origin: 'Hebrew', meaning: 'behold, a son', gender: 'M', era: 'classical' },
    { name: 'Theo', origin: 'Greek', meaning: 'gift of God', gender: 'M', era: 'contemporary' },
    { name: 'Tom', origin: 'Aramaic', meaning: 'twin', gender: 'M', era: 'modern' },
    { name: 'Violet', origin: 'Latin', meaning: 'violet flower', gender: 'F', era: 'classical' },
  ],
  France: [
    { name: 'Aimee', origin: 'French', meaning: 'beloved', gender: 'F', era: 'classical' },
    { name: 'Bastien', origin: 'Greek', meaning: 'venerable', gender: 'M', era: 'modern' },
    { name: 'Beatrice', origin: 'Latin', meaning: 'she who brings happiness', gender: 'F', era: 'classical' },
    { name: 'Charles', origin: 'Germanic', meaning: 'free man', gender: 'M', era: 'classical' },
    { name: 'Damien', origin: 'Greek', meaning: 'to tame', gender: 'M', era: 'modern' },
    { name: 'David', origin: 'Hebrew', meaning: 'beloved', gender: 'M', era: 'classical' },
    { name: 'Eric', origin: 'Norse', meaning: 'eternal ruler', gender: 'M', era: 'modern' },
    { name: 'Estelle', origin: 'Latin', meaning: 'star', gender: 'F', era: 'classical' },
    { name: 'Florence', origin: 'Latin', meaning: 'flourishing', gender: 'F', era: 'classical' },
    { name: 'Gilles', origin: 'Greek', meaning: 'youthful, kid', gender: 'M', era: 'classical' },
    { name: 'Helene', origin: 'Greek', meaning: 'shining light', gender: 'F', era: 'classical' },
    { name: 'Inès', origin: 'Portuguese/Spanish', meaning: 'pure, holy', gender: 'F', era: 'modern' },
    { name: 'Ines', origin: 'Portuguese/Spanish', meaning: 'pure, holy', gender: 'F', era: 'modern' },
    { name: 'Lea', origin: 'Hebrew', meaning: 'weary, meadow', gender: 'F', era: 'modern' },
    { name: 'Marc', origin: 'Latin', meaning: 'warlike, of Mars', gender: 'M', era: 'classical' },
    { name: 'Nathalie', origin: 'Latin', meaning: 'birth of the Lord', gender: 'F', era: 'modern' },
    { name: 'Noemie', origin: 'Hebrew', meaning: 'pleasant, lovely', gender: 'F', era: 'modern' },
    { name: 'Remi', origin: 'Latin', meaning: 'oarsman', gender: 'M', era: 'modern' },
    { name: 'Theo', origin: 'Greek', meaning: 'gift of God', gender: 'M', era: 'contemporary' },
    { name: 'Yann', origin: 'Breton/Hebrew', meaning: 'God is gracious', gender: 'M', era: 'modern' },
    { name: 'Zoe', origin: 'Greek', meaning: 'life', gender: 'F', era: 'modern' },
  ],
  Italy: [
    { name: 'Alba', origin: 'Latin', meaning: 'dawn, white', gender: 'F', era: 'classical' },
    { name: 'Aldo', origin: 'Germanic', meaning: 'old, wise', gender: 'M', era: 'classical' },
    { name: 'Cesare', origin: 'Latin', meaning: 'long-haired, head of hair', gender: 'M', era: 'classical' },
    { name: 'Cristian', origin: 'Latin', meaning: 'follower of Christ', gender: 'M', era: 'modern' },
    { name: 'Diana', origin: 'Latin', meaning: 'divine, the moon goddess', gender: 'F', era: 'classical' },
    { name: 'Edoardo', origin: 'Germanic', meaning: 'wealthy guardian', gender: 'M', era: 'classical' },
    { name: 'Emiliano', origin: 'Latin', meaning: 'rival, eager', gender: 'M', era: 'modern' },
    { name: 'Fabrizio', origin: 'Latin', meaning: 'craftsman', gender: 'M', era: 'modern' },
    { name: 'Flavia', origin: 'Latin', meaning: 'golden, blonde', gender: 'F', era: 'classical' },
    { name: 'Greta', origin: 'Germanic', meaning: 'pearl', gender: 'F', era: 'modern' },
    { name: 'Iacopo', origin: 'Hebrew', meaning: 'supplanter', gender: 'M', era: 'classical' },
    { name: 'Letizia', origin: 'Latin', meaning: 'joy, gladness', gender: 'F', era: 'classical' },
    { name: 'Luigia', origin: 'Germanic', meaning: 'famous warrior', gender: 'F', era: 'classical' },
    { name: 'Marta', origin: 'Aramaic', meaning: 'lady, mistress', gender: 'F', era: 'classical' },
    { name: 'Nina', origin: 'Spanish/Italian', meaning: 'little girl', gender: 'F', era: 'classical' },
    { name: 'Renato', origin: 'Latin', meaning: 'reborn', gender: 'M', era: 'modern' },
    { name: 'Salvatore', origin: 'Latin', meaning: 'savior', gender: 'M', era: 'classical' },
    { name: 'Sara', origin: 'Hebrew', meaning: 'princess', gender: 'F', era: 'modern' },
    { name: 'Sofia', origin: 'Greek', meaning: 'wisdom', gender: 'F', era: 'classical' },
    { name: 'Valeria', origin: 'Latin', meaning: 'strength, valor', gender: 'F', era: 'classical' },
  ],
  Japan: [
    { name: 'Aki', origin: 'Japanese', meaning: 'autumn, bright', gender: 'U', era: 'classical' },
    { name: 'Ayumi', origin: 'Japanese', meaning: 'walk, progress', gender: 'F', era: 'modern' },
    { name: 'Hideki', origin: 'Japanese', meaning: 'excellent timber', gender: 'M', era: 'modern' },
    { name: 'Kazuo', origin: 'Japanese', meaning: 'first man, harmonious', gender: 'M', era: 'classical' },
    { name: 'Maiko', origin: 'Japanese', meaning: 'dancing child', gender: 'F', era: 'classical' },
    { name: 'Mamoru', origin: 'Japanese', meaning: 'protector', gender: 'M', era: 'modern' },
    { name: 'Manami', origin: 'Japanese', meaning: 'love beauty', gender: 'F', era: 'modern' },
    { name: 'Nana', origin: 'Japanese', meaning: 'seven', gender: 'F', era: 'modern' },
    { name: 'Nobuyuki', origin: 'Japanese', meaning: 'faithful happiness', gender: 'M', era: 'classical' },
    { name: 'Norio', origin: 'Japanese', meaning: 'lawful man', gender: 'M', era: 'classical' },
    { name: 'Osamu', origin: 'Japanese', meaning: 'discipline, study', gender: 'M', era: 'classical' },
    { name: 'Satomi', origin: 'Japanese', meaning: 'wise beauty', gender: 'F', era: 'modern' },
    { name: 'Seiji', origin: 'Japanese', meaning: 'lawful, righteous', gender: 'M', era: 'modern' },
    { name: 'Shintaro', origin: 'Japanese', meaning: 'true, big son', gender: 'M', era: 'classical' },
    { name: 'Shiori', origin: 'Japanese', meaning: 'bookmark, poem', gender: 'F', era: 'modern' },
    { name: 'Shun', origin: 'Japanese', meaning: 'fast, swift', gender: 'M', era: 'modern' },
    { name: 'Tatsuya', origin: 'Japanese', meaning: 'dragon, accomplished', gender: 'M', era: 'modern' },
    { name: 'Tomoko', origin: 'Japanese', meaning: 'wisdom child', gender: 'F', era: 'classical' },
    { name: 'Yasuhiro', origin: 'Japanese', meaning: 'peaceful generosity', gender: 'M', era: 'classical' },
    { name: 'Yoko', origin: 'Japanese', meaning: 'ocean child', gender: 'F', era: 'classical' },
  ],
}

const POOL_DIR = path.join(process.cwd(), 'src/data/name-pools')

function slugify(country: string): string {
  return country.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function mergeCountry(country: string, additions: PoolName[]): void {
  const slug = slugify(country)
  const file = path.join(POOL_DIR, `${slug}.json`)
  if (!fs.existsSync(file)) {
    console.log(`  ${country.padEnd(22)} ✗ no existing pool`)
    return
  }
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  const existing: PoolName[] = data.names ?? []
  const seen = new Set(existing.map((n) => n.name.toLowerCase().trim()))

  let added = 0
  for (const n of additions) {
    const key = n.name.toLowerCase().trim()
    if (!seen.has(key)) {
      existing.push(n)
      seen.add(key)
      added++
    }
  }

  data.names = existing
  data.count = existing.length
  data.last_seeded_at = new Date().toISOString()
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(
    `  ${country.padEnd(22)} +${added} (now ${existing.length} total)`
  )
}

function main(): void {
  console.log('Seeding additional batch 2 of hand-curated names\n')
  for (const [country, additions] of Object.entries(ADDITIONS)) {
    mergeCountry(country, additions)
  }
}

main()
