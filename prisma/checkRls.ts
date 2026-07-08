import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking Row Level Security (RLS) status on Supabase PostgreSQL tables...");
  
  const tables: any[] = await prisma.$queryRawUnsafe(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename ASC;
  `);

  console.log("\nTable RLS Status Matrix:");
  console.log("=========================================");
  let activeCount = 0;
  for (const t of tables) {
    const status = t.rowsecurity ? "✅ ACTIVE (RESTRICTED)" : "❌ DISABLED (UNRESTRICTED)";
    console.log(`- ${t.tablename.padEnd(25)} : ${status}`);
    if (t.rowsecurity) activeCount++;
  }
  console.log("=========================================");
  console.log(`Summary: ${activeCount} / ${tables.length} tables have RLS enabled.\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
