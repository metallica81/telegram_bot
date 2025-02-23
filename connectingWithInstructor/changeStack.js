import { setDataBase } from '../dataBase/getDataBase.js';

export function changeStack(data, commonKey, redirectionKey) {
    const key = redirectionKey || commonKey;
    if (!key || !data.instructorStack) return;

    const stack = data.instructorStack; // Получаем массив из базы данных
    const index = stack.indexOf(key);

    if (index !== -1) {
        stack.push(stack.splice(index, 1)[0]); // Перемещаем в конец
        console.log('Обновленная очередь:', [...stack]);

        setDataBase(data); // Сохраняем изменения обратно в базу
    }
}