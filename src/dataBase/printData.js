import fs from 'fs/promises';
import { writeDataToFile } from './writeDataToFile.js';

export async function printData() {
    try {
        await writeDataToFile();
  
        // Читаем данные из файла после записи
        const data = await fs.readFile('src/dataBase/dataBase.json', 'utf8');

        // Парсим JSON-данные и выводим их в консоль
        console.log(JSON.stringify(JSON.parse(data), null, 2));

    } catch (err) {
        console.log('Error rading file:', err);
    }
}