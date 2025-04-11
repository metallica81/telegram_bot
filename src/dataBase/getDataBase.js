import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '..', 'dataBase', 'dataBase.json'); // Путь к файлу

// Функция для получения данных
export function getDataBase() {
    try {
        const jsonData = fs.readFileSync(dataPath, 'utf8'); // Читаем файл
        return JSON.parse(jsonData); // Преобразуем в объект
    } catch (err) {
        console.error("Ошибка при чтении файла базы данных:", err);
        return {}; // Возвращаем пустой объект в случае ошибки
    }
}

// Функция для записи данных
export function setDataBase(updatedData) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 4), 'utf8'); // 4 пробела
        console.log("База данных успешно обновлена!");
    } catch (err) {
        console.error("Ошибка при записи в файл базы данных:", err);
    }
}

export const allData = getDataBase();