import { Keyboard, GrammyError, HttpError } from 'grammy';
import { findStaff } from './selectPerson/selectPerson.js'; // Импорт функции для получения нужного преподавателя
import { startConnectWithInsctructor } from './connectingWithInstructor/startConnectWithInsctructor.js';
import { continueWithInstructor } from './connectingWithInstructor/continueWithInstructor.js';
import { redirectOrder } from './connectingWithInstructor/redirectOrder.js';
import { getEnName } from './selectPerson/getEnName.js';
import { setDataBase, getDataBase } from './dataBase/getDataBase.js';
import { changeStack } from './connectingWithInstructor/changeStack.js'
import { incrementOrderAmount } from './api/ordersQuery.js'
import { getTime } from './selectPerson/getTime.js';
import { bot } from './bot.js';
import { scheduleQuery } from './api/scheduleQuery.js';


bot.api.setMyCommands([
    { command: 'start', description: 'Оформить заявку' },
]);

// Глобальная переменная для хранения шагов пользователей
const userSteps = new Map();

// Глобальные переменные для хранения информации по заявке
let chatId; // Пример chatId
let num_classroom = null;
let problem_case_1 = null;
let problem_case_2 = null;
let global_problem = null;
let comment = null;
let instructorRedirecitonName = null;

// const data = getDataBase();
let nextInstructorKey = null;

function resetStack() {
    problem_case_1 = null;
    problem_case_2 = null;
    global_problem = null;
    comment = "отсутствует";
}

// Команда /start для начала диалога
bot.command('start', async (ctx) => {
    nextInstructorKey = null;
    resetStack(); // Обновляем stackForKeyBoard при каждом новом запуске

    // Сброс состояния сессии при начале новой заявки
    chatId = ctx.chat.id;
    // await ctx.reply(`Ваш chatID: ${chatId}`);
    userSteps.set(chatId, 'waiting_for_classroom'); // Устанавливаем начальный шаг
    await ctx.reply('Введите номер аудитории, в которой вы находитесь');
});


let [instructor_name, instructor_id, isChangeQueue, instructorKey, isLinkedInstuctor] = [null, null, null, null, null];

bot.on("callback_query:data", async (ctx) => {
    const data = await scheduleQuery();

    instructorRedirecitonName = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery('Вы выбрали: ' + instructorRedirecitonName);

    if (userSteps.get(ctx.chat.id) === 'waiting_for_instructor_response') {
        try {
            const { time24, currentFormattedDate } = getTime();

            nextInstructorKey = getEnName(instructorRedirecitonName, data);

            const newInstuctor = data[nextInstructorKey];

            const requestData =  [newInstuctor.tg_id, num_classroom, global_problem, comment, instructorRedirecitonName];
            await startConnectWithInsctructor(ctx, userSteps, ...requestData);
            
            console.log(`заявка перенаправлена ${instructorRedirecitonName} в ${time24} ${currentFormattedDate}`)
            await bot.api.sendMessage(ctx.chat.id, `Вы перенаправили сообщение сотруднику ${instructorRedirecitonName}`);
            
        } catch (error) {
            console.error(`Ошибка: ${error}`)
        }
    }
    
});


