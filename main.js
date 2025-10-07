import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

// Налаштування параметрів командного рядка
program
  .option('-i, --input [path]', 'шлях до вхідного JSON файлу')
  .option('-o, --output [path]', 'шлях до вихідного файлу')
  .option('-d, --display', 'вивести результат у консоль')
  .option('-m, --mfo', 'відображати код МФО банку перед назвою')
  .option('-n, --normal', 'відображати лише працюючі банки з кодом 1 "Нормальний"');

program.parse(process.argv);
const options = program.opts();

// Головна функція
function main() {
  try {
    // Перевірка обов'язкового параметра
    if (!options.input) {
      console.error('Please, specify input file');
      process.exit(1);
    }

    // Перевірка існування файлу
    if (!fs.existsSync(options.input)) {
      console.error('Cannot find input file');
      process.exit(1);
    }

    // Читання та парсинг JSON
    const fileContent = fs.readFileSync(options.input, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Фільтрація та обробка даних
    let processedData = data;

    // Фільтрація за кодом стану (якщо задано -n) - COD_STATE === 1 для "Нормальний"
    if (options.normal) {
      processedData = processedData.filter(item => item.COD_STATE === 1);
    }

    // Форматування виводу
    const result = processedData.map(item => {
      let line = '';
      
      // Додавання МФО (якщо задано -m)
      if (options.mfo && item.MFO !== undefined) {
        line += `${item.MFO} `;
      }
      
      // Додавання короткої назви банку (SHORTNAME замість SHORT_NAME)
      if (item.SHORTNAME !== undefined) {
        line += `${item.SHORTNAME}`;
      }
      
      return line;
    }).filter(line => line !== '').join('\n');

    // Вивід результатів
    if (options.display) {
      console.log(result);
    }

    if (options.output) {
      fs.writeFileSync(options.output, result, 'utf8');
    }

    // Якщо нічого не задано - нічого не виводимо
    if (!options.display && !options.output) {
      // Нічого не робимо
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Запуск програми
main();