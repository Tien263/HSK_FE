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
