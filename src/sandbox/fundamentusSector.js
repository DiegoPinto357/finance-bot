import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

const stocksInfoUrl = 'http://www.fundamentus.com.br/detalhes.php?papel=MRVE3';

const run = async () => {
  const response = await fetch(stocksInfoUrl, {
    headers: {
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language':
        'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7,es-MX;q=0.6,es;q=0.5',
    },
  });
  const responseBuffer = await response.buffer();
  const decodedBuffer = iconv.decode(responseBuffer, 'latin1');
  const html = iconv.encode(decodedBuffer, 'utf8').toString('utf8');

  const $ = cheerio.load(html);
  const element = $('.txt a[href^="resultado.php?setor"]').text();
  console.log(element);
};

run();
