import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"
import { verificaToken } from '../middlewares/verificaToken'
import { Request } from "express"



const prisma = new PrismaClient()

const router = Router()


router.post("/", async (req, res) => {
  console.log('Requisição recebida no /login:', req.body)
  const { email, senha } = req.body

  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    console.log('Faltando email ou senha')
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  try {
    const usuario = await prisma.usuario.findFirst({
      where: { email }
    })
    console.log('Usuário encontrado:', usuario)

    if (usuario == null) {
      console.log('Usuário não encontrado')
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha)
    console.log('Senha correta?', senhaCorreta)

    if (senhaCorreta) {
      const token = jwt.sign({
        userLogadoId: usuario.id,
        userLogadoNome: usuario.nome
      }, process.env.JWT_SECRET || 'segredo', { expiresIn: '1h' })
      console.log('Login realizado com sucesso! Token gerado:', token)
      res.status(200).json({ token })
      return
    } else {

      const descricao = "Tentativa de acesso ao sistema"
      const complemento = "Usuário: " + usuario.id + " - " + usuario.nome

      
      const log = await prisma.log.create({
        data: { descricao, complemento, usuarioId: usuario.id }
      })
      
      res.status(400).json({ erro: mensaPadrao })
    }
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post('/alterar-senha', async (req, res) => {
  const { email, senhaAtual, novaSenha } = req.body
  if (!email || !senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Informe email, senha atual e nova senha.' })
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }
    const senhaCorreta = bcrypt.compareSync(senhaAtual, usuario.senha)
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Senha atual incorreta.' })
    }
    const novaSenhaCriptografada = bcrypt.hashSync(novaSenha, 12)
    await prisma.usuario.update({ where: { email }, data: { senha: novaSenhaCriptografada } })
    res.json({ mensagem: 'Senha alterada com sucesso.' })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao alterar a senha.' })
  }
})

// Endpoint para cadastro de usuário com pergunta e resposta secreta
router.post('/registrar', async (req, res) => {
  const { nome, email, senha, perguntaSecreta, respostaSecreta } = req.body
  if (!nome || !email || !senha || !perguntaSecreta || !respostaSecreta) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' })
  }
  try {
    const senhaCriptografada = bcrypt.hashSync(senha, 12)
    const respostaCriptografada = bcrypt.hashSync(respostaSecreta, 12)
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaCriptografada, perguntaSecreta, respostaSecreta: respostaCriptografada }
    })
    res.json({ mensagem: 'Usuário cadastrado com sucesso.', usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perguntaSecreta: usuario.perguntaSecreta } })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' })
  }
})

// Endpoint para recuperação de senha via pergunta secreta
router.post('/recuperar-senha', async (req, res) => {
  const { email, respostaSecreta, novaSenha } = req.body
  if (!email || !respostaSecreta || !novaSenha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' })
  }
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario || !usuario.respostaSecreta) {
      return res.status(404).json({ erro: 'Usuário não encontrado ou não possui pergunta secreta.' })
    }
    console.log('Resposta enviada:', respostaSecreta)
    console.log('Hash salvo:', usuario.respostaSecreta)
    const respostaCorreta = bcrypt.compareSync(respostaSecreta, usuario.respostaSecreta)
    console.log('Resposta correta?', respostaCorreta)
    if (!respostaCorreta) {
      return res.status(401).json({ erro: 'Resposta secreta incorreta.' })
    }
    const novaSenhaCriptografada = bcrypt.hashSync(novaSenha, 12)
    await prisma.usuario.update({ where: { email }, data: { senha: novaSenhaCriptografada } })
    res.json({ mensagem: 'Senha redefinida com sucesso.' })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ erro: 'Erro ao redefinir a senha.' })
  }
})

export default router