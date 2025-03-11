import puppeteer from 'puppeteer';
import { fixedTimes } from './fixedTimes.js';   // время пар
import { allFunctions } from './allFunctions.js';
import { printData } from './printData.js';
import { writeDataToFile } from './writeDataToFile.js';
import { allData } from './getDataBase.js';

export const tgPersonalID = 7458287339;

export async function parseStaff(tgPersonalID, staffList, instructorPage, infoMenu, schedulePart, instructorKey) {
    const browser = await puppeteer.launch({ headless: false }); // headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto(staffList); // переходим в раздел сотрудников отдела
    await page.click(instructorPage); // переходим на страницу сотрудника
    await page.click(infoMenu); // раскрываем меню информации
    await page.click(schedulePart); // переходим в расписание

    let objectInstructorSchedule = await page.evaluate((
        tgPersonalID, getInstructorNameStr, 
        getLessonsStr, getClassroomsStr, 
        fixedTimesStr, allDataStr, instructorKey) => {
    
        // Восстанавливаем функции в контексте браузера
        const getInstructorName = eval(`(${getInstructorNameStr})`);
        const getLessons = eval(`(${getLessonsStr})`);
        const getClassrooms = eval(`(${getClassroomsStr})`);
        const fixedTimes = JSON.parse(fixedTimesStr);
        const allData = JSON.parse(allDataStr); // Декодируем allData
    
        function parseSchedule(instructorSchedule) {
            const data = {
                name: null,
                tg_id: tgPersonalID,
                order_count: instructorSchedule.order_count, 
                schedule_1th_week: [],
                schedule_2nd_week: [],
            };
    
            function parse_week(weekSelector, scheduleKey) {
                const days = document.querySelectorAll(`${weekSelector} .show`);
                days.forEach(day => {
                    const day_week = day.querySelector(".info-block__header-text").childNodes[0].textContent.trim();
                    const date = day.querySelector(".info-block__header-text :first-child").textContent.trim();
    
                    const lessons = getLessons(day);
                    const classrooms = getClassrooms(day);
    
                    // Преобразование номеров занятий в соответствующие временные интервалы
                    const lessonsInfo = lessons.map((num, index) => {
                        return {
                            "lessonNumber": num,
                            "lessonTime": fixedTimes[num] || null, // Назначаем время для конкретного занятия
                            "classroom": classrooms[index] || null // Кабинет назначается по индексу
                        };
                    });
    
                    // Добавляем расписание дня в итоговую структуру данных
                    data[scheduleKey].push({
                        [day_week]: [date].concat(lessonsInfo)
                    });
                });
            }
    
            data.name = getInstructorName();
            parse_week("#week-1", "schedule_1th_week");
            parse_week("#week-2", "schedule_2nd_week");
    
            return data;
        }
    
        return parseSchedule(allData[instructorKey]);
    },
    tgPersonalID,
    allFunctions.getInstructorName.toString(),
    allFunctions.getLessons.toString(),
    allFunctions.getClassrooms.toString(),
    JSON.stringify(fixedTimes),  
    JSON.stringify(allData),
    instructorKey 
    );  

    await browser.close();
    return objectInstructorSchedule;
}

printData();

