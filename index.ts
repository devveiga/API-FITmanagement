import express from 'express'
import routesAlunos from './routes/alunos'
import routesInstrutores from './routes/instrutores'
import routesExercicios from './routes/exercicios'
import routesTreinos from './routes/treinos'
import routesTreinoexercicios from './routes/treinoexercicios'
import routesUsuarios from './routes/usuarios'
import routesLogin from './routes/login'
import routesSeguranca from './routes/seguranca'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = 3000

app.use(express.json())

app.use("/alunos", routesAlunos)
app.use("/instrutores", routesInstrutores)
app.use("/exercicios", routesExercicios)
app.use("/treinos", routesTreinos)
app.use("/treinoexercicios", routesTreinoexercicios) 
app.use("/usuarios", routesUsuarios)
app.use("/login", routesLogin)
app.use("/seguranca", routesSeguranca)

app.use

app.get('/', (req, res) => {
  res.send('API: Controle treinos de academia')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})