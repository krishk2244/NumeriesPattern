/**
 * Hand-curated supplemental names per country. Merged into existing pools
 * by deduplicating on lowercased name.
 *
 * Run: npx tsx scripts/seed-additional-names.ts
 *
 * No API call — purely local data. Use this to expand pools beyond what the
 * model build can produce within OpenRouter credit limits.
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
    { name: 'Aarav', origin: 'Sanskrit', meaning: 'peaceful, calm sound', gender: 'M', era: 'contemporary' },
    { name: 'Aarush', origin: 'Sanskrit', meaning: 'first ray of the sun', gender: 'M', era: 'contemporary' },
    { name: 'Aanya', origin: 'Sanskrit', meaning: 'inexhaustible, gracious', gender: 'F', era: 'contemporary' },
    { name: 'Akash', origin: 'Sanskrit', meaning: 'sky, open space', gender: 'M', era: 'modern' },
    { name: 'Amit', origin: 'Sanskrit', meaning: 'boundless, infinite', gender: 'M', era: 'modern' },
    { name: 'Anushka', origin: 'Sanskrit', meaning: 'lightning, grace', gender: 'F', era: 'modern' },
    { name: 'Asha', origin: 'Sanskrit', meaning: 'hope, desire', gender: 'F', era: 'classical' },
    { name: 'Ayan', origin: 'Sanskrit', meaning: 'speed, path', gender: 'M', era: 'contemporary' },
    { name: 'Dhruv', origin: 'Sanskrit', meaning: 'pole star, constant', gender: 'M', era: 'classical' },
    { name: 'Diya', origin: 'Sanskrit', meaning: 'lamp, light', gender: 'F', era: 'contemporary' },
    { name: 'Gita', origin: 'Sanskrit', meaning: 'song, sacred verse', gender: 'F', era: 'classical' },
    { name: 'Ira', origin: 'Sanskrit', meaning: 'earth, watchful', gender: 'F', era: 'contemporary' },
    { name: 'Karan', origin: 'Sanskrit', meaning: 'instrument of action', gender: 'M', era: 'modern' },
    { name: 'Kiran', origin: 'Sanskrit', meaning: 'ray of light', gender: 'U', era: 'modern' },
    { name: 'Lakshmi', origin: 'Sanskrit', meaning: 'goddess of fortune', gender: 'F', era: 'classical' },
    { name: 'Madhav', origin: 'Sanskrit', meaning: 'sweet as honey, name of Krishna', gender: 'M', era: 'classical' },
    { name: 'Mira', origin: 'Sanskrit', meaning: 'ocean, sea', gender: 'F', era: 'classical' },
    { name: 'Nandini', origin: 'Sanskrit', meaning: 'delightful, daughter', gender: 'F', era: 'modern' },
    { name: 'Pavan', origin: 'Sanskrit', meaning: 'wind, breeze', gender: 'M', era: 'classical' },
    { name: 'Radha', origin: 'Sanskrit', meaning: 'success, prosperity', gender: 'F', era: 'classical' },
    { name: 'Riya', origin: 'Sanskrit', meaning: 'singer, melody', gender: 'F', era: 'contemporary' },
    { name: 'Saanvi', origin: 'Sanskrit', meaning: 'goddess Lakshmi', gender: 'F', era: 'contemporary' },
    { name: 'Shiva', origin: 'Sanskrit', meaning: 'auspicious, the deity', gender: 'M', era: 'classical' },
    { name: 'Sita', origin: 'Sanskrit', meaning: 'furrow, the Ramayana heroine', gender: 'F', era: 'classical' },
    { name: 'Sneha', origin: 'Sanskrit', meaning: 'love, affection', gender: 'F', era: 'modern' },
    { name: 'Vivek', origin: 'Sanskrit', meaning: 'wisdom, discernment', gender: 'M', era: 'modern' },
  ],
  'United States': [
    { name: 'Aaron', origin: 'Hebrew', meaning: 'exalted, lofty', gender: 'M', era: 'classical' },
    { name: 'Ava', origin: 'Latin/Germanic', meaning: 'birdlike, life', gender: 'F', era: 'contemporary' },
    { name: 'Benjamin', origin: 'Hebrew', meaning: 'son of the right hand', gender: 'M', era: 'classical' },
    { name: 'Caleb', origin: 'Hebrew', meaning: 'devoted, whole-hearted', gender: 'M', era: 'modern' },
    { name: 'Carter', origin: 'Old English', meaning: 'cart driver', gender: 'M', era: 'contemporary' },
    { name: 'Chloe', origin: 'Greek', meaning: 'young green shoot', gender: 'F', era: 'contemporary' },
    { name: 'Dylan', origin: 'Welsh', meaning: 'great wave', gender: 'M', era: 'modern' },
    { name: 'Emma', origin: 'Germanic', meaning: 'whole, universal', gender: 'F', era: 'contemporary' },
    { name: 'Ethan', origin: 'Hebrew', meaning: 'strong, enduring', gender: 'M', era: 'modern' },
    { name: 'Grace', origin: 'Latin', meaning: 'charm, blessing', gender: 'F', era: 'classical' },
    { name: 'Hannah', origin: 'Hebrew', meaning: 'grace, favor', gender: 'F', era: 'classical' },
    { name: 'Harper', origin: 'Old English', meaning: 'harp player', gender: 'U', era: 'contemporary' },
    { name: 'Henry', origin: 'Germanic', meaning: 'ruler of the home', gender: 'M', era: 'classical' },
    { name: 'Isaac', origin: 'Hebrew', meaning: 'he will laugh', gender: 'M', era: 'classical' },
    { name: 'Isabella', origin: 'Hebrew/Italian', meaning: 'devoted to God', gender: 'F', era: 'modern' },
    { name: 'Jack', origin: 'English', meaning: 'God is gracious', gender: 'M', era: 'modern' },
    { name: 'Jacob', origin: 'Hebrew', meaning: 'supplanter, follower', gender: 'M', era: 'classical' },
    { name: 'Jordan', origin: 'Hebrew', meaning: 'flowing down', gender: 'U', era: 'modern' },
    { name: 'Logan', origin: 'Scottish', meaning: 'little hollow', gender: 'M', era: 'contemporary' },
    { name: 'Madison', origin: 'Old English', meaning: "son of Maud", gender: 'F', era: 'contemporary' },
    { name: 'Mason', origin: 'Old English', meaning: 'stoneworker', gender: 'M', era: 'contemporary' },
    { name: 'Mia', origin: 'Italian/Scandinavian', meaning: 'mine, beloved', gender: 'F', era: 'contemporary' },
    { name: 'Noah', origin: 'Hebrew', meaning: 'rest, comfort', gender: 'M', era: 'classical' },
    { name: 'Owen', origin: 'Welsh', meaning: 'young warrior', gender: 'M', era: 'modern' },
    { name: 'Riley', origin: 'Irish', meaning: 'courageous', gender: 'U', era: 'contemporary' },
    { name: 'Zoe', origin: 'Greek', meaning: 'life', gender: 'F', era: 'modern' },
  ],
  'United Kingdom': [
    { name: 'Aiden', origin: 'Irish/Gaelic', meaning: 'little fire', gender: 'M', era: 'contemporary' },
    { name: 'Alexander', origin: 'Greek', meaning: 'defender of men', gender: 'M', era: 'classical' },
    { name: 'Alfie', origin: 'Old English', meaning: 'wise counsellor', gender: 'M', era: 'contemporary' },
    { name: 'Amelia', origin: 'Germanic', meaning: 'work, industrious', gender: 'F', era: 'classical' },
    { name: 'Ava', origin: 'Latin', meaning: 'birdlike', gender: 'F', era: 'contemporary' },
    { name: 'Callum', origin: 'Scottish/Gaelic', meaning: 'dove', gender: 'M', era: 'modern' },
    { name: 'Charlotte', origin: 'French', meaning: 'free woman', gender: 'F', era: 'classical' },
    { name: 'Connor', origin: 'Irish', meaning: 'lover of hounds', gender: 'M', era: 'modern' },
    { name: 'Daisy', origin: 'Old English', meaning: "day's eye", gender: 'F', era: 'modern' },
    { name: 'Ella', origin: 'Germanic', meaning: 'all, completely', gender: 'F', era: 'contemporary' },
    { name: 'Erin', origin: 'Irish', meaning: 'Ireland', gender: 'F', era: 'modern' },
    { name: 'Finn', origin: 'Irish/Norse', meaning: 'fair-haired', gender: 'M', era: 'contemporary' },
    { name: 'Freya', origin: 'Norse', meaning: 'noble lady, goddess of love', gender: 'F', era: 'contemporary' },
    { name: 'Holly', origin: 'Old English', meaning: 'holly tree', gender: 'F', era: 'modern' },
    { name: 'Isla', origin: 'Scottish', meaning: 'island', gender: 'F', era: 'contemporary' },
    { name: 'Lily', origin: 'Latin', meaning: 'pure, lily flower', gender: 'F', era: 'modern' },
    { name: 'Lucas', origin: 'Latin', meaning: 'light, illumination', gender: 'M', era: 'contemporary' },
    { name: 'Maisie', origin: 'Scottish', meaning: 'pearl', gender: 'F', era: 'contemporary' },
    { name: 'Max', origin: 'Latin', meaning: 'greatest', gender: 'M', era: 'modern' },
    { name: 'Mila', origin: 'Slavic', meaning: 'gracious, dear', gender: 'F', era: 'contemporary' },
    { name: 'Oliver', origin: 'Latin', meaning: 'olive tree', gender: 'M', era: 'classical' },
    { name: 'Olivia', origin: 'Latin', meaning: 'olive tree', gender: 'F', era: 'classical' },
    { name: 'Poppy', origin: 'Latin', meaning: 'poppy flower', gender: 'F', era: 'contemporary' },
    { name: 'Ruby', origin: 'Latin', meaning: 'red gemstone', gender: 'F', era: 'modern' },
    { name: 'Willow', origin: 'Old English', meaning: 'willow tree', gender: 'F', era: 'contemporary' },
  ],
  France: [
    { name: 'Adrien', origin: 'Latin', meaning: 'from Hadria', gender: 'M', era: 'modern' },
    { name: 'Alice', origin: 'Germanic', meaning: 'noble', gender: 'F', era: 'classical' },
    { name: 'Antoine', origin: 'Latin', meaning: 'priceless one', gender: 'M', era: 'classical' },
    { name: 'Arthur', origin: 'Celtic', meaning: 'bear, strength', gender: 'M', era: 'classical' },
    { name: 'Baptiste', origin: 'Greek', meaning: 'one who baptizes', gender: 'M', era: 'modern' },
    { name: 'Camille', origin: 'Latin', meaning: 'attendant, helper', gender: 'U', era: 'classical' },
    { name: 'Celine', origin: 'Latin', meaning: 'heavenly', gender: 'F', era: 'modern' },
    { name: 'Clement', origin: 'Latin', meaning: 'merciful, mild', gender: 'M', era: 'classical' },
    { name: 'Elise', origin: 'Hebrew/French', meaning: 'pledged to God', gender: 'F', era: 'classical' },
    { name: 'Emma', origin: 'Germanic', meaning: 'whole, universal', gender: 'F', era: 'contemporary' },
    { name: 'Etienne', origin: 'Greek', meaning: 'crown, garland', gender: 'M', era: 'classical' },
    { name: 'Gabriel', origin: 'Hebrew', meaning: 'God is my strength', gender: 'M', era: 'classical' },
    { name: 'Henri', origin: 'Germanic', meaning: 'ruler of the home', gender: 'M', era: 'classical' },
    { name: 'Jeanne', origin: 'Hebrew/French', meaning: 'God is gracious', gender: 'F', era: 'classical' },
    { name: 'Julien', origin: 'Latin', meaning: 'youthful', gender: 'M', era: 'modern' },
    { name: 'Juliette', origin: 'Latin', meaning: 'youthful', gender: 'F', era: 'classical' },
    { name: 'Leo', origin: 'Latin', meaning: 'lion', gender: 'M', era: 'contemporary' },
    { name: 'Manon', origin: 'Hebrew', meaning: 'bitter, beloved', gender: 'F', era: 'modern' },
    { name: 'Margot', origin: 'Greek', meaning: 'pearl', gender: 'F', era: 'classical' },
    { name: 'Mathieu', origin: 'Hebrew', meaning: 'gift of God', gender: 'M', era: 'classical' },
    { name: 'Maxime', origin: 'Latin', meaning: 'greatest', gender: 'M', era: 'modern' },
    { name: 'Pauline', origin: 'Latin', meaning: 'small, humble', gender: 'F', era: 'classical' },
    { name: 'Quentin', origin: 'Latin', meaning: 'fifth', gender: 'M', era: 'classical' },
    { name: 'Raphael', origin: 'Hebrew', meaning: 'God has healed', gender: 'M', era: 'classical' },
    { name: 'Sebastien', origin: 'Greek', meaning: 'venerable, revered', gender: 'M', era: 'modern' },
  ],
  Italy: [
    { name: 'Alberto', origin: 'Germanic', meaning: 'noble, bright', gender: 'M', era: 'classical' },
    { name: 'Alice', origin: 'Germanic', meaning: 'noble', gender: 'F', era: 'classical' },
    { name: 'Angelo', origin: 'Greek', meaning: 'messenger, angel', gender: 'M', era: 'classical' },
    { name: 'Beatrice', origin: 'Latin', meaning: 'she who brings happiness', gender: 'F', era: 'classical' },
    { name: 'Camilla', origin: 'Latin', meaning: 'attendant in religious service', gender: 'F', era: 'classical' },
    { name: 'Chiara', origin: 'Latin', meaning: 'bright, clear', gender: 'F', era: 'classical' },
    { name: 'Diego', origin: 'Spanish/Italian', meaning: 'supplanter', gender: 'M', era: 'modern' },
    { name: 'Domenico', origin: 'Latin', meaning: 'belonging to the Lord', gender: 'M', era: 'classical' },
    { name: 'Eleonora', origin: 'Greek', meaning: 'compassion, light', gender: 'F', era: 'classical' },
    { name: 'Elena', origin: 'Greek', meaning: 'shining light', gender: 'F', era: 'classical' },
    { name: 'Enrico', origin: 'Germanic', meaning: 'ruler of the home', gender: 'M', era: 'classical' },
    { name: 'Federico', origin: 'Germanic', meaning: 'peaceful ruler', gender: 'M', era: 'classical' },
    { name: 'Gabriele', origin: 'Hebrew', meaning: 'God is my strength', gender: 'M', era: 'classical' },
    { name: 'Gianluca', origin: 'Italian', meaning: 'God is gracious & light', gender: 'M', era: 'modern' },
    { name: 'Giada', origin: 'Italian', meaning: 'jade gemstone', gender: 'F', era: 'modern' },
    { name: 'Ilaria', origin: 'Latin', meaning: 'cheerful, joyful', gender: 'F', era: 'modern' },
    { name: 'Lorenzo', origin: 'Latin', meaning: 'from Laurentum', gender: 'M', era: 'classical' },
    { name: 'Luigi', origin: 'Germanic', meaning: 'famous warrior', gender: 'M', era: 'classical' },
    { name: 'Manuela', origin: 'Hebrew', meaning: 'God is with us', gender: 'F', era: 'modern' },
    { name: 'Mattia', origin: 'Hebrew', meaning: 'gift of God', gender: 'M', era: 'modern' },
    { name: 'Nicola', origin: 'Greek', meaning: 'victory of the people', gender: 'M', era: 'classical' },
    { name: 'Pietro', origin: 'Greek', meaning: 'rock, stone', gender: 'M', era: 'classical' },
    { name: 'Roberto', origin: 'Germanic', meaning: 'bright fame', gender: 'M', era: 'classical' },
    { name: 'Serena', origin: 'Latin', meaning: 'tranquil, serene', gender: 'F', era: 'modern' },
    { name: 'Vittoria', origin: 'Latin', meaning: 'victory', gender: 'F', era: 'classical' },
  ],
  Japan: [
    { name: 'Akira', origin: 'Japanese', meaning: 'bright, intelligent', gender: 'U', era: 'modern' },
    { name: 'Asuka', origin: 'Japanese', meaning: 'fragrance of tomorrow', gender: 'F', era: 'modern' },
    { name: 'Daisuke', origin: 'Japanese', meaning: 'great helper', gender: 'M', era: 'modern' },
    { name: 'Hideo', origin: 'Japanese', meaning: 'excellent man', gender: 'M', era: 'modern' },
    { name: 'Hiroto', origin: 'Japanese', meaning: 'great flying', gender: 'M', era: 'contemporary' },
    { name: 'Itsuki', origin: 'Japanese', meaning: 'tree, timber', gender: 'M', era: 'contemporary' },
    { name: 'Jun', origin: 'Japanese', meaning: 'pure, obedient', gender: 'U', era: 'modern' },
    { name: 'Kazuki', origin: 'Japanese', meaning: 'harmony, hope', gender: 'M', era: 'modern' },
    { name: 'Keiko', origin: 'Japanese', meaning: 'blessed child', gender: 'F', era: 'classical' },
    { name: 'Kenta', origin: 'Japanese', meaning: 'healthy, big', gender: 'M', era: 'modern' },
    { name: 'Kimiko', origin: 'Japanese', meaning: 'noble child', gender: 'F', era: 'classical' },
    { name: 'Kotaro', origin: 'Japanese', meaning: 'small grand son', gender: 'M', era: 'modern' },
    { name: 'Kyoko', origin: 'Japanese', meaning: 'mirror, capital', gender: 'F', era: 'classical' },
    { name: 'Mai', origin: 'Japanese', meaning: 'dance', gender: 'F', era: 'modern' },
    { name: 'Mariko', origin: 'Japanese', meaning: 'true village child', gender: 'F', era: 'classical' },
    { name: 'Masaki', origin: 'Japanese', meaning: 'flourishing tree', gender: 'M', era: 'modern' },
    { name: 'Megumi', origin: 'Japanese', meaning: 'blessing, grace', gender: 'F', era: 'modern' },
    { name: 'Michiko', origin: 'Japanese', meaning: 'beautiful wisdom child', gender: 'F', era: 'classical' },
    { name: 'Naoko', origin: 'Japanese', meaning: 'honest child', gender: 'F', era: 'classical' },
    { name: 'Reiko', origin: 'Japanese', meaning: 'lovely child', gender: 'F', era: 'classical' },
    { name: 'Saori', origin: 'Japanese', meaning: 'small weaving', gender: 'F', era: 'modern' },
    { name: 'Sho', origin: 'Japanese', meaning: 'soar, fly', gender: 'M', era: 'contemporary' },
    { name: 'Takumi', origin: 'Japanese', meaning: 'artisan, skilled', gender: 'M', era: 'modern' },
    { name: 'Yumiko', origin: 'Japanese', meaning: 'reason child', gender: 'F', era: 'classical' },
    { name: 'Yusuke', origin: 'Japanese', meaning: 'help, courage', gender: 'M', era: 'modern' },
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
  console.log('Seeding additional hand-curated names\n')
  for (const [country, additions] of Object.entries(ADDITIONS)) {
    mergeCountry(country, additions)
  }
}

main()
