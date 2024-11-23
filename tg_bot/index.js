require('dotenv').config();
const { Bot, Keyboard, MemorySessionStorage, session } = require('grammy');
const { findClosestClassroom } = require('./select_person.js'); // Импортирую файл для получения нужного преподавателя

// Создаем бота
const bot = new Bot(process.env.BOT_API_KEY);
bot.api.setMyCommands([
    { command: 'start', description: 'Оформить заявку' },
]);

// Создаем хранилище сессий в памяти
const storage = new MemorySessionStorage();
bot.use(session({ initial: () => ({ step: 'waiting_for_classroom' }), storage }));

// Глобальные переменные
let chatId; //1140094825        //885326963
let num_study;
let num_classroom;
let problem_case_1;
let problem_case_2;
let global_problem;
let comment = "отсутствует";

// Команда /start для начала диалога
bot.command('start', async (ctx) => {
    // Сброс состояния сессии при начале новой заявки
    chatId = ctx.chat.id;
    ctx.session.step = 'waiting_for_classroom';
    await ctx.reply(`Твой ID ${chatId}`);
    await ctx.reply('Введите номер аудитории, в которой вы находитесь');
});

// Функция для отправки сообщения пользователю по `chat_id`
async function sendMessageToUser(chatId, message) {
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

// Обработчик для обычных кнопок
bot.on('message', async (ctx) => {
    const messageText = ctx.message.text;
    console.log(`Received message: ${messageText}, Current step: ${ctx.session.step}`);

    if (ctx.session.step === 'waiting_for_classroom') {
        if (/^\d+$/.test(messageText)) {
            num_classroom = messageText;
            console.log("num_classroom=", num_classroom);
            ctx.session.step = 'waiting_for_pair_number';  // Переход к следующему этапу
            await ctx.reply('Введите номер текущей пары');
        } else {
            await ctx.reply('Пожалуйста, введите корректный номер аудитории.');
        }
    } else if (ctx.session.step === 'waiting_for_pair_number') {
        if (/^\d+$/.test(messageText)) {
            num_study = messageText;
            console.log("num_study=", num_study);
            ctx.session.step = 'waiting_for_problem';  // Переход к следующему этапу

            const problemKeyBoard = new Keyboard().text('Да').row().text('Нет').resized();
            await ctx.reply('У вас проблема с оборудованием?', {
                reply_markup: problemKeyBoard
            });
        } else {
            await ctx.reply('Пожалуйста, введите корректный номер текущей пары.');
        }
    } else if (ctx.session.step === 'waiting_for_problem') {
        if (messageText === 'Да') {
            console.log("User selected 'Да' - asking for equipment issues");

            const problemKeyBoard_Yes = new Keyboard().text('Не работает проектор')
                .row().text('Не работает компьютер').row().text('Не работают динамики')
                .row().text('Не работает микрофон').row().text('Не отображается флешка').resized();

            await ctx.reply('Выберите вариант проблемы с оборудованием:', {
                reply_markup: problemKeyBoard_Yes
            });
            problem_case_1 = 'Проблемы с оборудованием';
            ctx.session.step = 'problem_equipment_selected';  // Переход к следующему этапу
        } else if (messageText === 'Нет') {
            console.log("User selected 'Нет' - asking for program issues");

            const problemKeyBoard_No = new Keyboard().text('Не работает power point')
                .row().text('Не открываются файлы из флешки').row().text('Не запускается видео').resized();

            await ctx.reply('Проблема с работой какой-либо программы?', {
                reply_markup: problemKeyBoard_No
            });
            problem_case_1 = 'Проблемы с программой';
            ctx.session.step = 'problem_program_selected';  // Переход к следующему этапу
        }
    } else if (ctx.session.step === 'problem_equipment_selected' || ctx.session.step === 'problem_program_selected') {
        problem_case_2 = messageText;
        global_problem = problem_case_1 + ', а именно, ' + problem_case_2;
        console.log("global_problem=", global_problem);

        const noteKeyboard = new Keyboard().text('Добавить').row().text('Не стоит').resized();
        await ctx.reply('Добавить примечание?', { 
            reply_markup: noteKeyboard 
        });
        ctx.session.step = 'waiting_for_note';  // Переход к этапу добавления примечания
    } else if (ctx.session.step === 'waiting_for_note') {
        if (messageText === 'Добавить') {
            await ctx.reply('Пожалуйста, введите ваше примечание:');
            ctx.session.step = 'waiting_for_comment';
        } else if (messageText === 'Не стоит') {
            // Скрываем клавиатуру, когда она больше не нужна
            await ctx.reply('Без примечания', { reply_markup: { remove_keyboard: true } });

            // Запрос на вызов сотрудника (выводим текст и кнопки)
            const callEmployeeKeyboard = new Keyboard().text('Вызываем').row().text('Не вызываем').resized();
            await ctx.reply('Вызываем сотрудника?', { reply_markup: callEmployeeKeyboard });
            ctx.session.step = 'waiting_for_employee_call';  // Переход к запросу о вызове сотрудника
        }
    } else if (ctx.session.step === 'waiting_for_comment') {
        comment = messageText;
        console.log("comment=", comment);

        // Скрываем клавиатуру после ввода примечания
        await ctx.reply('Примечание добавлено.', { reply_markup: { remove_keyboard: true } });

        // Отправляем сообщение и кнопки с вопросом о вызове сотрудника
        const callEmployeeKeyboard = new Keyboard().text('Вызываем').row().text('Не вызываем').resized();
        await ctx.reply('Вызываем сотрудника?', { reply_markup: callEmployeeKeyboard });

        // Переход к этапу вызова сотрудника
        ctx.session.step = 'waiting_for_employee_call';  // Переход к запросу о вызове сотрудника
    } else if (ctx.session.step === 'waiting_for_employee_call') {
        if (messageText === 'Вызываем') {
            // Вызываем функцию для поиска ближайшего преподавателя
            const [closestInstructor, closestFloor, instuct_id] = findClosestClassroom(num_study, num_classroom);
    
            // Убираем кнопки и завершаем диалог
            await ctx.reply(`Сотрудник будет вызван: ${closestInstructor}. Спасибо за заявку!`, { reply_markup: { remove_keyboard: true } });
    
            // Отправляем сообщение с назначением сотрудника
            await sendMessageToUser(instuct_id, `Примите заявку, аудитория ${num_classroom}\n${global_problem}\nПримечание: ${comment}`);
            ctx.session.step = 'completed';  // Завершаем заявку
        } else if (messageText === 'Не вызываем') {
            // Обработка отказа от вызова сотрудника
            await ctx.reply('Заявка не будет продолжена. Всего доброго!', { reply_markup: { remove_keyboard: true } });
            ctx.session.step = 'completed';  // Завершаем заявку
        }
    }
    
});

// Запуск бота
bot.start();
