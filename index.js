import dotenv from 'dotenv';
dotenv.config();
import { Bot, Keyboard } from 'grammy';
import { findStaff, instructorStack } from './selectPerson/selectPerson.js'; // Импорт функции для получения нужного преподавателя
import { startConnectWithInsctructor } from './connectingWithInstructor/startConnectWithInsctructor.js';
import { continueWithInstructor } from './connectingWithInstructor/continueWithInstructor.js';
import { redirectOrder } from './connectingWithInstructor/redirectOrder.js';
import { getEnName } from './selectPerson/getEnName.js';
import { getDataBase } from './dataBase/getDataBase.js';
import { changeStack } from './connectingWithInstructor/changeStack.js'

// Создаем бота
const bot = new Bot(process.env.BOT_API_KEY);
bot.api.setMyCommands([
    { command: 'start', description: 'Оформить заявку' },
]);

// Глобальная переменная для хранения шагов пользователей
const userSteps = new Map();

// Глобальные переменные для хранения информации по заявке
let chatId; // Пример chatId
let countCommonOrders = 0;
let num_classroom;
let problem_case_1;
let problem_case_2;
let global_problem;
let comment = "отсутствует";
const data = getDataBase();
let nextInstructorKey = null;

export let stackForKeyBoard = instructorStack;

function resetStack() {
    stackForKeyBoard = instructorStack; // Создаём новый массив с актуальными значениями
    console.log(`stackForKeyBoard:`, stackForKeyBoard)
}

// Команда /start для начала диалога
bot.command('start', async (ctx) => {
    nextInstructorKey = null;
    resetStack(); // Обновляем stackForKeyBoard при каждом новом запуске

    // Сброс состояния сессии при начале новой заявки
    chatId = ctx.chat.id;
    userSteps.set(chatId, 'waiting_for_classroom'); // Устанавливаем начальный шаг
    await ctx.reply('Введите номер аудитории, в которой вы находитесь');
});


let [instructor_name, instructor_id, isChangeQueue, instructorKey, isLinkedInstuctor] = [null, null, null, null, null];



