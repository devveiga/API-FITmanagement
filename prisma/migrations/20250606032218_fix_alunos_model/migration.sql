/*
  Warnings:

  - You are about to drop the column `email` on the `instrutor` table. All the data in the column will be lost.
  - You are about to drop the column `especialidade` on the `instrutor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `aluno` DROP FOREIGN KEY `Aluno_instrutorId_fkey`;

-- DropIndex
DROP INDEX `Aluno_email_key` ON `aluno`;

-- DropIndex
DROP INDEX `Instrutor_email_key` ON `instrutor`;

-- AlterTable
ALTER TABLE `aluno` MODIFY `dataCadastro` DATETIME(3) NULL,
    MODIFY `instrutorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `instrutor` DROP COLUMN `email`,
    DROP COLUMN `especialidade`;

-- AddForeignKey
ALTER TABLE `Aluno` ADD CONSTRAINT `Aluno_instrutorId_fkey` FOREIGN KEY (`instrutorId`) REFERENCES `Instrutor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
