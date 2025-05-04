import moment from "moment";
import "moment/locale/ru.js"; // русская локализация
import { convertDate } from "./convertDate.js";

export function getTime() {
    const today = moment(); // Используем текущую дату
    const time24 = [
        Number(moment().format("HH")),
        Number(moment().format("mm")),
    ];
    const currentFormattedDate = convertDate(today); // Форматируем дату для поиска в баз

    return {
        time24,
        currentFormattedDate,
    };
}
