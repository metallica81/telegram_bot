import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';

import { getRestPersons } from './getRestPersons.js';
import { instructorStack } from '../selectPerson/selectPerson.js'

dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

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
        userSteps.set(instructor_id, 'waiting_for_redirect_order'); // Сохраняем шаг для преподавателя
        const restPersons = getRestPersons(instructorKey, instructorStack);

        // Кнопки для принятия заявки
        const problemKeyBoard = new Keyboard()
        .text(restPersons[0]).row()
        .text(restPersons[1]).resized();

        await bot.api.sendMessage(instructor_id, 'Кому перенаправим?', {
            reply_markup: problemKeyBoard
        });

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
