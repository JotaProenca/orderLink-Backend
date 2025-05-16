const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// --- Rota de Login ---
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário (email ou CPF) e retorna um token JWT.
 *     tags: [Autenticação]
 *     security: [] # Rota pública, sobrescreve segurança global
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: "Email ou CPF do usuário"
 *                 example: "usuario@exemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "suaSenha123"
 *     responses:
 *       200:
 *         description: Login bem-sucedido. Retorna o token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno
 */
router.post('/login', authController.login);

// --- Rota de Registro ---
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário com email/senha e dados de perfil.
 *     tags: [Autenticação]
 *     security: [] # Marca esta rota como pública na documentação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, tipoEmpresa]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@exemplo.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "senhaSegura123"
 *               tipoEmpresa:
 *                 type: string
 *                 enum: [CNPJ, CPF]
 *                 example: "CPF"
 *               cnpj:
 *                 type: string
 *                 example: "12345678000199"
 *               nomeFantasia:
 *                 type: string
 *                 example: "Empresa Fantasia"
 *               razaoSocial:
 *                 type: string
 *                 example: "Empresa Razão Social LTDA"
 *               cpf:
 *                 type: string
 *                 example: "11122233344"
 *               cep:
 *                 type: string
 *                 example: "01001000"
 *               endereco:
 *                 type: string
 *                 example: "Rua Exemplo"
 *               numero:
 *                 type: string
 *                 example: "123"
 *               complemento:
 *                 type: string
 *                 example: "Apto 45"
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dados inválidos ou faltando
 *       409:
 *         description: Conflito - Email, CNPJ ou CPF já cadastrado
 *       500:
 *         description: Erro interno
 */
router.post('/register', authController.register);

// --- Rota para Solicitar Redefinição de Senha ---
/**
 * @openapi
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Solicita um código de redefinição de senha para o email fornecido.
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *     responses:
 *       200:
 *         description: Se um usuário com o email existir, um código será enviado (ou logado no console para teste).
 *       400:
 *         description: Email não fornecido.
 *       500:
 *         description: Erro interno.
 */
router.post('/request-password-reset', authController.requestPasswordReset);

// --- Rota para Verificar Código de Redefinição e Obter Token JWT ---
/**
 * @openapi
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verifica o código de redefinição e retorna um JWT para alteração de senha.
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@exemplo.com"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Código verificado. Retorna o passwordResetToken (JWT).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passwordResetToken:
 *                   type: string
 *       400:
 *         description: Código inválido, expirado ou email não fornecido.
 *       500:
 *         description: Erro interno.
 */
router.post('/verify-reset-code', authController.verifyResetCode);

// --- Rota para Redefinir Senha com Token JWT ---
/**
 * @openapi
 * /api/auth/reset-password-with-token:
 *   post:
 *     summary: Redefine a senha do usuário usando o JWT de redefinição.
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [passwordResetToken, newPassword]
 *             properties:
 *               passwordResetToken:
 *                 type: string
 *                 description: "O JWT recebido após a verificação do código."
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "novaSenhaSegura123"
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso.
 *       400:
 *         description: Token inválido, nova senha não fornecida ou não atende aos critérios.
 *       401:
 *         description: Token de redefinição inválido ou expirado.
 *       500:
 *         description: Erro interno.
 */
router.post('/reset-password-with-token', authController.resetPasswordWithToken);


module.exports = router;