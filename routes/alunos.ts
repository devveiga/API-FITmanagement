import { Aluno, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"
import { verificaToken } from '../middlewares/verificaToken'

const prisma = new PrismaClient()

const router = Router()

const alunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  idade: z.number().int().min(0, "A idade deve ser um número inteiro não negativo"),
  email: z.string().email("O e-mail deve ser válido"),
  telefone: z.string().optional(),
  dataCadastro: z.string().optional(),
  instrutorId: z.number().int().optional(),
  usuarioId: z.string()
})

router.get("/", verificaToken, async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany()
    res.status(200).json(alunos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", verificaToken, async (req, res) => {
  const valida = alunoSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const { nome, idade, email, telefone, dataCadastro, instrutorId, usuarioId} = valida.data;

  try {
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        idade,
        email,
        telefone,
        dataCadastro,
        instrutorId,
        usuarioId
      }
    });
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.$transaction(async (tx) => {
      const treinosDoAluno = await tx.treino.findMany({
        where: { alunoId: Number(id) },
        select: { id: true },
      });

      const idsTreinos = treinosDoAluno.map((t) => t.id);

      
      await tx.treinoExercicio.deleteMany({
        where: { treinoId: { in: idsTreinos } },
      });

 
      await tx.treino.deleteMany({
        where: { alunoId: Number(id) },
      });

     
      await tx.aluno.delete({
        where: { id: Number(id) },
      });
    });

    res.status(200).json({ message: "Aluno e treinos excluídos com sucesso." });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
  }
});


router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params

  const valida = alunoSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, idade, email, telefone, dataCadastro, instrutorId } = valida.data

  try {
    const aluno = await prisma.aluno.update({
      where: { id: Number(id) },
      data: { nome, idade, email, telefone, dataCadastro, instrutorId }
    })
    res.status(200).json(aluno)
  } catch (error) {
    res.status(400).json({ error })
  }
})

);




export default router
