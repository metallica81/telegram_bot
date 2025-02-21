import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';

import { getRestPersons } from './getRestPersons.js';
import { stackForKeyBoard } from '../index.js'
import { getInstructorNameFromEn } from '../selectPerson/getEnName.js';
import { getDataBase } from '../dataBase/getDataBase.js';

dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);
const data = getDataBase();

// Функция для отправки сообщения сотруднику
export async function redirectOrder(ctx, userSteps, ...params) {

    const [instructor_id, instructorKey, instructor_name, 
        num_classroom, global_problem, comment, messageText] = params;

    const currentStep = userSteps.get(ctx.chat.id);

    if (!instructor_id || isNaN(instructor_id)) {
        console.error("Некорректный instructor_id:", instructor_id);
        return;
    }

    try {
        // Обновляем шаг сессии
        userSteps.set(instructor_id, 'waiting_for_instructor_response'); // Сохраняем шаг для преподавателя
        const restPersons = getRestPersons(instructorKey, stackForKeyBoard);

         // Создаем клавиатуру
        const problemKeyBoard = new Keyboard();

        // Добавляем кнопки динамически
        restPersons.forEach((person, index) => {
            if (index % 2 === 0) {
                problemKeyBoard.row(); // Начинаем новую строку после каждых двух кнопок
            }
            problemKeyBoard.text(getInstructorNameFromEn(person, data));
        });

        // Устанавливаем размер клавиатуры
        problemKeyBoard.resized();

        await bot.api.sendMessage(instructor_id, 'Кому перенаправим?', {
            reply_markup: problemKeyBoard
        });

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
