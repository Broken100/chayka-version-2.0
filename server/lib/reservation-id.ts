/**
 * Generate a reservation id in the format `RES-XXXXXX` (6 random digits).
 * Retries up to 5 times to avoid colliding with existing ids in the database.
 */
export async function generateReservationId(
  exists: (id: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!(await exists(id))) return id;
  }
  throw new Error('Failed to generate unique reservation id after 5 attempts');
}
