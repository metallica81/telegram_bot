// Функция для преобразования даты в формат '8 ноября'
export function convertDate(date) {
    return date.locale('ru').format('D MMMM');  
}