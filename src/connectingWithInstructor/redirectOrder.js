import { generateInstructorKeyboard } from "./generateInstructorKeyboard.js";
import { bot } from '../bot.js';

// Функция для отправки сообщения сотруднику
export async function redirectOrder(instructor_id, instructorKey, data) {

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
        }, 60000); // обновляем каждую минуту

    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}
