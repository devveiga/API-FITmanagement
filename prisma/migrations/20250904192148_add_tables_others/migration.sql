/*
  Warnings:

  - You are about to drop the column `alunoId` on the `treino` table. All the data in the column will be lost.
  - You are about to drop the `alunos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `instrutor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `perfilId` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `alunos` DROP FOREIGN KEY `alunos_instrutorId_fkey`;

-- DropForeignKey
ALTER TABLE `alunos` DROP FOREIGN KEY `alunos_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `treino` DROP FOREIGN KEY `Treino_alunoId_fkey`;

-- DropIndex
DROP INDEX `Treino_alunoId_fkey` ON `treino`;

-- AlterTable
ALTER TABLE `treino` DROP COLUMN `alunoId`;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `perfilId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `alunos`;

-- DropTable
DROP TABLE `instrutor`;

-- CreateTable
CREATE TABLE `perfis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `permissoes` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agendamentos_treino` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(36) NOT NULL,
    `treinoId` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `dataCriacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dataAgendada` DATETIME(3) NOT NULL,
    `observacoes` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_perfilId_fkey` FOREIGN KEY (`perfilId`) REFERENCES `perfis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos_treino` ADD CONSTRAINT `agendamentos_treino_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agendamentos_treino` ADD CONSTRAINT `agendamentos_treino_treinoId_fkey` FOREIGN KEY (`treinoId`) REFERENCES `Treino`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