// Обработчик для обычных сообщений
bot.on('message', async (ctx) => {
    const data = await scheduleQuery();

    const messageText = ctx.message.text;

    const currentStep = userSteps.get(ctx.chat.id);
    
    const { time24, currentFormattedDate } = getTime();

    console.log('currentStep', currentStep)

    if (currentStep === 'waiting_for_classroom') {
        try {
            if (/^\d+$/.test(messageText)) {
                num_classroom = messageText;
                console.log("num_classroom=", num_classroom);
                userSteps.set(ctx.chat.id, 'waiting_for_problem'); // Переход к следующему этапу
    
                const problemKeyBoard = new Keyboard().text('С оборудованием').row().text('С программой').resized();
                await ctx.reply('У вас проблема с оборудованием или программой?', {
                    reply_markup: problemKeyBoard
                });
            } else {
                await ctx.reply('Пожалуйста, введите корректный номер аудитории.');
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
        
    } 
    
    
    else if (currentStep === 'waiting_for_problem') {
        try {
            if (messageText === 'С оборудованием') {
                problem_case_1 = 'Проблема с оборудованием';
                console.log(problem_case_1)
                console.log("User selected 'Да' - asking for equipment issues");
    
                const problemKeyBoard_Yes = new Keyboard().text('Не работает проектор')
                    .row().text('Не работает компьютер').row().text('Не работают динамики')
                    .row().text('Не работает микрофон').row().text('Не отображается флешка').resized();
    
                await ctx.reply('Выберите вариант проблемы с оборудованием или напишите свой:', {
                    reply_markup: problemKeyBoard_Yes
                });
                problem_case_1 = 'Проблемы с оборудованием';
                userSteps.set(ctx.chat.id, 'problem_equipment_selected');
            } else if (messageText === 'С программой') {
                problem_case_1 = 'Проблемма с программой';
                console.log(problem_case_1)
                console.log("User selected 'Нет' - asking for program issues");
    
                const problemKeyBoard_No = new Keyboard().text('Не работает power point')
                    .row().text('Не открываются файлы из флешки').row()
                    .text('Не запускается видео').resized();
    
                await ctx.reply('Выберите вариант проблемы с программой или напишите свой:', {
                    reply_markup: problemKeyBoard_No
                });
                problem_case_1 = 'Проблемы с программой';
                userSteps.set(ctx.chat.id, 'problem_program_selected');
            } else {
                await ctx.reply('Пожалуйста, нажмите на кнопку справа от поля ввода и выберите один из пунктов ');
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
    } 
    
    // Ответы на проблемы с оборудованием
    else if (currentStep === 'problem_equipment_selected') {
        try {
            problem_case_2 = messageText;
            console.log(problem_case_2)
            switch (messageText) {
                case 'Не работает проектор':
                    await ctx.reply('Проверьте подключение проектора к электросети и компьютеру. Если не помогает, обратитесь в техподдержку.');
                    break;
                case 'Не работает компьютер':
                    await ctx.reply('Попробуйте перезагрузить компьютер. Если проблема не исчезла, проверьте подключение к электросети.');
                    break;
                case 'Не работают динамики':
                    await ctx.reply('Проверьте, включены ли динамики и корректно ли выставлен уровень громкости.');
                    break;
                case 'Не работает микрофон':
                    await ctx.reply('Убедитесь, что микрофон включен и выбрана правильная аудиовходная настройка в системе.');
                    break;
                case 'Не отображается флешка':
                    await ctx.reply('Попробуйте вставить флешку в другой USB-порт или перезапустить компьютер.');
                    break;
            }
            // Переход к шагу 'waiting_for_note'
            const noteKeyboard = new Keyboard().text('Добавить').row().text('Не стоит').resized();
            await ctx.reply('Добавить примечание?', { 
                reply_markup: noteKeyboard 
            });
            userSteps.set(ctx.chat.id, 'waiting_for_note');
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`);
        }
    }

    // Ответы на проблемы с программами
    else if (currentStep === 'problem_program_selected') {
        try {
            problem_case_2 = messageText;
            switch (messageText) {
                case 'Не работает power point':
                    await ctx.reply('Попробуйте перезапустить программу. Если не помогает, проверьте наличие обновлений Microsoft Office.');
                    break;
                case 'Не открываются файлы из флешки':
                    await ctx.reply('Проверьте, распознается ли флешка системой. Если нет, попробуйте другой USB-порт.');
                    break;
                case 'Не запускается видео':
                    await ctx.reply('Проверьте, установлен ли необходимый кодек для воспроизведения видео. Попробуйте открыть файл в другом плеере.');
                    break;
            }
            // Переход к шагу 'waiting_for_note'
            userSteps.set(ctx.chat.id, 'waiting_for_note');
            const noteKeyboard = new Keyboard().text('Добавить').row().text('Не стоит').resized();
            await ctx.reply('Добавить примечание?', { 
                reply_markup: noteKeyboard 
            });
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`);
        }
    }
    
    else if (currentStep === 'waiting_for_note') {
        try {
            global_problem = `${problem_case_1}, а именно ${problem_case_2.charAt(0).toLowerCase() + problem_case_2.slice(1)}`;
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
            } else {
                await ctx.reply('Пожалуйста, нажмите на кнопку справа от поля ввода и выберите один из пунктов');
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
    } 
    
    
    else if (currentStep === 'waiting_for_comment') {
        try {
            comment = messageText;

            await ctx.reply('Примечание добавлено.', { reply_markup: { remove_keyboard: true } });

            // Отправляем сообщение и кнопки с вопросом о вызове сотрудника
            const callEmployeeKeyboard = new Keyboard().text('Вызываем').row().text('Не вызываем').resized();
            await ctx.reply('Вызываем сотрудника?', { reply_markup: callEmployeeKeyboard });

            userSteps.set(ctx.chat.id, 'waiting_for_employee_call');
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
    } 
    
    
    
    else if (currentStep === 'waiting_for_employee_call') {
        try {
            if (messageText === 'Вызываем') {
                // Вызываем функцию для поиска преподавателя
                [instructor_name, instructor_id, isChangeQueue, instructorKey, isLinkedInstuctor] = findStaff(num_classroom, data);
                console.log(`Первоначально заявка отправлена ${instructor_name} в ${time24} ${currentFormattedDate}`)
                
                await ctx.reply(`Отправляем заявку сотруднику`, { reply_markup: { remove_keyboard: true } });
    
                const requestData =  [instructor_id, num_classroom, global_problem, comment, messageText];
                await startConnectWithInsctructor(ctx, userSteps, ...requestData);
    
            } else if (messageText === 'Не вызываем') {
                // Обработка отказа от вызова сотрудника
                await ctx.reply('Заявка не будет продолжена. Всего доброго!', { reply_markup: { remove_keyboard: true } });
                userSteps.set(ctx.chat.id, 'discontinue_order');
            } else {
                await ctx.reply('Пожалуйста, нажмите на кнопку справа от поля ввода и выберите один из пунктов!');
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
        
    } 
    
    else if (currentStep === 'waiting_for_instructor_response') {
        try {
            if (messageText == 'Принять') {
                if (nextInstructorKey) {
                    await continueWithInstructor(chatId, ctx, userSteps, data[nextInstructorKey].name);
                    await incrementOrderAmount(data[nextInstructorKey].tg_id);
                    // data.countRedirectedOrders++;
                    console.log(`заявку принял ${data[nextInstructorKey].name} в ${time24} ${currentFormattedDate}`)
                } 
                
                else {
                    await incrementOrderAmount(data[instructorKey].tg_id)
                    await continueWithInstructor(chatId, ctx, userSteps, instructor_name);
                    console.log(`заявку принял ${instructor_name} в ${time24} ${currentFormattedDate}`);
                }

                if (isChangeQueue || !isLinkedInstuctor) { // меняем очередь, если препода брали из очереди или
                    changeStack(data, instructorKey, nextInstructorKey)  // если прикреплённый перенаправил
                }

                data.countCommonOrders++;
                setDataBase(data); // Сохраняем изменения обратно
            }
    
            else if (messageText == 'Перенаправить') {
                isLinkedInstuctor = false;
    
                data.countOfEachClickRedirect++;

                if (nextInstructorKey) {
                    await redirectOrder(data[nextInstructorKey].tg_id, nextInstructorKey, data)
                } else {
                    await redirectOrder(instructor_id, instructorKey, data)
                }
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
        
    }
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

// Запуск бота
bot.start();
