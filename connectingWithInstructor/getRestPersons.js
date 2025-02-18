import moment from 'moment';
import 'moment/locale/ru.js';  // русская локализация

import { convertDate } from '../selectPerson/convertDate.js'
import { getDataBase } from '../dataBase/getDataBase.js';
import { isInstructorBusy } from '../selectPerson/isInstructorBusy.js';


const today = moment(); // Используем текущую дату
const time24 = [Number(moment().format('HH')), Number(moment().format('mm'))];
const currentFormattedDate = convertDate(today); // Форматируем дату для поиска в базе

let data = getDataBase();

const instructorStack = ['shatsionokSchedule', 'vrublevskiySchedule', 'homutovSchelule'];

export function getRestPersons(instructor_name, instructor_stack) {
    if (instructor_stack && instructor_name.length !== 0) {
        try {
            let restNames = instructor_stack.filter((element) => element != instructor_name && !isInstructorBusy(element, currentFormattedDate, time24))
            return restNames
        } catch (error) {
            console.error(error.message)
        }
    }
}

console.log(getRestPersons('vrublevskiySchedule', instructorStack))