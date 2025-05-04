import { isInstructorBusy } from './isInstructorBusy.js';
import { getTime } from './getTime.js';

export function getAvailableStack(stack, data) {
    const { time24, currentFormattedDate } = getTime();
    
    return stack.filter(officer => {
        const busy = isInstructorBusy(data[officer], currentFormattedDate, time24);
        return !busy; // Оставляем только свободных преподавателей
    });
}