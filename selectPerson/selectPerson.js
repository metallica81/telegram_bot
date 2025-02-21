import moment from 'moment';
import 'moment/locale/ru.js';  // русская локализация

// импорты своих модулей
import { instructorClassroomsMap } from './connectClassroom.js'; // класс для препода
import { isInstructorBusy } from './isInstructorBusy.js';
import { convertDate } from './convertDate.js';
import { getAssociatedInstructor } from './getAssociatedInstructor.js';
import { getDataBase } from '../dataBase/getDataBase.js';
import { getRestPersons } from '../connectingWithInstructor/getRestPersons.js';
import { getEnName } from './getEnName.js';

let data = getDataBase(); // Вызвали базу данных

// Создаем стек для очереди преподавателей (FILO)
export const instructorStack = ['shatsionokSchedule', 'vrublevskiySchedule', 'homutovSchelule'];

// Функция для поиска сотрудника
export function findStaff(num_classroom) {
    const today = moment(); // Используем текущую дату
    const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
    const currentFormattedDate = convertDate(today); // Форматируем дату для поиска в базе

    // Определяем, кто закреплён за текущей аудиторией
    let associatedInstructor = getAssociatedInstructor(num_classroom, instructorClassroomsMap)

    // Если прикреплённый преподаватель найден, проверяем, занят ли он
    if (associatedInstructor) {
        console.log(`Начальная очередь из selectPerson`, [...instructorStack])
        const instructor = data[associatedInstructor];
        if (instructor) {
            const isBusy = isInstructorBusy(instructor, currentFormattedDate, time24);

            if (!isBusy) {
                console.log(`Прикреплённый преподаватель ${instructor.name} свободен.`);
                return [instructor.name, instructor.tg_id, false, associatedInstructor];
            } else {
                console.log(`Прикреплённый преподаватель ${instructor.name} занят.`);
            }
        }
    }
    
    // Если прикреплённый преподаватель занят, ищем первого свободного из очереди
    for (const instructorKey of instructorStack) {
        console.log(`Начальная очередь из selectPeson`, [...instructorStack])
        const instructor = data[instructorKey];
        if (!instructor) continue;

        const isBusy = isInstructorBusy(instructor, currentFormattedDate, time24);
        if (!isBusy) {
            
            console.log(`Свободный и первый из очереди найден: ${instructor.name}`);

            return [instructor.name, instructor.tg_id, true, instructorKey];
        } else {
            console.log(`Преподаватель ${instructor.name} занят.`);
        }
    }

    console.log(`Начальная очередь selectPeson`, [...instructorStack])
    // Если все преподаватели заняты, отправляем первому из очереди
    const instructorKey = instructorStack[0];
    const instructor = data[instructorKey];
    if (instructor) {
        console.log(`Все преподаватели заняты. Сообщение отправляется первому из очереди: ${instructor.name}`);
        return [instructor.name, instructor.tg_id, true, instructorKey];
    }

    console.log("база данных повреждена или преподаватели не найдены");
    return "база данных повреждена или преподаватели не найдены";
}

// console.log(getRestPersons('vrublevskiySchedule', instructorStack))
// console.log(getEnName(findStaff(212)[0], data));

