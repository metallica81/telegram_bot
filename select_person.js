const path = require('path');
const fs = require('fs');
const moment = require('moment');
require('moment/locale/ru');  // Подключаем русскую локализацию

// Путь к базе данных
const dataPath = path.resolve(__dirname, './data_base_new.json');

// Массивы с аудиториями для каждого преподавателя
const shatsionokFixedClassrooms = [
    3101, 3102, 3103, 3104, 
    3105, 3106, 3107, 3108, 
    3109, 3110, 3111, 3112, 
    3113, 3114, 3115, 3116
];

const vrublevskiyFixedClassrooms = [
    3201, 3202, 3203, 3204, 
    3205, 3206, 3207, 3208, 
    3209, 3210, 3211, 3212, 
    3213, 3214, 3215, 3216, 
    3301, 3302, 3303, 3304, 
    3305, 3306, 3307, 3308, 
    3309, 3310, 3311, 3312, 
    3313, 3314, 3315, 3316
];

const homutovFixedClassroms = [
    3401, 3402, 3403, 3404, 
    3405, 3406, 3407, 3408, 
    3409, 3410, 3411, 3412, 
    3413, 3414, 3415, 3416, 
    3501, 3502, 3503, 3504, 
    3505, 3506, 3507, 3508, 
    3509, 3510, 3511, 3512, 
    3513, 3514, 3515, 3516
];

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
let num_classroom = 3212;

// Создаем стек для очереди преподавателей (FILO)
const instructorStack = ['data_shatsionok', 'data_vrublevskiy', 'data_homutov']; // Приоритетный порядок преподавателей

// Функция для поиска ближайшей аудитории для заданного преподавателя
function findClosestClassroom(num_classroom) {
    const today = moment(); // Используем текущую дату
    const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
    const currentFormattedDate = formatDateToDBStyle(today); // Форматируем дату для поиска в базе

    // Связываем преподавателей с их аудиториями
    const instructorClassroomsMap = {
        data_shatsionok: shatsionokFixedClassrooms,
        data_vrublevskiy: vrublevskiyFixedClassrooms,
        data_homutov: homutovFixedClassroms,
    };

    // Определяем, кто закреплён за текущей аудиторией
    let associatedInstructor = null;
    for (const [instructorKey, classrooms] of Object.entries(instructorClassroomsMap)) {
        if (classrooms.includes(num_classroom)) {
            associatedInstructor = instructorKey;
            break;
        }
    }

    // Если преподаватель найден, проверяем, есть ли у него занятия
    if (associatedInstructor) {
        const instructor = data[associatedInstructor];
        if (instructor) {
            // Проверяем его расписание
            for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
                const schedule = instructor[scheduleKey];
                if (!schedule) continue;

                for (const day of schedule) {
                    const dayOfWeek = Object.keys(day)[0];
                    const lessonsArray = day[dayOfWeek];

                    if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                        for (let i = 1; i < lessonsArray.length; i++) {
                            const lesson = lessonsArray[i];
                            if (!lesson.time_les || !Array.isArray(lesson.time_les)) continue;

                            const [startTime, endTime] = lesson.time_les;
                            const isDuringLesson = (
                                (time24[0] > startTime[0] || (time24[0] === startTime[0] && time24[1] >= startTime[1])) &&
                                (time24[0] < endTime[0] || (time24[0] === endTime[0] && time24[1] <= endTime[1]))
                            );

                            if (isDuringLesson) {
                                // Преподаватель занят
                                console.log(`Преподаватель ${instructor.name} занят.`);
                                associatedInstructor = null; // Сбрасываем, так как он занят
                                break;
                            }
                        }
                    }
                }
            }

            // Если после проверки занятий преподаватель остаётся свободным
            if (associatedInstructor) {
                console.log(`Преподаватель ${instructor.name} свободен и подходит.`);
                return [instructor.name, `Этаж ${getFloor(num_classroom)}`, instructor.tg_id];
            }
        }
    }

    // Если преподаватель занят или не найден, ищем ближайшего свободного
    let closestInstructor = null;
    let closestFloor = 5; // Начнем с самого высокого этажа (плохо)
    let closestDistance = Infinity; // Используем для отслеживания ближайшего расстояния
    let closestClassroom = Infinity; // Для отслеживания ближайшей аудитории
    let instuct_id = null;

    for (const instructorKey of instructorStack) {
        const instructor = data[instructorKey];
        if (!instructor) continue;

        for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
            const schedule = instructor[scheduleKey];
            if (!schedule) continue;

            for (const day of schedule) {
                const dayOfWeek = Object.keys(day)[0];
                const lessonsArray = day[dayOfWeek];

                if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                    for (let i = 1; i < lessonsArray.length; i++) {
                        const lesson = lessonsArray[i];
                        if (!lesson.time_les || !Array.isArray(lesson.time_les)) continue;

                        const classroom = lesson.classroom;
                        const floor = getFloor(classroom);
                        const distance = Math.abs(classroom % 100 - num_classroom % 100); // Расстояние по номеру кабинета

                        // Проверяем свободные аудитории и расстояние
                        if (
                            floor < closestFloor ||
                            (floor === closestFloor && distance < closestDistance) ||
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
            }
        }
    }

    // Обновляем стек преподавателей
    let newInstructorKey = instructorStack.shift();
    instructorStack.push(newInstructorKey);
    console.log("Изменённая очередь:", instructorStack);

    if (closestInstructor) {
        return [closestInstructor, `Этаж ${closestFloor}`, instuct_id];
    } else {
        return "Нет доступных преподавателей.";
    }
}

   


module.exports = { findClosestClassroom }; // Экспортирую функцию для использозвания внутри бота

// Функция для получения этажа из номера аудитории
function getFloor(classroom) {
    return Math.floor(classroom / 100 % 10);  // Вторая цифра - этаж
}

// Вызов функции после загрузки данных
//console.log(findClosestClassroom(num_study, num_classroom));
console.log(findClosestClassroom(3212));