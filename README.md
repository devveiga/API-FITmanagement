API-FITmanagement

Este é um projeto de gerenciamento de treinos de academia.

📦 Dependências

Para instalar as dependências do projeto, execute:

npm install
npm i --save-dev @types/jsonwebtoken
npm i --save-dev @types/bcrypt
npm install @prisma/client
npm install prisma --save-dev
npm install express

⚙️ Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto com os seguintes parâmetros:

DATABASE_URL="mysql://user:password@host:0000/database"
JWT_SECRET="segredo"
