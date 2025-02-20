// Функция для получения псевдонима по имени
export function getEnName(instructorName, data) {
    return Object.keys(data).find(key => data[key].name === instructorName) || 'Неизвестный ключ';
}


// Функция для получения имени сотрудника по его псевдониму
export function getInstructorNameFromEn(scheduleKey, data) {
    return data[scheduleKey]?.name || 'Неизвестный преподаватель';
}