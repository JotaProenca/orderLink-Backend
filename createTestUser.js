// backend/createTestUser.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const email = 'teste@orderlink.com';
  const plainPassword = 'Jp.001451'; // Senha de teste simples
  const name = 'Usuário de Teste';

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`Usuário com email ${email} já existe.`);
    return;
  }

  // Gera o hash da senha
  const saltRounds = 10; // Fator de custo do bcrypt (padrão recomendado)
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  console.log(`Senha "${plainPassword}" hasheada para: ${hashedPassword.substring(0, 15)}...`);

  // Cria o usuário no banco
  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword, // Salva a senha HASHEADA
      name: name,
      // Você pode definir permissões padrão aqui se quiser
      canCadastrarItem: true,
      canMinhaEmpresa: true,
      canGerenciarItens: true,
    },
  });

  console.log(`Usuário de teste criado com sucesso:`);
  console.log(newUser);
}

main()
  .catch((e) => {
    console.error('Erro ao criar usuário de teste:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });