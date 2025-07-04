import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

const router = Router()

router.get('/backup', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany()
    const alunos = await prisma.aluno.findMany()
    const exercicios = await prisma.exercicio.findMany()
    const treinos = await prisma.treino.findMany()
    const treinoexercicios = await prisma.treinoExercicio.findMany()
    const instrutores = await prisma.instrutor.findMany()
    const logs = await prisma.log.findMany()

    const dadosBackup = {
      usuarios,
      alunos,
      exercicios,
      treinos,
      treinoexercicios,
      instrutores,
      logs,
      dataBackup: new Date().toISOString()
    }

    const caminho = path.resolve(__dirname, '../../backup.json')
    fs.writeFileSync(caminho, JSON.stringify(dadosBackup, null, 2))

    res.json({ mensagem: 'Backup gerado com sucesso!', arquivo: 'backup.json' })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao gerar o backup.' })
  }
})

router.post('/restore', async (req, res) => {
  try {
    const caminho = path.resolve(__dirname, '../../backup.json')
    if (!fs.existsSync(caminho)) {
      return res.status(404).json({ erro: 'Arquivo de backup.json não encontrado.' })
    }

    const conteudo = fs.readFileSync(caminho, 'utf8')
    const dados = JSON.parse(conteudo)

    // 1. Deletar todos os registros (ordem reversa das relações)
    await prisma.log.deleteMany()
    await prisma.treinoExercicio.deleteMany()
    await prisma.treino.deleteMany()
    await prisma.aluno.deleteMany()
    await prisma.instrutor.deleteMany()
    await prisma.exercicio.deleteMany()
    await prisma.usuario.deleteMany()

    // 2. Inserir os dados (ordem correta para respeitar as FKs)
    for (const usuario of dados.usuarios) {
      await prisma.usuario.create({ data: usuario })
    }
    for (const instrutor of dados.instrutores) {
      await prisma.instrutor.create({ data: instrutor })
    }
    for (const exercicio of dados.exercicios) {
      await prisma.exercicio.create({ data: exercicio })
    }
    for (const aluno of dados.alunos) {
      await prisma.aluno.create({ data: aluno })
    }
    for (const treino of dados.treinos) {
      await prisma.treino.create({ data: treino })
    }
    for (const treinoexercicio of dados.treinoexercicios) {
      await prisma.treinoExercicio.create({ data: treinoexercicio })
    }
    for (const log of dados.logs) {
      await prisma.log.create({ data: log })
    }

    res.json({ mensagem: 'Dados restaurados com sucesso a partir do backup' })

  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao restaurar os dados.' })
  }
})

export default router