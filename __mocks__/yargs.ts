type Args =
  | {
      [x: string]: unknown;
      _: (string | number)[];
      $0: string;
    }
  | Promise<{
      [x: string]: unknown;
      _: (string | number)[];
      $0: string;
    }>;

let argv: Args;

const mockUserInput = (args: Args) => (argv = args);

export default () => ({ argv, mockUserInput });
