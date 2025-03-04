import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';

import { getDataBase } from './getDataBase.js';
//import { instructorClassroomsMap } from '../selectPerson/connectClassroom.js';

const allData = getDataBase();
const tgPersonalID = 7458287339;

//885326963; // мой id
//1140094825 - Валерий id 
//5428269745 - id Павла Васильевича
//7458287339 - second acc
//1311307294 - Яся
//7458287339

const fixedTimes = {
    1: [[8, 30], [9, 50]],
    2: [[10, 5], [11, 25]],
    3: [[11, 40], [13, 0]],
    4: [[13, 45], [15, 5]],
    5: [[15, 20], [16, 40]],
    6: [[16, 55], [18, 15]],
    7: [[18, 30], [19, 50]],
    8: [[20, 0], [21, 20]]
};

const allFunctions = {
    getInstructorName: function() {
        return document.querySelector(".page-header-name__title").innerText;
    },

    getLessons: function(element) {
        let num_lessons = [];
        const lesson_elements = element.querySelectorAll(".mb-1");
        lesson_elements.forEach(lesson => {
            const match = lesson.textContent.trim().match(/^\d+/);
            if (match) {
                num_lessons.push(Number(match[0]));
            }
        });
        return num_lessons;
    },

    getClassrooms: function(element) {
        let classrooms = [];
        const classroom_elements = element.querySelectorAll(".mb-2");
        classroom_elements.forEach(classroom => {
            const match = classroom.textContent.trim().match(/\d+$/);
            if (match) {
                classrooms.push(parseInt(match[0], 10));
            }
        });
        return classrooms;
    }
}


let parseOfficerShatsionok = (async (tgPersonalID) => {
    const browser = await puppeteer.launch({ headless: false }); // headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // переходим в раздел сотрудников отдела

    await page.click('a[href="/people/27900"]'); // переходим на страницу Павла Васильевича
    await page.click('.page__sub-menu-header__title'); // раскрываем меню информации
    await page.click('a[href="/people/27900/timetable"]'); // переходим в расписание

    let objectInstructorSchedule = await page.evaluate((
        tgPersonalID, getInstructorNameStr, 
        getLessonsStr, getClassroomsStr, 
        fixedTimesStr, allDataStr) => {
    
        // Восстанавливаем функции в контексте браузера
        const getInstructorName = eval(`(${getInstructorNameStr})`);
        const getLessons = eval(`(${getLessonsStr})`);
        const getClassrooms = eval(`(${getClassroomsStr})`);
        const fixedTimes = JSON.parse(fixedTimesStr);
        const allData = JSON.parse(allDataStr); // Декодируем allData
    
        function parseSchedule(allData) {
            const data = {
                name: null,
                tg_id: tgPersonalID,
                order_count: allData.shatsionokSchedule.order_count, 
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
    
        return parseSchedule(allData);
    },
    tgPersonalID,
    allFunctions.getInstructorName.toString(),
    allFunctions.getLessons.toString(),
    allFunctions.getClassrooms.toString(),
    JSON.stringify(fixedTimes),  
    JSON.stringify(allData) 
    );  

    await browser.close();
    return objectInstructorSchedule;
});


let parseOfficerVrublevskiy = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({headless: false}); // headless - opening in the background
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // navigating to the department's employees section

    await page.click('a[href="/people/405"]'); // navigating to Pavel Vasilievich's page
    // Homutov's href="/people/488332"

    await page.click('.page__sub-menu-header__title'); // expanding the info menu

    await page.click('a[href="/people/405/timetable"]'); // navigating to the timetable

    let objectInstructorSchedule = await page.evaluate((
        tgPersonalID, getInstructorNameStr, 
        getLessonsStr, getClassroomsStr, fixedTimesStr, allDataStr) => {

        // Восстанавливаем функцию в контексте страницы
        const getInstructorName = eval(`(${getInstructorNameStr})`);
        const getLessons = eval(`(${getLessonsStr})`);
        const getClassrooms = eval(`(${getClassroomsStr})`);
        const fixedTimes = eval(`(${fixedTimesStr})`);
        const allData = JSON.parse(allDataStr); // Декодируем allData

        function parseSchedule() {
            const data = {
                name: null,
                tg_id: tgPersonalID,
                order_count: allData.vrublevskiySchedule.order_count,
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

        return parseSchedule(allData);
    },
    tgPersonalID,
    allFunctions.getInstructorName.toString(),
    allFunctions.getLessons.toString(),
    allFunctions.getClassrooms.toString(),
    JSON.stringify(fixedTimes),
    JSON.stringify(allData) 
    ); 

    await browser.close();
    return objectInstructorSchedule;
});


let parseOfficerHomutov = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({ headless: false }); // Открытие в видимом режиме для отладки
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // Переход на страницу сотрудников

    await page.click('a[href="/people/488332"]'); // Переход на страницу конкретного сотрудника

    await page.click('.page__sub-menu-header__title'); // Раскрытие меню информации

    await page.click('a[href="/people/488332/timetable"]'); // Переход в раздел расписания

    let objectInstructorSchedule = await page.evaluate((
        tgPersonalID, getInstructorNameStr, 
        getLessonsStr, getClassroomsStr, fixedTimesStr, allDataStr) => {

        // Восстанавливаем функцию в контексте страницы
        const getInstructorName = eval(`(${getInstructorNameStr})`);
        const getLessons = eval(`(${getLessonsStr})`);
        const getClassrooms = eval(`(${getClassroomsStr})`);
        const fixedTimes = eval(`(${fixedTimesStr})`);
        const allData = JSON.parse(allDataStr); // Декодируем allData

        function parseSchedule() {
            const data = {
                name: null,
                tg_id: tgPersonalID,
                order_count: allData.vrublevskiySchedule.order_count,
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

        return parseSchedule(allData);
    },
    tgPersonalID,
    allFunctions.getInstructorName.toString(),
    allFunctions.getLessons.toString(),
    allFunctions.getClassrooms.toString(),
    JSON.stringify(fixedTimes),
    JSON.stringify(allData) 
    ); 

    await browser.close();
    return objectInstructorSchedule;
});

async function writeDataToFile() {
    try {
        // Дожидаемся данных от обеих функций
        const dataShatsionok = await parseOfficerShatsionok(tgPersonalID); 
        const dataVrublevskiy = await parseOfficerVrublevskiy(tgPersonalID); 
        const dataHomutov = await parseOfficerHomutov(tgPersonalID);

        // Создаем объект с данными
        const combinedData = {
            countCommonOrders: allData.countCommonOrders,
            countRedirectedOrders: allData.countRedirectedOrders,
            countOfEachClickRedirect: allData.countOfEachClickRedirect,
            instructorStack: allData.instructorStack,
            osipovSchedule: allData.osipovSchedule,
            shatsionokSchedule: dataShatsionok,
            vrublevskiySchedule: dataVrublevskiy,
            homutovSchelule: dataHomutov
        };

        // Преобразуем объект в JSON и записываем в файл
        await fs.writeFile('src/dataBase/dataBase.json', JSON.stringify(combinedData, null, 4));
        console.log('File successfully written');
    } catch (err) {
        console.log('Error writing file:', err);
    }
}

async function printData() {
    try {
        await writeDataToFile();
  
        // Читаем данные из файла после записи
        const data = await fs.readFile('src/dataBase/dataBase.json', 'utf8');

        // Парсим JSON-данные и выводим их в консоль
        console.log(JSON.stringify(JSON.parse(data), null, 2));

    } catch (err) {
        console.log('Error rading file:', err);
    }
}

printData();
