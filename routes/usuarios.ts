import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const router = Router()

const usuarioSchema = z.object({
  nome: z.string().min(10,
    { message: "Nome deve possuir, no mínimo, 10 caracteres" }),
  email: z.string().email().min(10,
    { message: "E-mail, no mínimo, 10 caracteres" }),
  senha: z.string(),
  perguntaSecreta: z.string().optional(),
  respostaSecreta: z.string().optional()
})

router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany()
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})


function validaSenha(senha: string) {

  const mensa: string[] = []

  // .length: retorna o tamanho da string (da senha)
  if (senha.length < 8) {
    mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
  }

  // contadores
  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  // senha = "abc123"
  // letra = "a"

  // percorre as letras da variável senha
  for (const letra of senha) {
    // expressão regular
    if ((/[a-z]/).test(letra)) {
      pequenas++
    }
    else if ((/[A-Z]/).test(letra)) {
      grandes++
    }
    else if ((/[0-9]/).test(letra)) {
      numeros++
    } else {
      simbolos++
    }
  }

  if (pequenas == 0) {
    mensa.push("Erro... senha deve possuir letra(s) minúscula(s)")
  }

  if (grandes == 0) {
    mensa.push("Erro... senha deve possuir letra(s) maiúscula(s)")
  }

  if (numeros == 0) {
    mensa.push("Erro... senha deve possuir número(s)")
  }

  if (simbolos == 0) {
    mensa.push("Erro... senha deve possuir símbolo(s)")
  }

  return mensa
}

router.post("/", async (req, res) => {

  const valida = usuarioSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, email, senha, perguntaSecreta, respostaSecreta } = valida.data

  const mensagensErro = validaSenha(senha)

  if (mensagensErro.length > 0) {
    res.status(400).json({ erro: mensagensErro.join("; ") })
    return    
  }

 
  const salt = bcrypt.genSaltSync(12)


  const hash = bcrypt.hashSync(senha, salt)

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: hash, perguntaSecreta, respostaSecreta: respostaSecreta ? bcrypt.hashSync(respostaSecreta, 12) : undefined }
    })
    // Cria log de criação de usuário
    await prisma.log.create({
      data: {
        usuarioId: usuario.id,
        descricao: "Usuário criado",
        complemento: `Usuário: ${usuario.id} - ${usuario.nome}`
      }
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const usuario = await prisma.usuario.delete({
      where: { id }
    })
    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = usuarioSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, email, senha, perguntaSecreta, respostaSecreta } = valida.data

  let dataToUpdate: any = { nome, email }

  if (senha) {
    const salt = bcrypt.genSaltSync(12)
    dataToUpdate.senha = bcrypt.hashSync(senha, salt)
  }
  if (perguntaSecreta) {
    dataToUpdate.perguntaSecreta = perguntaSecreta
  }
  if (respostaSecreta) {
    dataToUpdate.respostaSecreta = bcrypt.hashSync(respostaSecreta, 12)
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate
    })
    res.status(200).json(usuario)
  } catch (error) {
    res.status(400).json({ error })
  }
})

export default router
