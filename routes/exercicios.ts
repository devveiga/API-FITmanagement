import { Aluno, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

const router = Router()

const exercicio = z.object({
 id: z.number().int().optional(),
 nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
 grupoMuscular: z.string().min(3, "O grupo muscular deve ter pelo menos 3 caracteres"),
 descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
})

router.get("/", async (req, res) => {
  try {
    const exercicios = await prisma.exercicio.findMany()
    res.status(200).json(exercicios)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = exercicio.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const { id, nome, grupoMuscular, descricao } = valida.data;

  try {
    const exercicios = await prisma.exercicio.create({
      data: {
        id, 
        nome, 
        grupoMuscular, 
        descricao
      }
    });
    res.status(201).json(exercicios);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const exercicios = await prisma.exercicio.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(exercicios)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = exercicio.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, grupoMuscular, descricao } = valida.data

  try {
    const exercicios = await prisma.exercicio.update({
      where: { id: Number(id) },
      data: { nome, grupoMuscular, descricao}
    })
    res.status(200).json(exercicios)
  } catch (error) {
    res.status(400).json({ error })
  }
})



export default router
