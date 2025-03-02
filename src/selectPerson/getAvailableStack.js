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

    return stack.filter(officer => {
        const busy = isInstructorBusy(officer, currentFormattedDate, time24);
        if (busy) {
            console.log(`${officer} занят`);
        } else {
            console.log(`${officer} свободен`);
        }
        return !busy; // Оставляем только свободных преподавателей
    });
}


// console.log(availableInstructorStack)
// console.log(getAvailableStack(availableInstructorStack))