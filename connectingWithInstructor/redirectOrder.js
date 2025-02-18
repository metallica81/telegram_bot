import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

import { getRestPersons } from './getRestPersons.js';

// Функция для отправки сообщения сотруднику
export async function redirectOrder(ctx, userSteps, ...params) {

    const [instructor_id, num_classroom, global_problem, comment, messageText] = params;

    const currentStep = userSteps.get(ctx.chat.id);

    if (!instructor_id || isNaN(instructor_id)) {
        console.error("Некорректный instructor_id:", instructor_id);
        return;
    }

    try {
        // Обновляем шаг сессии
        userSteps.set(instructor_id, 'waiting_for_redirect_order'); // Сохраняем шаг для преподавателя

        // Кнопки для принятия заявки
        const problemKeyBoard = new Keyboard()
        .text('Person1').row()
        .text('Person2').resized();

        await bot.api.sendMessage(instructor_id, 'Кому перенаправим?', {
            reply_markup: problemKeyBoard
        });

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
