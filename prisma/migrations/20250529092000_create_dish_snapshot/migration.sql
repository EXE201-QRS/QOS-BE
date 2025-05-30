-- CreateTable
CREATE TABLE "DishSnapshot" (
    "id" SERIAL NOT NULL,
    "dishId" INTEGER NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "description" VARCHAR(1000) NOT NULL DEFAULT '',
    "image" VARCHAR(1000) NOT NULL DEFAULT '',
    "status" "DishStatus" NOT NULL DEFAULT 'INACTIVE',

    CONSTRAINT "DishSnapshot_pkey" PRIMARY KEY ("id")
);
-- AddForeignKey
ALTER TABLE "DishSnapshot" ADD CONSTRAINT "DishSnapshot_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "Dish"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
