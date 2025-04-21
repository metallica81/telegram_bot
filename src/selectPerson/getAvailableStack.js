import { isInstructorBusy } from './isInstructorBusy.js';
import { getDataBase } from '../dataBase/getDataBase.js';
import { getTime } from './getTime.js';

export function getAvailableStack(stack) {
    const { time24, currentFormattedDate } = getTime();

    let data = getDataBase();
    
    return stack.filter(officer => {
        const busy = isInstructorBusy(data[officer], currentFormattedDate, time24);
        return !busy; // Оставляем только свободных преподавателей
    });
}