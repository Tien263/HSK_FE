const {loadEnvConfig}=require('@next/env');loadEnvConfig(process.cwd());
const {PrismaClient}=require('../src/generated/prisma');const fs=require('node:fs');const db=new PrismaClient();
(async()=>{try{for(const file of ['prisma/sql/learning-portal.sql','prisma/sql/teacher-classic-ui.sql']){let sql=fs.readFileSync(file,'utf8');
sql=sql.replace(/ADD COLUMN(?!\s+IF NOT EXISTS)\s+/g,'ADD COLUMN IF NOT EXISTS ').replace(/CREATE TABLE /g,'CREATE TABLE IF NOT EXISTS ').replace(/CREATE (UNIQUE )?INDEX /g,(_,unique)=>`CREATE ${unique||''}INDEX IF NOT EXISTS `);
sql=sql.replace(/ALTER TABLE [^;]+ ADD CONSTRAINT [^;]+;/g,statement=>`DO $$ BEGIN ${statement} EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
const statements=sql.split(/;\s*(?=--|$)/).map(value=>value.trim()).filter(Boolean);
await db.$transaction(async tx=>{for(const statement of statements)await tx.$executeRawUnsafe(statement);},{timeout:30000});}console.log('Learning portal tables ready; existing content preserved.');
}finally{await db.$disconnect();}})().catch(error=>{console.error(error.message);process.exitCode=1;});
