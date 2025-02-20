import { Bot, Keyboard } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

// Функция для отправки сообщения сотруднику
export async function continueWithInstructor(chatId, ctx, userSteps, instructor_name) {

    const currentStep = userSteps.get(ctx.chat.id);

    if (!chatId || isNaN(chatId)) {
        console.error("Некорректный chatId:", chatId);
        return;
    }

    try {
        // Отправляем сообщение заказчику
        const message = `Заявку принял ${instructor_name}`;
        // console.log('Получатель (заказчик):', chatId, 'Шаг у него перед отправкой:', currentStep);

        await bot.api.sendMessage(chatId, message);
        console.log("Сообщение отправлено заказчику!");

        // Обновляем шаг сессии
        userSteps.set(instructor_id, 'waiting_for_instructor_response');

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
