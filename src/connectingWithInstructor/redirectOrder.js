import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";
import { getDataBase } from "../dataBase/getDataBase.js";
import { generateInstructorKeyboard } from "./generateInstructorKeyboard.js";

dotenv.config();
const bot = new Bot(process.env.BOT_API_KEY);
const data = getDataBase();

// Функция для отправки сообщения сотруднику
export async function redirectOrder(ctx, userSteps, ...params) {
    const [
        instructor_id,
        instructorKey,
        instructor_name,
        num_classroom,
        global_problem,
        comment,
        messageText,
    ] = params;

    if (!instructor_id || isNaN(instructor_id)) {
        console.error("Некорректный instructor_id:", instructor_id);
        return;
    }

    try {
        // Отправляем клавиатуру преподавателю
        const sentMessage = await bot.api.sendMessage(
            instructor_id,
            "Кому перенаправим?",
            {
                reply_markup: generateInstructorKeyboard(instructorKey, data),
            }
        );

        let previousKeyboard = JSON.stringify(generateInstructorKeyboard(instructorKey, data));

        // Автоматическое обновление клавиатуры каждую минуту
        setInterval(async () => {
            const newKeyboard = generateInstructorKeyboard(instructorKey, data);
            const newKeyboardString = JSON.stringify(newKeyboard);
            
            console.log(previousKeyboard !== newKeyboardString)
            // Проверяем, изменились ли клавиши
            if (previousKeyboard !== newKeyboardString) {
                await bot.api.editMessageReplyMarkup(
                    instructor_id,
                    sentMessage.message_id,
                    {
                        reply_markup: newKeyboard,
                    }
                );
                console.log("Клавиатура обновлена");
                previousKeyboard = newKeyboardString; // Обновляем старую клавиатуру
            }
        }, 5000); // обновляем каждую минуту

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
