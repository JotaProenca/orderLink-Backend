const express = require('express');
const profileController = require('../controllers/profileController');
const authenticateToken = require('../middleware/authMiddleware');

// Inicializa o roteador do Express
const router = express.Router();

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     summary: Retorna os dados do perfil do usuário autenticado
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do perfil retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nomeUsuario:
 *                   type: string
 *                   example: João Silva
 *                 imagemUsuario:
 *                   type: string
 *                   format: byte
 *                   nullable: true
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."
 *                 permissoes:
 *                   type: object
 *                   properties:
 *                     cadastrarItem:
 *                       type: boolean
 *                       example: true
 *                     minhaEmpresa:
 *                       type: boolean
 *                       example: false
 *                     gerenciarItens:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Não autorizado (token ausente ou usuário do token não encontrado)
 *       403:
 *         description: Token inválido ou expirado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/me', authenticateToken, profileController.getMyProfile);

module.exports = router;