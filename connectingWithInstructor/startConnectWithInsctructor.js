import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

// Функция для отправки сообщения сотруднику
export async function startConnectWithInsctructor(ctx, userSteps, ...params) {
    const [instructor_id, num_classroom, global_problem, comment, messageText] = params; // rest-оператор

    const currentStep = userSteps.get(ctx.chat.id);

    if (!instructor_id || isNaN(instructor_id)) {
        console.error("Некорректный instructor_id:", instructor_id);
        return;
    }

    try {
        // Отправляем сообщение сотруднику
        const message = `Новая заявка: Аудитория ${num_classroom}\nПроблема: ${global_problem}\nПримечание: ${comment}`;
        // console.log('Получатель (преподаватель):', instructor_id, 'Шаг у него перед отправкой:', currentStep);

        await bot.api.sendMessage(instructor_id, message);
        console.log("Сообщение отправлено сотруднику!");
        
        // Обновляем шаг сессии
        userSteps.set(instructor_id, 'waiting_for_response'); // Сохраняем шаг для преподавателя
        // console.log('Получатель (преподаватель):', instructor_id, 'Шаг после отправки:', userSteps.get(ctx.chat.id));

        // Кнопки для принятия заявки
        const problemKeyBoard = new Keyboard().text('Принять').row().text('Перенаправить').resized();

        await bot.api.sendMessage(instructor_id, 'Готовы принять заявку?', {
            reply_markup: problemKeyBoard
        });

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
