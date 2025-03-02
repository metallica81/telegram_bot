import { isInstructorBusy } from './isInstructorBusy.js';
import moment from 'moment';
import 'moment/locale/ru.js';  // русская локализация
import { convertDate } from './convertDate.js';
const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
const today = moment(); // Используем текущую дату
const currentFormattedDate = convertDate(today); // Форматируем дату для поиска в базе

// Создаем стек для очереди только свободный преподавателей преподавателей (FILO)
// export const availableInstructorStack = data.instructorStack;

export function getAvailableStack(stack) {
    for (let officer of stack) {
        if (isInstructorBusy(officer, currentFormattedDate, time24)) {
            console.log(`${officer} занят`);
            let busyIndex = stack.indexOf(officer);
            stack.splice(busyIndex, 1);
        } else {
            continue;
        }
    }
    return stack
}

// console.log(availableInstructorStack)
// console.log(getAvailableStack(availableInstructorStack))