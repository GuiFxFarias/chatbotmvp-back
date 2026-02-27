const { Router } = require('express');
const userController = require('../controllers/userController');
const dealsController = require('../controllers/dealsController');

const router = Router();

// ===== ROTA PÚBLICA =====
// Login de usuario (SEM middleware de autenticação)
router.post('/login', userController.buscarUsers);
// Cadastrar usuário
router.post('/cadastra', userController.criarUsers);
// Esqueci a senha
router.post('/esqueci-senha', userController.esqueciSenha);
// Redefinir senha
router.post('/redefinir-senha', userController.redefinirSenha);

// ==== ROTAS DE DASHBOARD / RELATÓRIOS ====

// receita mensal (aceita filtros via query string)
router.get('/receita-mensal', (req, res) =>
  dealsController.receitaMensal(req, res),
);

router.get('/resumo', (req, res) => dealsController.resumo(req, res));

// top deals em andamento (aceita filtros via query string)
router.get('/maiores-abertas', (req, res) =>
  dealsController.maioresAbertas(req, res),
);

// ==== ROTAS AUXILIARES PARA OS FILTROS ====

// lista de vendedores únicos (para o select de vendedor)
router.get('/vendedores', (req, res) =>
  dealsController.listarVendedores(req, res),
);

// lista de estágios únicos (para o select de estágio)
router.get('/estagios', (req, res) => dealsController.listarEstagios(req, res));

router.get('/pipelines', (req, res) =>
  dealsController.listarPipelines(req, res),
);

// USUÁRIOS
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ sucesso: true, mensagem: 'Logout efetuado' });
});

module.exports = router;