// Обработчик для обычных сообщений
bot.on('message', async (ctx) => {
    // console.log('Преподаватель отвечает:', ctx.chat.id, 'Шаг у него при ответе:', userSteps.get(ctx.chat.id));
    const messageText = ctx.message.text;
    //console.log(`Received message: ${messageText}, Current step: ${userSteps.get(ctx.chat.id)}`);

    const currentStep = userSteps.get(ctx.chat.id);

    if (currentStep === 'waiting_for_classroom') {
        if (/^\d+$/.test(messageText)) {
            num_classroom = messageText;
            console.log("num_classroom=", num_classroom);
            userSteps.set(ctx.chat.id, 'waiting_for_problem'); // Переход к следующему этапу

            const problemKeyBoard = new Keyboard().text('Да').row().text('Нет').resized();
            await ctx.reply('У вас проблема с оборудованием?', {
                reply_markup: problemKeyBoard
            });
        } else {
            await ctx.reply('Пожалуйста, введите корректный номер аудитории.');
        }
    } 
    
    
    else if (currentStep === 'waiting_for_problem') {
        if (messageText === 'Да') {
            console.log("User selected 'Да' - asking for equipment issues");

            const problemKeyBoard_Yes = new Keyboard().text('Не работает проектор')
                .row().text('Не работает компьютер').row().text('Не работают динамики')
                .row().text('Не работает микрофон').row().text('Не отображается флешка').resized();

            await ctx.reply('Выберите вариант проблемы с оборудованием:', {
                reply_markup: problemKeyBoard_Yes
            });
            problem_case_1 = 'Проблемы с оборудованием';
            userSteps.set(ctx.chat.id, 'problem_equipment_selected');
        } else if (messageText === 'Нет') {
            console.log("User selected 'Нет' - asking for program issues");

            const problemKeyBoard_No = new Keyboard().text('Не работает power point')
                .row().text('Не открываются файлы из флешки').row().text('Не запускается видео').resized();

            await ctx.reply('Проблема с работой какой-либо программы?', {
                reply_markup: problemKeyBoard_No
            });
            problem_case_1 = 'Проблемы с программой';
            userSteps.set(ctx.chat.id, 'problem_program_selected');
        }
    } 
    
    
    
    else if (currentStep === 'problem_equipment_selected' || currentStep === 'problem_program_selected') {
        problem_case_2 = messageText;
        global_problem = problem_case_1 + ', а именно, ' + problem_case_2;
        console.log("global_problem=", global_problem);

        const noteKeyboard = new Keyboard().text('Добавить').row().text('Не стоит').resized();
        await ctx.reply('Добавить примечание?', { 
            reply_markup: noteKeyboard 
        });
        userSteps.set(ctx.chat.id, 'waiting_for_note');
    } 
    
    
    
    else if (currentStep === 'waiting_for_note') {
        if (messageText === 'Добавить') {
            await ctx.reply('Пожалуйста, введите ваше примечание:');
            userSteps.set(ctx.chat.id, 'waiting_for_comment');
        } else if (messageText === 'Не стоит') {
            // Скрываем клавиатуру, когда она больше не нужна
            await ctx.reply('Без примечания', { reply_markup: { remove_keyboard: true } });

            // Запрос на вызов сотрудника (выводим текст и кнопки)
            const callEmployeeKeyboard = new Keyboard().text('Вызываем').row().text('Не вызываем').resized();
            await ctx.reply('Вызываем сотрудника?', { reply_markup: callEmployeeKeyboard });
            userSteps.set(ctx.chat.id, 'waiting_for_employee_call');
        }
    } 
    
    
    else if (currentStep === 'waiting_for_comment') {
        comment = messageText;
        console.log("comment=", comment);

        // Скрываем клавиатуру после ввода примечания
        await ctx.reply('Примечание добавлено.', { reply_markup: { remove_keyboard: true } });

        // Отправляем сообщение и кнопки с вопросом о вызове сотрудника
        const callEmployeeKeyboard = new Keyboard().text('Вызываем').row().text('Не вызываем').resized();
        await ctx.reply('Вызываем сотрудника?', { reply_markup: callEmployeeKeyboard });

        userSteps.set(ctx.chat.id, 'waiting_for_employee_call');
    } 
    
    
    
    else if (currentStep === 'waiting_for_employee_call') {
        if (messageText === 'Вызываем') {
            // Вызываем функцию для поиска преподавателя
            [instructor_name, instructor_id, isChangeQueue, instructorKey, isLinkedInstuctor] = findStaff(num_classroom);
            console.log(`получаем isLinked: ${isLinkedInstuctor}`)
            // Убираем кнопки и завершаем диалог
            await ctx.reply(`Отправляем заявку сотруднику`, { reply_markup: { remove_keyboard: true } });

            const requestData =  [instructor_id, num_classroom, global_problem, comment, messageText];
            await startConnectWithInsctructor(ctx, userSteps, ...requestData);

        } else if (messageText === 'Не вызываем') {
            // Обработка отказа от вызова сотрудника
            await ctx.reply('Заявка не будет продолжена. Всего доброго!', { reply_markup: { remove_keyboard: true } });
            userSteps.set(ctx.chat.id, 'discontinue_order');
        }
    } 
    
    else if (currentStep === 'waiting_for_instructor_response') {
        if (messageText == 'Принять') {
            //console.log(nextInstructorKey)
            nextInstructorKey ? 
            await continueWithInstructor(chatId, ctx, userSteps, data[nextInstructorKey].name):
            await continueWithInstructor(chatId, ctx, userSteps, instructor_name);

            if (isChangeQueue || !isLinkedInstuctor) { // меняем очередь, если препода брали из очереди или
                changeStack(instructorStack, instructorKey, nextInstructorKey)  // если прикреплённый перенаправил
            }
            // isChangeQueue ? isChangeQueue : isChangeQueue = true
        }

        else if (messageText == 'Перенаправить') {
            isLinkedInstuctor = false;
            console.log(`меняем isLinked на false`)
            const params = [instructor_name, 
                num_classroom, global_problem, comment, messageText]
            nextInstructorKey ? // В первый раз отправляем автоматически выбранному сотруднику, а
                                // в следующий раз уже перенаправляем нужному
            await redirectOrder(ctx, userSteps, instructor_id, nextInstructorKey, ...params):
            await redirectOrder(ctx, userSteps, instructor_id, instructorKey, ...params);
        }

        else {
            try {
                nextInstructorKey = getEnName(messageText, data);
                const newInstuctor = data[nextInstructorKey];
                if (instructorStack.includes(nextInstructorKey)) {
                    const requestData =  [newInstuctor.tg_id, num_classroom, global_problem, comment, messageText];
                    await startConnectWithInsctructor(ctx, userSteps, ...requestData);
                }
            } catch (error) {
                console.error(`Ошибка: ${error}`)
            }
        }
    }
});

// Запуск бота
bot.start();
