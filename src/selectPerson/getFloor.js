// Функция для получения этажа из номера аудитории
export function getFloor(classroom) {
    return Math.floor(classroom / 100 % 10);  // Вторая цифра - этаж
}
