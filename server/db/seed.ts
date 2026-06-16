import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './client.js';
import { menuItems, tables, businessConfig, menuCategories, tableAreas } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SeedData {
  menuItems: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
    descriptionEs: string;
    descriptionEn: string;
    price: string;
    category: string;
    image: string;
    active: boolean;
    ingredientsEs: string[];
    ingredientsEn: string[];
    isSpecial: boolean;
    preparationTime: number;
  }>;
  tables: Array<{
    id: string;
    nameEs: string;
    nameEn: string;
    capacity: number;
    area: 'waterfall_deck' | 'fireplace_cozy' | 'indoor_premium' | 'terrace_panoramic';
    minimumConsumption: string;
  }>;
  businessConfig: {
    id: number;
    name: string;
    location: string;
    locationLink: string;
    whatsappNumber: string;
    minPeopleReservation: number;
    maxPeopleReservation: number;
    schedules: Array<{ day: string; hours: string }>;
    timeSlots: string[];
  };
}

async function seed() {
  const seedPath = join(__dirname, 'seed-data.json');
  const data: SeedData = JSON.parse(readFileSync(seedPath, 'utf-8'));

  console.log(`Seeding ${data.menuItems.length} menu items...`);
  for (const item of data.menuItems) {
    const values = {
      id: item.id,
      nameEs: item.nameEs,
      nameEn: item.nameEn,
      descriptionEs: item.descriptionEs,
      descriptionEn: item.descriptionEn,
      price: item.price,
      category: item.category,
      image: item.image,
      active: item.active,
      ingredientsEs: item.ingredientsEs,
      ingredientsEn: item.ingredientsEn,
      isSpecial: item.isSpecial,
      preparationTime: item.preparationTime
    };
    await db
      .insert(menuItems)
      .values(values as never)
      .onConflictDoUpdate({
        target: menuItems.id,
        set: {
          nameEs: item.nameEs,
          nameEn: item.nameEn,
          descriptionEs: item.descriptionEs,
          descriptionEn: item.descriptionEn,
          price: item.price,
          category: item.category,
          image: item.image,
          active: item.active,
          ingredientsEs: item.ingredientsEs,
          ingredientsEn: item.ingredientsEn,
          isSpecial: item.isSpecial,
          preparationTime: item.preparationTime,
          updatedAt: new Date()
        } as never
      });
  }

  console.log(`Seeding ${data.tables.length} tables...`);
  for (const table of data.tables) {
    const values = {
      id: table.id,
      nameEs: table.nameEs,
      nameEn: table.nameEn,
      capacity: table.capacity,
      area: table.area,
      minimumConsumption: table.minimumConsumption
    };
    await db
      .insert(tables)
      .values(values as never)
      .onConflictDoUpdate({
        target: tables.id,
        set: {
          nameEs: table.nameEs,
          nameEn: table.nameEn,
          capacity: table.capacity,
          area: table.area,
          minimumConsumption: table.minimumConsumption,
          updatedAt: new Date()
        } as never
      });
  }

  console.log('Seeding business config...');
  const configValues = {
    id: data.businessConfig.id,
    name: data.businessConfig.name,
    location: data.businessConfig.location,
    locationLink: data.businessConfig.locationLink,
    whatsappNumber: data.businessConfig.whatsappNumber,
    minPeopleReservation: data.businessConfig.minPeopleReservation,
    maxPeopleReservation: data.businessConfig.maxPeopleReservation,
    schedules: data.businessConfig.schedules,
    timeSlots: data.businessConfig.timeSlots
  };
  await db
    .insert(businessConfig)
    .values(configValues as never)
    .onConflictDoUpdate({
      target: businessConfig.id,
      set: {
        name: data.businessConfig.name,
        location: data.businessConfig.location,
        locationLink: data.businessConfig.locationLink,
        whatsappNumber: data.businessConfig.whatsappNumber,
        minPeopleReservation: data.businessConfig.minPeopleReservation,
        maxPeopleReservation: data.businessConfig.maxPeopleReservation,
        schedules: data.businessConfig.schedules,
        timeSlots: data.businessConfig.timeSlots,
        updatedAt: new Date()
      } as never
    });

  // Seed menu categories (idempotent — only seeds when table is empty).
  const existingCategories = await db.select({ id: menuCategories.id }).from(menuCategories);
  if (existingCategories.length === 0) {
    console.log('Seeding 3 menu categories...');
    const categoryRows = [
      {
        id: 'hot_drinks',
        nameEs: 'Bebidas Calientes',
        nameEn: 'Hot Drinks',
        displayOrder: 1,
        active: true
      },
      {
        id: 'frappes',
        nameEs: 'Frappés',
        nameEn: 'Frappes',
        displayOrder: 2,
        active: true
      },
      {
        id: 'soft_drinks',
        nameEs: 'Bebidas Soft',
        nameEn: 'Soft Drinks',
        displayOrder: 3,
        active: true
      }
    ];
    for (const row of categoryRows) {
      await db.insert(menuCategories).values(row as never);
    }
  } else {
    console.log(`Skipping menu categories seed (${existingCategories.length} existing rows).`);
  }

  // Seed table areas (idempotent — only seeds when table is empty).
  const existingAreas = await db.select({ id: tableAreas.id }).from(tableAreas);
  if (existingAreas.length === 0) {
    console.log('Seeding 4 table areas...');
    const areaRows = [
      {
        id: 'waterfall_deck',
        nameEs: 'Mirador Cascada',
        nameEn: 'Waterfall Deck',
        descriptionEs: 'Brisa refrescante, senderos florales con vista directa a la Cascada de Peguche.',
        descriptionEn: 'Refreshing breeze, floral paths with direct view of the Peguche Waterfall.',
        displayOrder: 1,
        active: true
      },
      {
        id: 'fireplace_cozy',
        nameEs: 'Chimenea Acogedora',
        nameEn: 'Fireplace Cozy',
        descriptionEs: 'Calor de hogar con fogón a leña, sillones de cuero y música acústica andina.',
        descriptionEn: 'Home warmth with wood stove, leather armchairs, and acoustic Andean music.',
        displayOrder: 2,
        active: true
      },
      {
        id: 'indoor_premium',
        nameEs: 'Interior Premium',
        nameEn: 'Indoor Premium',
        descriptionEs: 'Arquitectura rústica de madera tallada y piedra volcánica del norte de Otavalo.',
        descriptionEn: 'Rustic architecture of carved wood and volcanic stone from northern Otavalo.',
        displayOrder: 3,
        active: true
      },
      {
        id: 'terrace_panoramic',
        nameEs: 'Terraza Panorámica',
        nameEn: 'Terrace Panoramic',
        descriptionEs: 'Vista 360° al Cerro Imbabura y los valles sagrados, ideal para atardeceres mágicos.',
        descriptionEn: '360° view of Cerro Imbabura and sacred valleys, ideal for magical sunsights.',
        displayOrder: 4,
        active: true
      }
    ];
    for (const row of areaRows) {
      await db.insert(tableAreas).values(row as never);
    }
  } else {
    console.log(`Skipping table areas seed (${existingAreas.length} existing rows).`);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
