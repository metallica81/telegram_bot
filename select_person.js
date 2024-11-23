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
function findClosestClassroom(num_study, num_classroom) {
    const today = moment(); // Используем текущую дату
    const currentFormattedDate = formatDateToDBStyle(today);  // Форматируем дату для поиска в базе

    console.log('Поиск для даты:', currentFormattedDate);

    let closestInstructor = null;
    let closestFloor = 5;  // Начнем с самого высокого этажа (плохо)
    let closestDistance = Infinity;  // Используем для отслеживания ближайшего расстояния на том же этаже
    let closestClassroom = Infinity; // Для отслеживания наиболее близкой аудитории
    let instuct_id = null;

    // Перебираем преподавателей из стека
    for(let i = 0; i < instructorStack.length; i++) {
        //console.log("Очередь в текущеим круге", instructorStack);
        const instructorKey = instructorStack[instructorStack.length-1-i];  // Извлекаем преподавателя из конца стека
        const instructor = data[instructorKey];
        if (!instructor) {
            //console.log(`Пропущен ${instructorKey}, так как данных нет.`);
            continue;
        }

        //console.log(`Проверяем расписание для преподавателя: ${instructor.name}`);

        // Проверяем расписания для 1-й и 2-й недели
        for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
            const schedule = instructor[scheduleKey];
            if (!schedule) {
                //console.log(`У преподавателя ${instructor.name} нет данных в ${scheduleKey}`);
                continue;
            }

            for (const day of schedule) {
                const dayOfWeek = Object.keys(day)[0];
                const lessonsArray = day[dayOfWeek];

                //console.log(`Проверка дня недели ${dayOfWeek}, данные занятий:`, lessonsArray);

                if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                    //console.log(`Найдена дата ${currentFormattedDate} у ${instructor.name} в ${dayOfWeek}`);
                    
                    for (let i = 1; i < lessonsArray.length; i++) {
                        const lesson = lessonsArray[i];
                        //console.log(`Проверка занятия:`, lesson);
                        
                        if (lesson.num_les == num_study) {
                            const classroom = lesson.classroom;
                            const floor = getFloor(classroom);
                            const distance = Math.abs(classroom % 100 - num_classroom % 100);  // Расстояние по номеру кабинета

                            // console.log(`Найдено занятие на этаже ${floor}, аудитория ${classroom}`);
                            // console.log(`Текущий этаж для сравнения: ${closestFloor}, текущий преподаватель: ${closestInstructor}`);
                            // console.log(`Расстояние до целевой аудитории по номеру кабинета: ${distance}`);

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
                                //console.log(`Обновлен ближайший преподаватель: ${closestInstructor}, этаж: ${closestFloor}, аудитория: ${closestClassroom}, расстояние: ${closestDistance}`);
                            }
                        }
                    }
                }
            }
        }
    }

    // Если ни одного преподавателя с занятием не найдено, выбираем первого преподавателя в instructorStack
    //console.log(closestInstructor, instructorStack.length);
    if (!closestInstructor && instructorStack.length > 0) {
        //console.log("Случай с отсутсвующим преподом");
        const fallbackInstructor = data[instructorStack[0]];
        //console.log("Запасной препод", data[instructorStack[0]]);
        if (fallbackInstructor) {
            closestInstructor = fallbackInstructor.name;
            instuct_id = fallbackInstructor.tg_id;
            closestFloor = "Этаж неизвестен";
            console.log(`Используется fallback преподаватель: ${closestInstructor}`);
        }
    }

    let newInstructorKey = instructorStack.shift();   // Вносим изменеия в очередь (fifo)
    instructorStack.push(newInstructorKey);
    console.log("изменённая очередь", instructorStack)

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