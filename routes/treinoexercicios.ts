import { Aluno, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

const router = Router()

const treinoexercicio = z.object({
    id: z.number().int().optional(),
    treinoId: z.number().int(),
    exercicioId: z.number().int(),
    series: z.number().int().min(1, "O número de séries deve ser pelo menos 1"),
    repeticoes: z.number().int().min(1, "O número de repetições deve ser pelo menos 1"),
    carga: z.number().optional(),
})

router.get("/", async (req, res) => {
  try {
    const texercicios = await prisma.treinoExercicio.findMany()
    res.status(200).json(texercicios)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = treinoexercicio.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const { id, treinoId, exercicioId, series, repeticoes, carga } = valida.data;

  try {
    const texercicios = await prisma.treinoExercicio.create({
      data: {
        id,
        treinoId,
        exercicioId,
        series,
        repeticoes,
        carga

      }
    });
    res.status(201).json(texercicios);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const texercicios = await prisma.treinoExercicio.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(texercicios)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = treinoexercicio.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { treinoId, exercicioId, series, repeticoes, carga } = valida.data

  try {
    const texercicios = await prisma.treinoExercicio.update({
      where: { id: Number(id) },
      data: { treinoId, exercicioId, series, repeticoes, carga }
    })
    res.status(200).json(texercicios)
  } catch (error) {
    res.status(400).json({ error })
  }
})



export default router
