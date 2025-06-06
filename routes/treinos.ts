import { Aluno, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

const router = Router()

const treino = z.object({
    descricao: z.string().min(5, "A descrição do treino deve ter pelo menos 5 caracteres"),
    dataInicio: z.string().datetime({ message: "A data de início deve ser uma data válida" }),
    ativo: z.boolean().default(true),
    alunoId: z.number().int(),
    exercicios: z
        .array(
            z.object({
                exercicioId: z.number().int(),
                series: z.number().int(),
                repeticoes: z.number().int(),
            })
        )
        .optional(),
})

router.get("/", async (req, res) => {
  try {
    const treinos = await prisma.treino.findMany()
    res.status(200).json(treinos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
    const valida = treino.safeParse(req.body);
    if (!valida.success) {
      res.status(400).json({ erro: valida.error });
      return;
    }
  
    const { descricao, dataInicio, ativo, alunoId, exercicios } = valida.data;
  
    try {
      const novoTreino = await prisma.$transaction(async (tx) => {
      
        const treinoCriado = await tx.treino.create({
          data: {
        
            descricao,
            dataInicio,
            ativo,
            alunoId
          }
        });
  
    
        if (exercicios && exercicios.length > 0) {
          await tx.treinoExercicio.createMany({
            data: exercicios.map((ex) => ({
              treinoId: treinoCriado.id,
              exercicioId: ex.exercicioId,
              series: ex.series,
              repeticoes: ex.repeticoes
            }))
          });
        }
  
        return treinoCriado;
      });
  
      res.status(201).json(novoTreino);
    } catch (error) {

        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
          } else {
            res.status(400).json({ error: String(error) });
          }
          
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      await prisma.$transaction(async (tx) => {
        await tx.treinoExercicio.deleteMany({
          where: {
            treinoId: Number(id),
          },
        });
  
        await tx.treino.delete({
          where: {
            id: Number(id),
          },
        });
      });
  
      res.status(200).json({ message: `Treino ${id} apagado com sucesso.` });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const valida = treino.safeParse(req.body);
  
    if (!valida.success) {
      return res.status(400).json({ erro: valida.error });
    }
  
    const { descricao, dataInicio, ativo, alunoId, exercicios } = valida.data;
  
    try {
      const treinoAtualizado = await prisma.$transaction(async (tx) => {
        
        const atualizado = await tx.treino.update({
          where: { id: Number(id) },
          data: { descricao, dataInicio, ativo, alunoId },
        });
  
       
        await tx.treinoExercicio.deleteMany({ where: { treinoId: atualizado.id } });
  
     
        if (exercicios && exercicios.length > 0) {
          await tx.treinoExercicio.createMany({
            data: exercicios.map((ex) => ({
              treinoId: atualizado.id,
              exercicioId: ex.exercicioId,
              series: ex.series,
              repeticoes: ex.repeticoes,
            })),
          });
        }
  
        return atualizado;
      });
  
      res.status(200).json(treinoAtualizado);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });
  



export default router
