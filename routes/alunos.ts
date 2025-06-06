import { Aluno, PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import nodemailer from "nodemailer"

const prisma = new PrismaClient()

const router = Router()

const alunoSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  idade: z.number().int().min(0, "A idade deve ser um número inteiro não negativo"),
  email: z.string().email("O e-mail deve ser válido"),
  telefone: z.string().optional(),
  dataCadastro: z.string().optional(),
  instrutorId: z.number().int().optional(),
})

router.get("/", async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany()
    res.status(200).json(alunos)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = alunoSchema.safeParse(req.body);
  if (!valida.success) {
    res.status(400).json({ erro: valida.error });
    return;
  }

  const { nome, idade, email, telefone, dataCadastro, instrutorId } = valida.data;

  try {
    const aluno = await prisma.aluno.create({
      data: {
        nome,
        idade,
        email,
        telefone,
        dataCadastro,
        instrutorId
      }
    });
    res.status(201).json(aluno);
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/:id", async (req, res) => {
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


router.put("/:id", async (req, res) => {
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

///// email ///////




router.post("/email/:alunoId", async (req, res) => {
  const { alunoId } = req.params;

  try {
    // 1. Busca o aluno e seus treinos
    const aluno = await prisma.aluno.findUnique({
      where: { id: Number(alunoId) },
      include: {
        treinos: {
          select: {
            descricao: true,
            dataInicio: true,
            ativo: true
          }
        }
      }
    });

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }

    // 2. Monta o conteúdo do e-mail (com HTML formatado em tabela)
    const htmlContent = `
      <h2>Olá ${aluno.nome},</h2>
      <p>Segue a lista dos seus treinos cadastrados:</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
        <thead style="background-color: #f2f2f2;">
          <tr>
            <th>Descrição</th>
            <th>Data de Início</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${aluno.treinos.map(t => `
            <tr>
              <td>${t.descricao}</td>
              <td>${new Date(t.dataInicio).toLocaleDateString('pt-BR')}</td>
              <td>${t.ativo ? "Ativo" : "Inativo"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <p style="margin-top: 20px;">Atenciosamente,<br/>Academia Fit</p>
    `;

    // 3. Configura o transporte de e-mail  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vitor16veiga61@gmail.com',
        pass: 'nbzn viqr xebc tdfw' // ⚠️ Lembre-se de usar uma senha de app!
      }
    });

    // 4. Envia o e-mail com HTML
    await transporter.sendMail({
      from: '"Academia VitorVeigaFIT" <vitor16veiga61@gmail.com>',
      to: aluno.email,
      subject: "Resumo dos seus treinos",
      html: htmlContent
    });

    res.status(200).json({ message: "E-mail enviado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});




export default router
