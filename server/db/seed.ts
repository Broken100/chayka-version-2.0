import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './client.js';
import { menuItems, tables, businessConfig } from './schema.js';

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

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
