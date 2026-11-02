import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Color } from '../models/Color';
import { Pattern } from '../models/Pattern';
import { Project } from '../models/Project';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { config } from '../config/environment';

export const sampleColors = [
  // Neutrals & Whites
  {
    name: 'Alabaster Whisper',
    hex: '#F4F1EA',
    manufacturer: 'Smart Palette Studio',
    category: 'Neutral',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'A soft, warm off-white that creates a calming and luminous atmosphere.'
  },
  {
    name: 'Classic Grecian Ivory',
    hex: '#EFEBD9',
    manufacturer: 'Smart Palette Studio',
    category: 'Neutral',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'An elegant subtle ivory with warm undertones perfect for living spaces.'
  },
  {
    name: 'Pebble Walk',
    hex: '#D1CCC0',
    manufacturer: 'Smart Palette Studio',
    category: 'Neutral',
    finishOptions: ['matte', 'eggshell', 'satin', 'glossy'],
    description: 'A timeless balanced greige suitable for modern minimalist interiors.'
  },
  {
    name: 'Urban Slate',
    hex: '#6C7A89',
    manufacturer: 'Smart Palette Studio',
    category: 'Neutral',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'A contemporary medium grey with cool undertones for accent walls.'
  },

  // Warm & Sun-Kissed
  {
    name: 'Terracotta Hearth',
    hex: '#C86D51',
    manufacturer: 'Smart Palette Studio',
    category: 'Warm',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'An earthy clay red-orange evoking warmth, craftsmanship, and comfort.'
  },
  {
    name: 'Golden Ochre',
    hex: '#D4AF37',
    manufacturer: 'Smart Palette Studio',
    category: 'Warm',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'A rich golden amber that captures the feeling of late afternoon sunlight.'
  },
  {
    name: 'Tuscan Peach',
    hex: '#F8B195',
    manufacturer: 'Smart Palette Studio',
    category: 'Warm',
    finishOptions: ['matte', 'eggshell'],
    description: 'A cheerful yet subtle peachy glow suited for bedrooms and breakfast nooks.'
  },
  {
    name: 'Spiced Cinnamon',
    hex: '#8D4024',
    manufacturer: 'Smart Palette Studio',
    category: 'Warm',
    finishOptions: ['matte', 'satin'],
    description: 'A deep, appetizing brown-red accent tone that anchors formal dining spaces.'
  },

  // Cool & Serene
  {
    name: 'Nordic Sky',
    hex: '#A0C4E2',
    manufacturer: 'Smart Palette Studio',
    category: 'Cool',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'A refreshing light blue that expands perceived ceiling height and open spaces.'
  },
  {
    name: 'Midnight Navy',
    hex: '#1B263B',
    manufacturer: 'Smart Palette Studio',
    category: 'Cool',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'An authoritative deep navy ideal for dramatic accents and media rooms.'
  },
  {
    name: 'Aegean Teal',
    hex: '#2A7B88',
    manufacturer: 'Smart Palette Studio',
    category: 'Cool',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'A balanced ocean teal bringing tranquility and modern character.'
  },
  {
    name: 'Misty Morning',
    hex: '#B8C5D6',
    manufacturer: 'Smart Palette Studio',
    category: 'Cool',
    finishOptions: ['matte', 'eggshell'],
    description: 'A gentle silver-blue that feels calm, serene, and sophisticated.'
  },

  // Earthy Greens
  {
    name: 'Sage Sanctuary',
    hex: '#9CAF88',
    manufacturer: 'Smart Palette Studio',
    category: 'Earthy',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'A soothing botanical sage bringing biophilic natural harmony indoors.'
  },
  {
    name: 'Deep Forest',
    hex: '#264653',
    manufacturer: 'Smart Palette Studio',
    category: 'Earthy',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'A rich woodland pine tone that creates an intimate, grounded aesthetic.'
  },
  {
    name: 'Olive Grove',
    hex: '#6B705C',
    manufacturer: 'Smart Palette Studio',
    category: 'Earthy',
    finishOptions: ['matte', 'eggshell', 'satin'],
    description: 'A muted Mediterranean olive green offering rustic elegance.'
  },
  {
    name: 'Eucalyptus Breeze',
    hex: '#A3B18A',
    manufacturer: 'Smart Palette Studio',
    category: 'Earthy',
    finishOptions: ['matte', 'eggshell'],
    description: 'A soft, airy green that complements light timber finishes and indoor plants.'
  },

  // Pastels & Soft Tones
  {
    name: 'Lavender Mist',
    hex: '#C5B4E3',
    manufacturer: 'Smart Palette Studio',
    category: 'Pastel',
    finishOptions: ['matte', 'eggshell'],
    description: 'A delicate floral pastel that encourages restfulness and focus.'
  },
  {
    name: 'Buttercup Cream',
    hex: '#F9F1A5',
    manufacturer: 'Smart Palette Studio',
    category: 'Pastel',
    finishOptions: ['matte', 'eggshell'],
    description: 'A gentle pale yellow bringing a subtle kiss of sunshine.'
  },
  {
    name: 'Blush Powder',
    hex: '#F4C2C2',
    manufacturer: 'Smart Palette Studio',
    category: 'Pastel',
    finishOptions: ['matte', 'eggshell'],
    description: 'A sophisticated dusty pink with neutral grey undertones.'
  },

  // Dark & Moody Accents
  {
    name: 'Charcoal Velour',
    hex: '#2B2D42',
    manufacturer: 'Smart Palette Studio',
    category: 'Dark & Moody',
    finishOptions: ['matte', 'satin'],
    description: 'A luxurious deep charcoal that frames artwork and woodwork beautifully.'
  },
  {
    name: 'Imperial Plum',
    hex: '#4A154B',
    manufacturer: 'Smart Palette Studio',
    category: 'Dark & Moody',
    finishOptions: ['matte', 'satin', 'glossy'],
    description: 'A regal jewel-toned aubergine with dramatic depth and character.'
  },
  {
    name: 'Espresso Roast',
    hex: '#3D2B1F',
    manufacturer: 'Smart Palette Studio',
    category: 'Dark & Moody',
    finishOptions: ['matte', 'satin'],
    description: 'A grounded dark chocolate brown that adds richness and cozy comfort.'
  }
];

