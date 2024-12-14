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

// Создаем стек для очереди преподавателей (FILO)
const instructorStack = ['shatsionokSchedule', 'vrublevskiySchedule', 'homutovSchelule']; // Приоритетный порядок преподавателей

// Функция для поиска ближайшей аудитории для заданного преподавателя
function findClosestClassroom(num_classroom) {
    const today = moment(); // Используем текущую дату
    const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
    const currentFormattedDate = formatDateToDBStyle(today); // Форматируем дату для поиска в базе

    // Связываем преподавателей с их аудиториями
    const instructorClassroomsMap = {
        shatsionokSchedule: shatsionokFixedClassrooms,
        vrublevskiySchedule: vrublevskiyFixedClassrooms,
        homutovSchelule: homutovFixedClassroms
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
            const isBusy = checkIfInstructorBusy(instructor, currentFormattedDate, time24);

            if (!isBusy) {
                console.log(`Преподаватель ${instructor.name} свободен.`);
                return [instructor.name, `Этаж ${getFloor(num_classroom)}`, instructor.tg_id];
            } else {
                console.log(`Преподаватель ${instructor.name} занят.`);
            }
        }
    }

    // UPDATED: Если прикреплённый преподаватель занят, ищем других свободных преподавателей
    for (const instructorKey of instructorStack) {
        const instructor = data[instructorKey];
        if (!instructor) continue;

        const isBusy = checkIfInstructorBusy(instructor, currentFormattedDate, time24);
        if (!isBusy) {
            console.log(`Свободный преподаватель найден: ${instructor.name}`);
            return [instructor.name, `Этаж ${getFloor(num_classroom)}`, instructor.tg_id];
        } else {
            console.log(`Преподаватель ${instructor.name} занят.`);
        }
    }

    // UPDATED: Если все преподаватели заняты, отправляем первому из очереди
    const fallbackInstructorKey = instructorStack[0];
    const fallbackInstructor = data[fallbackInstructorKey];
    if (fallbackInstructor) {
        console.log(`Все преподаватели заняты. Сообщение отправляется первому из очереди: ${fallbackInstructor.name}`);
        return [fallbackInstructor.name, `Этаж ${getFloor(num_classroom)}`, fallbackInstructor.tg_id];
    }

    // Если база данных повреждена или преподаватели не найдены
    console.log("Нет доступных преподавателей.");
    return "Нет доступных преподавателей.";
}

// Функция для проверки занятости преподавателя
function checkIfInstructorBusy(instructor, currentFormattedDate, time24) {
    for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
        const schedule = instructor[scheduleKey];
        if (!schedule) continue;

        for (const day of schedule) {
            const dayOfWeek = Object.keys(day)[0];
            const lessonsArray = day[dayOfWeek];

            if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                for (let i = 1; i < lessonsArray.length; i++) {
                    const lesson = lessonsArray[i];
                    if (!lesson.lessonTime || !Array.isArray(lesson.lessonTime)) continue;

                    const [startTime, endTime] = lesson.lessonTime;
                    const isDuringLesson = (
                        (time24[0] > startTime[0] || (time24[0] === startTime[0] && time24[1] >= startTime[1])) &&
                        (time24[0] < endTime[0] || (time24[0] === endTime[0] && time24[1] <= endTime[1]))
                    );

                    if (isDuringLesson) {
                        return true; // Преподаватель занят
                    }
                }
            }
        }
    }
    return false; // Преподаватель свободен
}

module.exports = { findClosestClassroom }; // Экспортирую функцию для использозвания внутри бота

// Функция для получения этажа из номера аудитории
function getFloor(classroom) {
    return Math.floor(classroom / 100 % 10);  // Вторая цифра - этаж
}

// Вызов функции после загрузки данных
//console.log(findClosestClassroom(3412));