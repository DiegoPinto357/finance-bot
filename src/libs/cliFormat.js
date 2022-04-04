export const formatTable = (data, farmatter) =>
  data.map(item =>
    Object.entries(item).reduce((obj, [key, value], index) => {
      const formatFunc = farmatter[index];
      obj[key] = formatFunc ? formatFunc(value) : value;
      return obj;
    }, {})
  );
