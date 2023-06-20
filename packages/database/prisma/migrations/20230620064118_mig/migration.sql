-- CreateTable
CREATE TABLE "Account" (
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "symbol" TEXT NOT NULL DEFAULT '',
    "image_url" TEXT NOT NULL DEFAULT '',
    "website_url" TEXT NOT NULL DEFAULT '',
    "access_url" TEXT NOT NULL DEFAULT '',
    "ipfs_metadata" TEXT NOT NULL DEFAULT '',
    "maxSupply" INTEGER NOT NULL,
    "burnable" BOOLEAN NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseStudents" (
    "courseAddress" TEXT NOT NULL,
    "studentAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,

    CONSTRAINT "CourseStudents_pkey" PRIMARY KEY ("courseAddress","studentAddress")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_address_chainId_key" ON "Course"("address", "chainId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseStudents_courseAddress_studentAddress_key" ON "CourseStudents"("courseAddress", "studentAddress");

-- AddForeignKey
ALTER TABLE "CourseStudents" ADD CONSTRAINT "CourseStudents_courseAddress_chainId_fkey" FOREIGN KEY ("courseAddress", "chainId") REFERENCES "Course"("address", "chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
