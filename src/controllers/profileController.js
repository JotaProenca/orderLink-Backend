// src/controllers/profileController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getMyProfile = async (req, res) => {
  const userId = req.user.id; // Vem do middleware JWT

  if (!userId) {
    return res.status(401).json({ message: 'ID do usuário não encontrado no token.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // Inclui os dados das contas vinculadas na consulta
      include: {
        linkedAccounts: { // Nome da relação definida no schema User
          select: { // Seleciona apenas os campos úteis da conta vinculada
            provider: true,
            providerAccountId: true // Pode ser útil no futuro
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Remove a senha do objeto antes de enviar (mesmo que seja hash)
    const { password, ...userWithoutPassword } = user;

    // Formata a resposta incluindo as contas vinculadas (será um array vazio inicialmente)
    const profileData = {
      nomeUsuario: userWithoutPassword.name || 'Usuário',
      imagemUsuario: userWithoutPassword.imageBase64 || null,
      permissoes: {
        cadastrarItem: userWithoutPassword.canCadastrarItem,
        minhaEmpresa: userWithoutPassword.canMinhaEmpresa,
        gerenciarItens: userWithoutPassword.canGerenciarItens
      },
      // Adiciona informações sobre contas vinculadas
      contasVinculadas: userWithoutPassword.linkedAccounts.map(acc => acc.provider) // Envia apenas os nomes dos provedores
      // Ou envie o array completo se precisar do ID no front:
      // contasVinculadas: userWithoutPassword.linkedAccounts
    };

    res.json(profileData);

  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};