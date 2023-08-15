import updateAbsoluteTable from './updateAbsoluteTable';
import updateSharesDiffTable from './updateSharesDiffTable';

export default () =>
  Promise.all([updateAbsoluteTable(), updateSharesDiffTable()]);
