-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "clickPower" INTEGER NOT NULL DEFAULT 1,
    "unlockedAutoClicker" BOOLEAN NOT NULL DEFAULT false,
    "selectedCar" TEXT,
    "ownedCars" TEXT[] DEFAULT ARRAY['default']::TEXT[],
    "profilePicture" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
