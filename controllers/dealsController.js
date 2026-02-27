// controllers/dealsController.js
const dealsModel = require('../models/dealsModel');

class DealsController {
  // GET /deals
  async listarTodos(req, res) {
    try {
      const limit = Number(req.query.limit || 200);
      const deals = await dealsModel.buscarTodos(limit);

      return res.status(200).json({
        sucesso: true,
        data: deals,
      });
    } catch (erro) {
      console.error('Erro ao buscar deals:', errso);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao buscar deals.',
      });
    }
  }

  async resumo(req, res) {
    try {
      const resumo = await dealsModel.buscarResumo();

      return res.status(200).json({
        sucesso: true,
        data: resumo,
      });
    } catch (erro) {
      console.error('Erro ao buscar resumo de deals:', erro);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao buscar resumo de deals.',
      });
    }
  }

  // controllers/dealsController.js
  async maioresAbertas(req, res) {
    try {
      const {
        user_id,
        stage_id,
        created_start,
        created_end,
        updated_start,
        updated_end,
      } = req.query;

      const rows = await dealsModel.buscarMaioresDealsAbertasComFiltros({
        user_id,
        stage_id,
        created_start,
        created_end,
        updated_start,
        updated_end,
      });

      return res.status(200).json({ sucesso: true, data: rows });
    } catch (erro) {
      console.error('Erro ao buscar maiores deals abertas:', erro);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao buscar maiores deals abertas.',
      });
    }
  }

  async receitaMensal(req, res) {
    try {
      const {
        user_id,
        stage_id,
        status,
        created_start,
        created_end,
        updated_start,
        updated_end,
        closed_start,
        closed_end,
      } = req.query;

      const rows = await dealsModel.buscarReceitaPorMesComFiltros({
        user_id,
        stage_id,
        status,
        created_start,
        created_end,
        updated_start,
        updated_end,
        closed_start,
        closed_end,
      });

      return res.status(200).json({ sucesso: true, data: rows });
    } catch (erro) {
      console.error('Erro ao buscar receita mensal:', erro);
      return res.status(500).json({
        sucesso: false,
        erro: 'Erro interno ao buscar receita mensal.',
      });
    }
  }

  async listarVendedores(req, res) {
    try {
      const { user_id, pipeline_id, stage_id, closed_start, closed_end } =
        req.query;

      const data = await dealsModel.buscarVendedoresComFiltros({
        user_id,
        pipeline_id,
        stage_id,
        closed_start,
        closed_end,
      });

      return res.status(200).json({ sucesso: true, data });
    } catch (erro) {
      console.error('Erro ao listar vendedores:', erro);
      return res
        .status(500)
        .json({ sucesso: false, erro: 'Erro interno ao listar vendedores.' });
    }
  }

  async listarEstagios(req, res) {
    try {
      const { user_id, pipeline_id, closed_start, closed_end } = req.query;

      const data = await dealsModel.buscarEstagiosComFiltros({
        user_id,
        pipeline_id,
        closed_start,
        closed_end,
      });

      return res.status(200).json({ sucesso: true, data });
    } catch (erro) {
      console.error('Erro ao listar estágios:', erro);
      return res
        .status(500)
        .json({ sucesso: false, erro: 'Erro interno ao listar estágios.' });
    }
  }

  async listarPipelines(req, res) {
    try {
      const { user_id, stage_id, closed_start, closed_end } = req.query;

      const data = await dealsModel.buscarPipelinesComFiltros({
        user_id,
        stage_id,
        closed_start,
        closed_end,
      });

      return res.status(200).json({ sucesso: true, data });
    } catch (erro) {
      console.error('Erro ao listar pipelines:', erro);
      return res
        .status(500)
        .json({ sucesso: false, erro: 'Erro interno ao listar pipelines.' });
    }
  }
}

module.exports = new DealsController();
