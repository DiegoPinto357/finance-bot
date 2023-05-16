type FormatFunc = ((value: string) => string) | null;

interface StringIndexed {
  [key: string]: string;
}

export const formatTable = (data: Object[], formatter: FormatFunc[]) =>
  data.map(item =>
    Object.entries(item).reduce((obj: StringIndexed, [key, value], index) => {
      const formatFunc = formatter[index];
      obj[key] = formatFunc ? formatFunc(value) : value;
      return obj;
    }, {})
  );
