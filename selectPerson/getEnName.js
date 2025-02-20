// Функция для получения псевдонима по имени
export function getEnName(instructorName, data) {
    return Object.keys(data).find(key => data[key].name === instructorName) || 'Неизвестный ключ';
}
