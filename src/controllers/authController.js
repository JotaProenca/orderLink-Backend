const { PrismaClient, Prisma } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para gerar o código de reset
const { sendPasswordResetEmail } = require('../utils/email'); // Importa a função de envio



const prisma = new PrismaClient();
const saltRounds = 10;

// Segredos e configurações para JWT de reset de senha (adicione ao seu .env)
const JWT_PASSWORD_RESET_SECRET = process.env.JWT_PASSWORD_RESET_SECRET || 'seu-outro-segredo-para-resetG4x!zV2#pRt@93La^kYw8sBnE1$uMhQ7*oZcJ6&Td9XeLbAv!fqN0rWiCg%UySm5';
const JWT_PASSWORD_RESET_EXPIRES_IN = process.env.JWT_PASSWORD_RESET_EXPIRES_IN || '5m'; // Token JWT para reset válido por 5 minutos


// --- Função de Login (Inalterada) ---
exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) { return res.status(400).json({ message: 'Identificador (Email ou CPF) e senha são obrigatórios.' }); }
  try {
    let user;
    const isEmail = identifier.includes('@');
    let cleanIdentifier = isEmail ? identifier : identifier.replace(/\D/g, '');
    if (isEmail) { user = await prisma.user.findFirst({ where: { email: cleanIdentifier } }); }
    else { user = await prisma.user.findFirst({ where: { cpf: cleanIdentifier } }); }
    if (!user) { return res.status(401).json({ message: 'Credenciais inválidas.' }); }
    if (!user.password) { return res.status(401).json({ message: 'Login via senha não disponível.' }); }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { return res.status(401).json({ message: 'Credenciais inválidas.' }); }
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    console.log(`Login bem-sucedido para usuário ID: ${user.id}`);
    res.json({ token });
  } catch (error) { console.error("Erro no login:", error); res.status(500).json({ message: 'Erro interno do servidor.' }); }
};

// --- Solicitar Código de Redefinição de Senha ---
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email é obrigatório.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Gerar código de 6 dígitos
      const resetCode = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Código válido por 15 minutos

      await prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: resetCode, // Em produção, considere hashear este código também
          resetPasswordExpires: expiresAt,
        },
      });

      // TODO: Implementar envio de email com o resetCode
      await sendPasswordResetEmail(email, resetCode);
      // Exemplo com Nodemailer (a ser implementado):
      // await sendPasswordResetEmail(email, resetCode);
    }

    // Resposta genérica para não revelar se o email existe ou não
    res.status(200).json({ message: 'Se um usuário com este email estiver cadastrado, um código de recuperação será enviado.' });

  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// --- Verificar Código de Redefinição e Gerar JWT de Reset ---
exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email e código são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetPasswordToken || user.resetPasswordToken !== code || new Date() > new Date(user.resetPasswordExpires)) {
      return res.status(400).json({ message: 'Código inválido ou expirado.' });
    }

    // Código válido, invalidar o código de 6 dígitos no banco
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Gerar um JWT de curta duração para a redefinição de senha
    const passwordResetJwtPayload = {
      userId: user.id,
      email: user.email,
      purpose: 'password-reset', // Importante para diferenciar de tokens de login
    };

    const passwordResetToken = jwt.sign(
      passwordResetJwtPayload,
      JWT_PASSWORD_RESET_SECRET,
      { expiresIn: JWT_PASSWORD_RESET_EXPIRES_IN }
    );

    res.json({
      message: 'Código verificado. Use o token para redefinir sua senha.',
      passwordResetToken: passwordResetToken,
    });

  } catch (error) {
    console.error("Erro ao verificar código de redefinição:", error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

// --- Redefinir Senha com Token JWT ---
exports.resetPasswordWithToken = async (req, res) => {
  const { passwordResetToken, newPassword } = req.body;

  if (!passwordResetToken || !newPassword) {
    return res.status(400).json({ message: 'Token de redefinição e nova senha são obrigatórios.' });
  }
  if (newPassword.length < 6) { // Adicione suas regras de validação de senha
    return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    // Verificar o JWT de reset
    const decoded = jwt.verify(passwordResetToken, JWT_PASSWORD_RESET_SECRET);

    if (decoded.purpose !== 'password-reset') {
      return res.status(401).json({ message: 'Token inválido para esta operação.' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar a senha do usuário (identificado pelo userId no token)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }, // Assumindo que seu campo de senha é 'password'
    });

    res.json({ message: 'Senha redefinida com sucesso.' });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token de redefinição inválido ou expirado. Por favor, solicite um novo código.' });
    }
    console.error("Erro ao redefinir senha com token:", error);
    res.status(500).json({ message: 'Erro interno ao redefinir a senha.' });
  }
};

// --- FUNÇÃO DE REGISTRO (SIMPLIFICADA - Chama SP) ---
exports.register = async (req, res) => {
  const {
    name, email, password, tipoEmpresa, cnpj, nomeFantasia, razaoSocial, cpf,
    cep, endereco, numero, complemento
  } = req.body;

  console.log('[SP_REGISTRO] Recebido payload:', req.body);

  // Validação Mínima
  if (!name || !email || !password || !tipoEmpresa) { return res.status(400).json({ message: 'Nome, Email, Senha e Tipo de Empresa obrigatórios.' }); }
  let cleanCnpj = cnpj?.replace(/\D/g, '') || null;
  let cleanCpf = cpf?.replace(/\D/g, '') || null;
  let cleanCep = cep?.replace(/\D/g, '') || null;
  if (tipoEmpresa === 'CNPJ' && (!cleanCnpj || !nomeFantasia || !razaoSocial || cleanCnpj.length !== 14)) { return res.status(400).json({ message: 'Dados de CNPJ inválidos ou incompletos.' }); }
  if (tipoEmpresa === 'CPF' && (!cleanCpf || cleanCpf.length !== 11)) { return res.status(400).json({ message: 'CPF inválido ou incompleto.' }); }
  if (tipoEmpresa !== 'CPF' && tipoEmpresa !== 'CNPJ') { return res.status(400).json({ message: "Tipo de Empresa inválido." }); }

  try {
    console.log('[SP_REGISTRO] Gerando hash da senha...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('[SP_REGISTRO] Hash gerado.');

    console.log('[SP_REGISTRO] Chamando Stored Procedure usp_RegisterUser...');
    const result = await prisma.$queryRaw(Prisma.sql`
        EXEC dbo.usp_RegisterUser
            @name = ${name}, @email = ${email}, @passwordHash = ${hashedPassword},
            @tipoEmpresa = ${tipoEmpresa}, @cnpj = ${cleanCnpj}, @nomeFantasia = ${nomeFantasia},
            @razaoSocial = ${razaoSocial}, @cpf = ${cleanCpf}, @cep = ${cleanCep},
            @endereco = ${endereco}, @numero = ${numero}, @complemento = ${complemento},
            @canCadastrarItem = 1, @canMinhaEmpresa = 1, @canGerenciarItens = 1
    `);

    console.log('[SP_REGISTRO] Resultado da Stored Procedure:', result);

    // Verificação mais robusta do resultado
    if (!result) {
      console.error('[SP_REGISTRO] Resultado nulo retornado pela SP');
      return res.status(500).json({ message: 'Erro: Stored Procedure retornou resultado nulo.' });
    }
    if (!Array.isArray(result)) {
      console.error('[SP_REGISTRO] Resultado não é um array:', result);
      return res.status(500).json({ message: 'Erro: Formato inválido retornado pela Stored Procedure.' });
    }
    if (result.length === 0) {
      console.error('[SP_REGISTRO] Resultado array vazio retornado pela SP');
      return res.status(500).json({ message: 'Erro: Nenhum resultado retornado pela Stored Procedure.' });
    }

    const firstResult = result[0];
    if (firstResult.Success == 1 || firstResult.Success === true) {
      console.log('[SP_REGISTRO] SP retornou sucesso. UserId:', firstResult.UserId);
      res.status(201).json({
        message: firstResult.Message || 'Usuário cadastrado com sucesso!',
        user: { id: firstResult.UserId, email: email, name: name }
      });
    } else {
      const errorMessage = firstResult.Message || 'Erro ao cadastrar usuário (retornado pela SP).';
      console.log('[SP_REGISTRO] SP retornou falha:', errorMessage);
      const statusCode = errorMessage.toLowerCase().includes('conflito') ? 409 : 400;
      res.status(statusCode).json({ message: errorMessage });
    }
  } catch (error) {
    console.error("[SP_REGISTRO] Erro ao executar Stored Procedure ou Hashing:", error);
    res.status(500).json({ message: 'Erro interno grave do servidor.' });
  }
};