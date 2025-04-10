// const fundamentus = require('fundamentus');
import { buildLogger } from '../libs/logger';

const log = buildLogger('Fundamentus');

const removeFields = data =>
  data.map(
    ({
      Cotação: cotacao,
      PSR,
      'P/Ativo': p_ativo,
      'P/Cap.Giro': p_cap_giro,
      'P/EBIT': p_ebit,
      'P/Ativ Circ.Liq': p_ativ_circ_liq,
      'EV/EBITDA': ev_ebitda,
      'Mrg Ebit': mrg_ebit,
      'Liq. Corr.': liq_corr,
      ROIC,
      'Patrim. Líq': patrim_liq,
      'Cresc. Rec.5a': cresc_rec5a,
      ...entries
    }) => entries
  );

const getStocksInfo = async stocksList => {
  log('Loading stocks info.');
  // const stocksInfo = await fundamentus.getStocksInfo();

  // if (!stocksList || stocksList.length === 0) {
  //   return removeFields(stocksInfo);
  // }

  // return removeFields(
  //   stocksInfo.filter(stock => stocksList.includes(stock.Papel))
  // );
};

export default {
  getStocksInfo,
};
