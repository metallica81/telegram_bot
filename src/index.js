import dotenv from 'dotenv';
dotenv.config();
import { Bot, Keyboard } from 'grammy';
import { findStaff, availableInstructorStack } from './selectPerson/selectPerson.js'; // Импорт функции для получения нужного преподавателя
import { startConnectWithInsctructor } from './connectingWithInstructor/startConnectWithInsctructor.js';
import { continueWithInstructor } from './connectingWithInstructor/continueWithInstructor.js';
import { redirectOrder } from './connectingWithInstructor/redirectOrder.js';
import { getEnName } from './selectPerson/getEnName.js';
import { setDataBase, getDataBase } from './dataBase/getDataBase.js';
import { changeStack } from './connectingWithInstructor/changeStack.js'
import { countOrders } from './countOrders.js';

// Создаем бота
const bot = new Bot(process.env.BOT_API_KEY);
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

const data = getDataBase();
let nextInstructorKey = null;

export let stackForKeyBoard = availableInstructorStack;  // отдельная очередь для распределения имён по redirect buttons

function resetStack() {
    stackForKeyBoard = availableInstructorStack; // Создаём новый массив с актуальными значениями
    if (!stackForKeyBoard.includes('osipovSchedule')) {
        stackForKeyBoard.push('osipovSchedule')
    }
    if (!stackForKeyBoard.includes('egorovSchedule')) {
        stackForKeyBoard.push('egorovSchedule')
    }
    console.log(`стек всех преподавателей, включая Егорова и Осипова, для того чтобы перенаправить заявку`, stackForKeyBoard)
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



// Обработчик для обычных сообщений
bot.on('message', async (ctx) => {
    // console.log('Преподаватель отвечает:', ctx.chat.id, 'Шаг у него при ответе:', userSteps.get(ctx.chat.id));
    const messageText = ctx.message.text;
    //console.log(`Received message: ${messageText}, Current step: ${userSteps.get(ctx.chat.id)}`);

    const currentStep = userSteps.get(ctx.chat.id);

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

            // Скрываем клавиатуру после ввода примечания
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
                [instructor_name, instructor_id, isChangeQueue, instructorKey, isLinkedInstuctor] = findStaff(num_classroom);
                // Убираем кнопки и завершаем диалог
                await ctx.reply(`Отправляем заявку сотруднику`, { reply_markup: { remove_keyboard: true } });
    
                const requestData =  [instructor_id, num_classroom, global_problem, comment, messageText];
                await startConnectWithInsctructor(ctx, userSteps, ...requestData);
    
            } else if (messageText === 'Не вызываем') {
                // Обработка отказа от вызова сотрудника
                await ctx.reply('Заявка не будет продолжена. Всего доброго!', { reply_markup: { remove_keyboard: true } });
                userSteps.set(ctx.chat.id, 'discontinue_order');
            } else {
                await ctx.reply('Пожалуйста, нажмите на кнопку справа от поля ввода и выберите один из пунктов');
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
        
    } 
    
    else if (currentStep === 'waiting_for_instructor_response') {
        try {
            if (messageText == 'Принять') {
                //console.log(nextInstructorKey)
                if (nextInstructorKey) {
                    await continueWithInstructor(chatId, ctx, userSteps, data[nextInstructorKey].name);
                    await countOrders(nextInstructorKey, data);
                    data.countRedirectedOrders++;
                } else {
                    await continueWithInstructor(chatId, ctx, userSteps, instructor_name);
                    await countOrders(instructorKey, data);
                }
                //console.log(`isChangeQueue и !isLinkedInstuctor: ${isChangeQueue} || ${!isLinkedInstuctor} : ${isChangeQueue || !isLinkedInstuctor}`)
                if (isChangeQueue || !isLinkedInstuctor) { // меняем очередь, если препода брали из очереди или
                    changeStack(data, instructorKey, nextInstructorKey)  // если прикреплённый перенаправил
                }
                // isChangeQueue ? isChangeQueue : isChangeQueue = true
                data.countCommonOrders++;
                // console.log(`все принятые заявки: ${data.countCommonOrders}`)
                // console.log(`redirected orders: ${data.countRedirectedOrders}`)
                // console.log(`each clickredirect: ${data.countOfEachClickRedirect}`)
                setDataBase(data); // Сохраняем изменения обратно
                
            }
    
            else if (messageText == 'Перенаправить') {
                isLinkedInstuctor = false;
    
                data.countOfEachClickRedirect++;
                //console.log(`перенаправленные заявки: ${data.countRedirectedOrders}`);
    
                //console.log(`меняем isLinked на false`)
                const params = [instructor_name, 
                    num_classroom, global_problem, comment, messageText]
                nextInstructorKey ? // В первый раз отправляем автоматически выбранному сотруднику, а
                                    // в следующий раз уже перенаправляем нужному
                await redirectOrder(ctx, userSteps, data[nextInstructorKey].tg_id, nextInstructorKey, ...params):
                await redirectOrder(ctx, userSteps, instructor_id, instructorKey, ...params);
                
            }
    
            else {
                try {
                    nextInstructorKey = getEnName(messageText, data);
                    const newInstuctor = data[nextInstructorKey];
                    if (availableInstructorStack.includes(nextInstructorKey)) {
                        const requestData =  [newInstuctor.tg_id, num_classroom, global_problem, comment, messageText];
                        await startConnectWithInsctructor(ctx, userSteps, ...requestData);
                    }
                } catch (error) {
                    console.error(`Ошибка: ${error}`)
                }
            }
        } catch (error) {
            console.error(`Ошибка в ${currentStep}: ${error}`)
        }
        
    }
});

// Запуск бота
bot.start();