export const samplePatterns = [
  {
    name: 'Nordic Chevron',
    category: 'Geometric',
    description: 'Modern minimalist zig-zag geometric pattern.',
    defaultScale: 1.0,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M0 20 L20 40 L40 20 L20 0 Z" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/></svg>'
  },
  {
    name: 'Subtle Vertical Stripes',
    category: 'Stripes',
    description: 'Refined architectural vertical pinstripes.',
    defaultScale: 1.0,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" stroke-width="2" opacity="0.25"/></svg>'
  },
  {
    name: 'Art Deco Diamond',
    category: 'Geometric',
    description: 'Classic luxury diamond trellis motif.',
    defaultScale: 1.2,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><polygon points="30,5 55,30 30,55 5,30" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/><circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.4"/></svg>'
  },
  {
    name: 'Polka Stipple',
    category: 'Dots',
    description: 'Playful yet modern stippled dot distribution.',
    defaultScale: 0.8,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.3"/><circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.2"/><circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.2"/></svg>'
  },
  {
    name: 'Linen Weave Texture',
    category: 'Textures',
    description: 'Organic cross-hatch simulating fine linen fabric wall covering.',
    defaultScale: 0.7,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 5h20M0 15h20M5 0v20M15 0v20" stroke="currentColor" stroke-width="1" opacity="0.2"/></svg>'
  },
  {
    name: 'Botanical Leaf Outline',
    category: 'Floral',
    description: 'Subtle stylized eucalyptus leaves for natural elegance.',
    defaultScale: 1.5,
    svgContent: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><path d="M40 70 C20 50 15 25 40 10 C65 25 60 50 40 70 Z M40 70 L40 10" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/></svg>'
  }
];

