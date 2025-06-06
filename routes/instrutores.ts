import { Instrutor, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

const router = Router()



router.get("/", async (req, res) => {
  try {
    const instrutores = await prisma.instrutor.findMany()
    res.status(200).json(instrutores)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const instrutorSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  
  })
  const valida = instrutorSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }
  const {nome } = valida.data;

  try {
    const instrutores = await prisma.instrutor.create({
      data: {
        nome  
      }
    });
    res.status(201).json(instrutores);
  } catch (error) {
    res.status(400).json({ error });
  }
     
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const instrutor = await prisma.instrutor.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(instrutor)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
}
)
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const instrutorSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  })
  const valida = instrutorSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }
  const { nome } = valida.data;
  try {
    const instrutor = await prisma.instrutor.update({
      where: { id: Number(id) },
      data: { nome }
    })
    res.status(200).json(instrutor)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router