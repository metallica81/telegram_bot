import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export function getDataBase() {
    // Путь к текущему файлу
    const __filename = fileURLToPath(import.meta.url);
    // Путь к директории текущего файла
    const __dirname = path.dirname(__filename);

    // Используем path.resolve для корректного формирования пути
    const dataPath = path.resolve(__dirname, '..', 'dataBase/', 'dataBase.json');  // Путь к файлу

    // Загрузка базы данных (синхронно, чтобы гарантировать доступность данных)
    let data;
    try {
        const jsonData = fs.readFileSync(dataPath, 'utf8');
        return data = JSON.parse(jsonData);
    } catch (err) {
        console.error("Ошибка при чтении файла базы данных", err);
    }
}