export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Starting database seed...');

  // 1. Seed or Update Colors
  for (const colorData of sampleColors) {
    await Color.findOneAndUpdate(
      { hex: colorData.hex },
      { $set: colorData },
      { upsert: true, new: true }
    );
  }
  console.log(`🎨 Seeded ${sampleColors.length} paint colors across multiple categories.`);

  // 2. Seed or Update Patterns
  for (const patternData of samplePatterns) {
    await Pattern.findOneAndUpdate(
      { name: patternData.name },
      { $set: patternData },
      { upsert: true, new: true }
    );
  }
  console.log(`✨ Seeded ${samplePatterns.length} wall patterns.`);

  // 3. Provision Administrator Account (Documented, secure from env vars)
  const adminEmail = config.adminEmail.toLowerCase();
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(config.adminPassword, salt);

    admin = await User.create({
      name: config.adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      favoriteColors: ['#1B263B', '#9CAF88', '#F4F1EA']
    });
    console.log(`👑 Administrator provisioned: ${adminEmail} (password configured from env)`);
  } else {
    admin.role = 'admin';
    await admin.save();
    console.log(`👑 Administrator confirmed: ${adminEmail}`);
  }

  // 4. Provision Demo Regular User with sample project
  const demoEmail = 'demo@wallvisualizer.com';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Demo@123456', salt);
    demoUser = await User.create({
      name: 'Demo Interior Enthusiast',
      email: demoEmail,
      passwordHash,
      role: 'user',
      favoriteColors: ['#A0C4E2', '#C86D51']
    });
    console.log(`👤 Demo regular user created: ${demoEmail} / Demo@123456`);
  }

  // Seed sample project if demoUser has no projects
  const existingProject = await Project.findOne({ userId: demoUser._id });
  if (!existingProject) {
    await Project.create({
      userId: demoUser._id,
      name: 'Living Room Renovation Concept',
      originalImageUrl: '/assets/sample-rooms/modern_living_room.svg',
      thumbnailUrl: '/assets/sample-rooms/modern_living_room.svg',
      wallSelections: [
        {
          id: 'wall-selection-1',
          name: 'Main Accent Wall',
          type: 'polygon',
          points: [
            { x: 120, y: 80 },
            { x: 480, y: 80 },
            { x: 480, y: 380 },
            { x: 120, y: 380 }
          ],
          paintSettings: {
            hex: '#2A7B88',
            colorName: 'Aegean Teal',
            opacity: 0.75,
            intensity: 1.0,
            finish: 'matte'
          }
        },
        {
          id: 'wall-selection-2',
          name: 'Side Feature Wall',
          type: 'polygon',
          points: [
            { x: 480, y: 80 },
            { x: 720, y: 120 },
            { x: 720, y: 360 },
            { x: 480, y: 380 }
          ],
          paintSettings: {
            hex: '#F4F1EA',
            colorName: 'Alabaster Whisper',
            opacity: 0.7,
            intensity: 1.0,
            finish: 'satin'
          }
        }
      ],
      appliedDesigns: [
        {
          wallSelectionId: 'wall-selection-1',
          hex: '#2A7B88',
          opacity: 0.75,
          finish: 'matte'
        },
        {
          wallSelectionId: 'wall-selection-2',
          hex: '#F4F1EA',
          opacity: 0.7,
          finish: 'satin'
        }
      ]
    });
    console.log('🖼️ Seeded initial demo project with wall selections and applied designs.');
  }

  console.log('✅ Database seed completed successfully!');
};

// If run directly via `npm run seed`
if (require.main === module) {
  connectDatabase()
    .then(() => seedDatabase())
    .then(() => disconnectDatabase())
    .catch((err) => {
      console.error('❌ Database seed error:', err);
      process.exit(1);
    });
}
