// models/dealsModel.js
const conexao = require('../conexao.js');

class DealsModel {
  executaQuery(sql, parametros = []) {
    return new Promise((res, rej) => {
      conexao.query(sql, parametros, (error, results) => {
        if (error) {
          console.log('Erro na query: ' + error);
          return rej(error);
        }
        return res(results);
      });
    });
  }

  // helper para montar WHERE a partir de filtros do dashboard
  buildWhereFromFilters(filtros = {}) {
    const { user_id, stage_id, pipeline_id, closed_start, closed_end } =
      filtros;

    const where = [];
    const params = [];

    if (user_id) {
      where.push('user_id = ?');
      params.push(user_id);
    }

    if (pipeline_id) {
      where.push('deal_pipeline_id = ?');
      params.push(pipeline_id);
    }

    if (stage_id) {
      where.push('deal_stage_id = ?');
      params.push(stage_id);
    }

    if (closed_start) {
      where.push('closed_at >= ?'); // ajuste nome se for diferente
      params.push(closed_start);
    }

    if (closed_end) {
      where.push('closed_at <= ?');
      params.push(closed_end);
    }

    return { where, params };
  }

  // --- seus métodos antigos permanecem como estão acima ---

  buscarResumo() {
    const sql = `
      SELECT
        COUNT(*) AS totalDeals,
        SUM(amount_total) AS totalAmount,
        SUM(CASE WHEN win = 1 THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN win = 0 THEN 1 ELSE 0 END) AS losses
      FROM deals_completos
    `;

    return this.executaQuery(sql).then((rows) => {
      const row = rows[0] || {};
      return {
        totalDeals: Number(row.totalDeals || 0),
        totalAmount: Number(row.totalAmount || 0),
        wins: Number(row.wins || 0),
        losses: Number(row.losses || 0),
      };
    });
  }

  buscarMaioresDealsAbertasComFiltros(filtros = {}, limit = 20) {
    const {
      user_id,
      stage_id,
      pipeline_id,
      created_start,
      created_end,
      updated_start,
      updated_end,
    } = filtros;

    const where = [];
    const params = [];

    // apenas em andamento
    where.push('win IS NULL');

    if (pipeline_id) {
      where.push('deal_pipeline_id = ?');
      params.push(pipeline_id);
    }

    if (user_id) {
      where.push('user_id = ?');
      params.push(user_id);
    }

    if (stage_id) {
      where.push('deal_stage_id = ?');
      params.push(stage_id);
    }

    if (created_start) {
      where.push('created_at >= ?');
      params.push(created_start);
    }
    if (created_end) {
      where.push('created_at <= ?');
      params.push(created_end);
    }

    if (updated_start) {
      where.push('updated_at >= ?');
      params.push(updated_start);
    }
    if (updated_end) {
      where.push('updated_at <= ?');
      params.push(updated_end);
    }

    const whereSql = `WHERE ${where.join(' AND ')}`;

    const sql = `
      SELECT
        id,
        name_conta,
        user_name,
        amount_montly,
        amount_unique,
        amount_total,
        deal_stage_name,
        updated_at
      FROM deals_completos
      ${whereSql}
      ORDER BY amount_total DESC
      LIMIT ?
    `;

    params.push(limit);

    return this.executaQuery(sql, params);
  }

  buscarReceitaPorMesComFiltros(filtros = {}) {
    const {
      user_id,
      stage_id,
      pipeline_id,
      status,
      created_start,
      created_end,
      updated_start,
      updated_end,
      closed_start,
      closed_end,
    } = filtros;

    const where = [];
    const params = [];

    if (pipeline_id) {
      where.push('deal_pipeline_id = ?');
      params.push(pipeline_id);
    }

    // status (won/lost/all)
    if (status === 'won') {
      where.push('win = 1');
    } else if (status === 'lost') {
      where.push('win = 0');
    }

    if (user_id) {
      where.push('user_id = ?');
      params.push(user_id);
    }

    if (stage_id) {
      where.push('deal_stage_id = ?');
      params.push(stage_id);
    }

    if (created_start) {
      where.push('created_at >= ?');
      params.push(created_start);
    }
    if (created_end) {
      where.push('created_at <= ?');
      params.push(created_end);
    }

    if (updated_start) {
      where.push('updated_at >= ?');
      params.push(updated_start);
    }
    if (updated_end) {
      where.push('updated_at <= ?');
      params.push(updated_end);
    }

    // receita mensal é baseada em closed_at
    where.push('closed_at IS NOT NULL');
    if (closed_start) {
      where.push('closed_at >= ?');
      params.push(closed_start);
    }
    if (closed_end) {
      where.push('closed_at <= ?');
      params.push(closed_end);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT
        DATE_FORMAT(closed_at, '%Y-%m') AS mes,
        SUM(amount_total) AS total_mes,
        SUM(CASE WHEN win = 1 THEN amount_total ELSE 0 END) AS total_won_mes,
        SUM(CASE WHEN win = 0 THEN amount_total ELSE 0 END) AS total_lost_mes
      FROM deals_completos
      ${whereSql}
      GROUP BY DATE_FORMAT(closed_at, '%Y-%m')
      ORDER BY mes ASC
    `;

    return this.executaQuery(sql, params);
  }

  // --------- NOVAS VERSÕES COM FILTROS ---------

  buscarVendedoresComFiltros(filtros = {}) {
    const { where, params } = this.buildWhereFromFilters(filtros);

    where.push('user_id IS NOT NULL');
    where.push('user_name IS NOT NULL');
    where.push("user_name <> ''");

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    SELECT
      user_id,
      MAX(user_name) AS user_name
    FROM deals_completos
    ${whereSql}
    GROUP BY user_id
    ORDER BY user_name ASC
  `;

    console.log('SQL vendedores:', sql, params);
    return this.executaQuery(sql, params);
  }

  // Estágios
  buscarEstagiosComFiltros(filtros = {}) {
    const { where, params } = this.buildWhereFromFilters(filtros);

    where.push('deal_stage_id IS NOT NULL');
    where.push('deal_stage_name IS NOT NULL');
    where.push("deal_stage_name <> ''");

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    SELECT
      deal_stage_id,
      MAX(deal_stage_name) AS deal_stage_name
    FROM deals_completos
    ${whereSql}
    GROUP BY deal_stage_id
    ORDER BY deal_stage_name ASC
  `;

    console.log('SQL estagios:', sql, params);
    return this.executaQuery(sql, params);
  }

  // Pipelines
  buscarPipelinesComFiltros(filtros = {}) {
    const { where, params } = this.buildWhereFromFilters(filtros);

    where.push('deal_pipeline_id IS NOT NULL');
    where.push('deal_pipeline_name IS NOT NULL');
    where.push("deal_pipeline_name <> ''");

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
    SELECT
      deal_pipeline_id,
      MAX(deal_pipeline_name) AS deal_pipeline_name
    FROM deals_completos
    ${whereSql}
    GROUP BY deal_pipeline_id
    ORDER BY deal_pipeline_name ASC
  `;

    console.log('SQL pipelines:', sql, params);
    return this.executaQuery(sql, params);
  }

  // se ainda precisar das versões antigas sem filtro em algum lugar, pode manter:
  buscarVendedores() {
    return this.buscarVendedoresComFiltros({});
  }

  buscarEstagios() {
    return this.buscarEstagiosComFiltros({});
  }

  buscarPipelines() {
    return this.buscarPipelinesComFiltros({});
  }
}

module.exports = new DealsModel();
