const path = require('path');
const fs = require('fs');
const moment = require('moment');
require('moment/locale/ru');  // Подключаем русскую локализацию

// Путь к базе данных
const dataPath = path.resolve(__dirname, './data_base_new.json');

// Загрузка базы данных (синхронно, чтобы гарантировать доступность данных)
let data;
try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
    //console.log("Данные из базы успешно загружены:", data);  // Проверка загруженных данных
} catch (err) {
    console.error("Ошибка при чтении файла базы данных", err);
}

// Функция для преобразования даты в формат '8 ноября'
function formatDateToDBStyle(date) {
    return date.locale('ru').format('D MMMM');  
}

// let num_study = 1;
// let num_classroom = 3212;

// Создаем стек для очереди преподавателей (FILO)
    
const instructorStack = ['data_shatsionok', 'data_vrublevskiy', 'data_homutov']; // Приоритетный порядок преподавателей

// Функция для поиска ближайшей аудитории для заданного преподавателя
function findClosestClassroom(num_classroom) {
    const today = moment(); // Используем текущую дату
    const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
    const currentFormattedDate = formatDateToDBStyle(today);  // Форматируем дату для поиска в базе
    // console.log("Текущие время и дата:", time24, currentFormattedDate);

    let closestInstructor = null;
    let closestFloor = 5;  // Начнем с самого высокого этажа (плохо)
    let closestDistance = Infinity;  // Используем для отслеживания ближайшего расстояния на том же этаже
    let closestClassroom = Infinity; // Для отслеживания наиболее близкой аудитории
    let instuct_id = null;

    // Перебираем преподавателей из стека
    for (let i = 0; i < instructorStack.length; i++) {
        const instructorKey = instructorStack[instructorStack.length - 1 - i];  // Извлекаем преподавателя из конца стека
        const instructor = data[instructorKey];
        if (!instructor) continue;

        // Проверяем расписания для 1-й и 2-й недели
        for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
            const schedule = instructor[scheduleKey];
            if (!schedule) continue;

            for (const day of schedule) {
                const dayOfWeek = Object.keys(day)[0];
                const lessonsArray = day[dayOfWeek];

                if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                    for (let i = 1; i < lessonsArray.length; i++) {
                        const lesson = lessonsArray[i];
                    
                        // Проверяем, существует ли time_les и является ли это массивом
                        if (!lesson.time_les || !Array.isArray(lesson.time_les)) {
                            // console.log(`Пропущено занятие: некорректные данные time_les у`, lesson);
                            continue;
                        }
                    
                        const [startTime, endTime] = lesson.time_les;
                    
                        // Проверяем, находится ли текущее время в пределах занятия
                        const isDuringLesson = (
                            (time24[0] > startTime[0] || (time24[0] === startTime[0] && time24[1] >= startTime[1])) &&
                            (time24[0] < endTime[0] || (time24[0] === endTime[0] && time24[1] <= endTime[1]))
                        );
                    
                        // Проверяем, есть ли следующее занятие
                        const nextLesson = lessonsArray[i + 1];
                        let isDuringBreak = false;
                    
                        if (nextLesson && nextLesson.time_les && Array.isArray(nextLesson.time_les)) {
                            const [nextStartTime] = nextLesson.time_les;
                    
                            // Рассчитываем интервал времени между парами
                            const timeDifferenceMinutes =
                                (nextStartTime[0] * 60 + nextStartTime[1]) - (endTime[0] * 60 + endTime[1]);
                    
                            // Условие: текущее время находится между концом текущей пары и началом следующей
                            isDuringBreak = (
                                (time24[0] > endTime[0] || (time24[0] === endTime[0] && time24[1] >= endTime[1])) &&
                                (time24[0] < nextStartTime[0] || (time24[0] === nextStartTime[0] && time24[1] < nextStartTime[1])) &&
                                timeDifferenceMinutes > 0 // Убедиться, что есть разрыв
                            );
                    
                            if (isDuringBreak) {
                                console.log(
                                    `Сейчас перемена между парами. Текущая пара закончилась в ${endTime[0]}:${endTime[1]}, следующая начнётся в ${nextStartTime[0]}:${nextStartTime[1]}`
                                );
                            }
                        }
                    
                        if (isDuringLesson) {
                            console.log(
                                `Сейчас идёт занятие. Время занятия: ${startTime[0]}:${startTime[1]} - ${endTime[0]}:${endTime[1]}`
                            );
                        } else if (!isDuringBreak) {
                            console.log(
                                `Сейчас нет подходящих занятий или перемен.`
                            );
                        }
                    
                        // Условие: если это время занятия ИЛИ время перемены перед следующей парой
                        if (isDuringLesson || isDuringBreak) {
                            const classroom = lesson.classroom;
                            const floor = getFloor(classroom);
                            const distance = Math.abs(classroom % 100 - num_classroom % 100); // Расстояние по номеру кабинета
                    
                            // Проверка по этажу, затем по номеру кабинета (расстоянию)
                            if (
                                floor < closestFloor || // Ближайший этаж
                                (floor === closestFloor && distance < closestDistance) || // Если этаж одинаков, выбираем по близости кабинета
                                (floor === closestFloor && distance === closestDistance && classroom < closestClassroom)
                            ) {
                                closestFloor = floor;
                                closestDistance = distance;
                                closestClassroom = classroom;
                                closestInstructor = instructor.name;
                                instuct_id = instructor.tg_id;
                            }
                        }
                    }
                    
                    // Если ничего не найдено для текущего времени
                    if (!closestInstructor) {
                        console.log(`Преподаватели отсутствуют на текущую дату и время.`);
                    }
                    
                    
                }
            }
        }
    }

    // Если ни одного преподавателя с занятием не найдено, выбираем fallback-преподавателя
    if (!closestInstructor && instructorStack.length > 0) {
        const fallbackInstructor = data[instructorStack[0]];
        if (fallbackInstructor) {
            closestInstructor = fallbackInstructor.name;
            instuct_id = fallbackInstructor.tg_id;
            closestFloor = "Этаж неизвестен";
            console.log(`Используется fallback преподаватель: ${closestInstructor}`);
        }
    }

    // Обновляем стек
    let newInstructorKey = instructorStack.shift();
    instructorStack.push(newInstructorKey);
    console.log("Изменённая очередь:", instructorStack);

    if (closestInstructor) {
        return [closestInstructor, `Этаж ${closestFloor}`, instuct_id];
    } else {
        return "Нет занятий для текущей пары на эту дату.";
    }
}
   


module.exports = { findClosestClassroom }; // Экспортирую функцию для использозвания внутри бота

// Функция для получения этажа из номера аудитории
function getFloor(classroom) {
    return Math.floor(classroom / 100 % 10);  // Вторая цифра - этаж
}

// Вызов функции после загрузки данных
//console.log(findClosestClassroom(num_study, num_classroom));
//findClosestClassroom(3212);