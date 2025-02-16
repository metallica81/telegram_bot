import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

// Функция для отправки сообщения сотруднику
export async function contactWithInstructor(instructor_id, num_classroom, global_problem, comment, ctx, messageText) {

    if (ctx.session.step == 'send_order') {

        if (!instructor_id || isNaN(instructor_id)) {
            console.error("Некорректный instructor_id:", instructor_id);
            return
        }
    
        try {

            // Отправляем сообщение сотруднику
            const message = `Новая заявка: Аудитория ${num_classroom}\nПроблема: ${global_problem}\nПримечание: ${comment}`;
            console.log('Получатель (преподаватель):', instructor_id, 'Шаг у него перед отправкой:', ctx.session.step);

            await bot.api.sendMessage(instructor_id, message);
            console.log("Сообщение отправлено!");
            // Обновляем шаг сессии
            console.log('Получатель (преподаватель):', instructor_id, 'Шаг после отправки:', ctx.session.step);

            ctx.session.step = 'get_response';
            // Кнопки для принятия заявки
            const problemKeyBoard = new Keyboard().text('Принять').row().text('Перенаправить').resized();
    
            await bot.api.sendMessage(instructor_id, 'Готовы принять заявку?', {
            reply_markup: problemKeyBoard
            });
     
        } catch (error) {
            console.error("Ошибка при отправке сообщения:", error);
        }
    }   


    else if (ctx.session.step == 'get_response') {
        console.log('get_response, before condition')
        if (messageText == 'Принять') {
            try {
                console.log('get_response')
                console.log(messageText)
            } catch (error) {
                console.error("Ошибка при получении ответа от сотрудника", error)
            }
        }
    }


}