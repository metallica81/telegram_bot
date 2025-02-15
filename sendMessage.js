import {Bot} from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);

// Функция для отправки сообщения сотруднику по `chat_id`
export async function sendOrder(chatId, message) {
    if (!chatId || isNaN(chatId)) {
        console.error("Некорректный chatId:", chatId);
        return;
    }

    try {
        await bot.api.sendMessage(chatId, message);
        console.log("Сообщение отправлено!");
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}