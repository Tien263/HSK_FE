-- CreateEnum
CREATE TYPE "DictionaryMeaningViStatus" AS ENUM ('MISSING', 'GENERATED', 'REVIEWED');

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" SERIAL NOT NULL,
    "simplified" TEXT NOT NULL,
    "traditional" TEXT NOT NULL,
    "pinyinNumbered" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "pinyinSearch" TEXT NOT NULL,
    "definitionsEn" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "definitionsVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "meaningViSource" TEXT,
    "meaningViStatus" "DictionaryMeaningViStatus" NOT NULL DEFAULT 'MISSING',
    "meaningViUpdatedAt" TIMESTAMP(3),
    "meaningViRevision" INTEGER NOT NULL DEFAULT 0,
    "meaningViSearch" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'CC-CEDICT',
    "sourceVersion" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryCharacter" (
    "character" TEXT NOT NULL,
    "hanViet" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Unihan',
    "sourceVersion" TEXT,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictionaryCharacter_pkey" PRIMARY KEY ("character")
);

-- CreateTable
CREATE TABLE "DictionaryEntryCharacter" (
    "entryId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "traditionalCharacter" TEXT NOT NULL,
    "simplifiedCharacter" TEXT,

    CONSTRAINT "DictionaryEntryCharacter_pkey" PRIMARY KEY ("entryId","position")
);

-- CreateTable
CREATE TABLE "DictionarySentenceTranslation" (
    "key" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DictionarySentenceTranslation_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "dictionary_entry_simplified_idx" ON "DictionaryEntry"("simplified");

-- CreateIndex
CREATE INDEX "dictionary_entry_traditional_idx" ON "DictionaryEntry"("traditional");

-- CreateIndex
CREATE INDEX "dictionary_entry_pinyin_search_idx" ON "DictionaryEntry"("pinyinSearch");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_entry_lexical_key" ON "DictionaryEntry"("traditional", "simplified", "pinyinNumbered");

-- CreateIndex
CREATE INDEX "dictionary_entry_character_traditional_idx" ON "DictionaryEntryCharacter"("traditionalCharacter");

-- AddForeignKey
ALTER TABLE "DictionaryEntryCharacter" ADD CONSTRAINT "DictionaryEntryCharacter_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "DictionaryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionaryEntryCharacter" ADD CONSTRAINT "DictionaryEntryCharacter_traditionalCharacter_fkey" FOREIGN KEY ("traditionalCharacter") REFERENCES "DictionaryCharacter"("character") ON DELETE RESTRICT ON UPDATE CASCADE;
