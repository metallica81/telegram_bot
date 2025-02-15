import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import moment from 'moment';
import 'moment/locale/ru.js';  // русская локализация

// импорты из своих модулей
import { homutovFixedClassroms, shatsionokFixedClassrooms, vrublevskiyFixedClassrooms } from './connectClassroom.js'; // класс для препода
import {isInstructorBusy} from './isInstructorBusy.js';
import {convertDate} from './convertDate.js';

// Путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
// Путь к директории текущего файла
const __dirname = path.dirname(__filename);

// Используем path.resolve для корректного формирования пути
const dataPath = path.resolve(__dirname, '..', 'data_base_new.json');  // Путь к файлу

let countCommonOrders = 0;

// Загрузка базы данных (синхронно, чтобы гарантировать доступность данных)
let data;
try {
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(jsonData);
} catch (err) {
    console.error("Ошибка при чтении файла базы данных", err);
}

// Создаем стек для очереди преподавателей (FILO)
const instructorStack = ['shatsionokSchedule', 'vrublevskiySchedule', 'homutovSchelule'];

// Функция для поиска ближайшей аудитории для заданного преподавателя
export function findStaff(num_classroom) {
    const today = moment(); // Используем текущую дату
    const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
    const currentFormattedDate = convertDate(today); // Форматируем дату для поиска в базе

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

    // Если прикреплённый преподаватель найден, проверяем, занят ли он
    if (associatedInstructor) {
        const instructor = data[associatedInstructor];
        if (instructor) {
            const isBusy = isInstructorBusy(instructor, currentFormattedDate, time24);

            if (!isBusy) {
                console.log(`Преподаватель ${instructor.name} свободен.`);
                return [instructor.name, instructor.tg_id];
            } else {
                console.log(`Преподаватель ${instructor.name} занят.`);
            }
        }
    }

    // Если прикреплённый преподаватель занят, ищем других свободных преподавателей
    for (const instructorKey of instructorStack) {
        const instructor = data[instructorKey];
        if (!instructor) continue;

        const isBusy = isInstructorBusy(instructor, currentFormattedDate, time24);
        if (!isBusy) {
            console.log(`Свободный преподаватель найден: ${instructor.name}`);
            return [instructor.name, instructor.tg_id];
        } else {
            console.log(`Преподаватель ${instructor.name} занят.`);
        }
    }

    // Если все преподаватели заняты, отправляем первому из очереди
    const fallbackInstructorKey = instructorStack[0];
    const fallbackInstructor = data[fallbackInstructorKey];
    if (fallbackInstructor) {
        console.log(`Все преподаватели заняты. Сообщение отправляется первому из очереди: ${fallbackInstructor.name}`);
        return [fallbackInstructor.name, fallbackInstructor.tg_id];
    }

    console.log("база данных повреждена или преподаватели не найдены");
    return "база данных повреждена или преподаватели не найдены";
}

//console.log(findClosestClassroom(3412));