
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
// const data_base_info = require("./data_base_new");

const tg_PersonalID = 885326963; // мой id
//1140094825 - Валерий id 
//5428269745 - id Павла Васильевича


let parse_officer_shatsionok = (async (tg_PersonalID) => {
    const browser = await puppeteer.launch({ headless: false }); // headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // переходим в раздел сотрудников отдела

    await page.click('a[href="/people/27900"]'); // переходим на страницу Павла Васильевича
    await page.click('.page__sub-menu-header__title'); // раскрываем меню информации
    await page.click('a[href="/people/27900/timetable"]'); // переходим в расписание

    let array_date = await page.evaluate((tg_PersonalID) => {
        function parse_date() {
            const data = {
                name: null,
                tg_id: tg_PersonalID,
                schedule_1th_week: [],
                schedule_2nd_week: []
            };

            function get_name_instructor() {
                return document.querySelector(".page-header-name__title").innerText;
            }

            function get_num_lessons(element) {
                let num_lessons = [];
                const lesson_elements = element.querySelectorAll(".mb-1");
                lesson_elements.forEach(lesson => {
                    const match = lesson.textContent.trim().match(/^\d+/);
                    if (match) {
                        num_lessons.push(Number(match[0]));
                    }
                });
                return num_lessons;
            }

            function get_classrooms(element) {
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

            function parse_week(weekSelector, scheduleKey) {
                const days = document.querySelectorAll(`${weekSelector} .show`);
                days.forEach(day => {
                    const day_week = day.querySelector(".info-block__header-text").childNodes[0].textContent.trim();
                    const date = day.querySelector(".info-block__header-text :first-child").textContent.trim();

                        const num_lessons = get_num_lessons(day);
                        const classrooms = get_classrooms(day);

                        // Преобразование номеров занятий в соответствующие временные интервалы
                        const lessons_info = num_lessons.map((num, index) => {
                            const fixedTimes = {
                                1: [[8, 30], [9, 50]],
                                2: [[10, 5], [11, 25]],
                                3: [[11, 40], [13, 0]],
                                4: [[13, 45], [15, 5]],
                                5: [[15, 20], [16, 40]],
                                6: [[16, 55], [18, 15]],
                                7: [[18, 30], [19, 50]]
                            };

                            return {
                                "num_les": num,
                                "time_les": fixedTimes[num] || null, // Назначаем время для конкретного занятия
                                "classroom": classrooms[index] || null // Кабинет назначается по индексу
                            };
                        });

                        // Добавляем расписание дня в итоговую структуру данных
                        data[scheduleKey].push({
                            [day_week]: [date].concat(lessons_info)
                        });
                });
            }

            data.name = get_name_instructor();
            parse_week("#week-1", "schedule_1th_week");
            parse_week("#week-2", "schedule_2nd_week");

            return data;
        }

        return parse_date();
    }, tg_PersonalID);

    await browser.close();
    return array_date;
});


let parse_officer_vrublevskiy = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({headless: false}); // headless - opening in the background
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // navigating to the department's employees section

    await page.click('a[href="/people/405"]'); // navigating to Pavel Vasilievich's page
    // Homutov's href="/people/488332"

    await page.click('.page__sub-menu-header__title'); // expanding the info menu

    await page.click('a[href="/people/405/timetable"]'); // navigating to the timetable

    let array_date = await page.evaluate((tg_PersonalID) => {

        function parse_date() {

            const data = {
                name: null,
                tg_id: tg_PersonalID,
                schedule_1th_week: [],
                schedule_2nd_week: []
            };

            function get_name_instructor() {
                let name_instructor = null;
                name_instructor = document.querySelector(".page-header-name__title").innerText;
                return name_instructor;
            };

            function get_num_lessons(element) {
                let num_lessons = [];
                const lesson_elements = element.querySelectorAll(".mb-1");
                lesson_elements.forEach(lesson => {
                    const match = lesson.textContent.trim().match(/^\d+/);
                    if (match) {
                        num_lessons.push(Number(match[0]));
                    }
                });
                return num_lessons;
            };

            function get_classrooms(element) {
                let classrooms = [];
                const classroom_elements = element.querySelectorAll(".mb-2");
                classroom_elements.forEach(classroom => {
                    const match = classroom.textContent.trim().match(/\d+$/);
                    if (match) {
                        classrooms.push(parseInt(match[0], 10));
                    }
                });
                return classrooms;
            };

            function get_time_lesson(element) {
                let time_lesson = [];
                let time_elements = element.querySelectorAll('[style*="font-size: 1.2rem"]');
                if (element) {
                    const text = element.textContent.trim();
                    const matches = text.match(/(\d{2}):(\d{2}) — (\d{2}):(\d{2})/);
                    if (matches) {
                        time_lesson = [
                            [Number(matches[1].padStart(2, '0')), Number(matches[2].padStart(2, '0'))],
                            [Number(matches[3].padStart(2, '0')), Number(matches[4].padStart(2, '0'))]
                        ];
                    }
                }
                return time_lesson;
            };

            function parse_week(weekSelector, scheduleKey) {
                const days = document.querySelectorAll(`${weekSelector} .show`);
                days.forEach(day => {
                    const day_week = day.querySelector(".info-block__header-text").childNodes[0].textContent.trim();
                    const date = day.querySelector(".info-block__header-text :first-child").textContent.trim();

                    const num_lessons = get_num_lessons(day);
                    const time_lesson = get_time_lesson(day);
                    const classrooms = get_classrooms(day);

                    const lessons_info = num_lessons.map((num, index) => {
                        const fixedTimes = {
                            1: [[8, 30], [9, 50]],
                            2: [[10, 5], [11, 25]],
                            3: [[11, 40], [13, 0]],
                            4: [[13, 45], [15, 5]],
                            5: [[15, 20], [16, 40]],
                            6: [[16, 55], [18, 15]],
                            7: [[18, 30], [19, 50]]
                        };

                        return {
                            "num_les": num,
                            "time_les": fixedTimes[num] || time_lesson, // Assigning time for specific lesson
                            "classroom": classrooms[index] || null // Classroom assigned by index
                        };
                    });

                    data[scheduleKey].push({
                        [day_week]: [date].concat(lessons_info)
                    });
                });
            }

            data.name = get_name_instructor();
            parse_week("#week-1", "schedule_1th_week");
            parse_week("#week-2", "schedule_2nd_week");

            return data;
        }

        return parse_date();

    }, tg_PersonalID)

    await browser.close();

    return array_date;
});


let parse_officer_homutov = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({ headless: false }); // Открытие в видимом режиме для отладки
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); // Переход на страницу сотрудников

    await page.click('a[href="/people/488332"]'); // Переход на страницу конкретного сотрудника

    await page.click('.page__sub-menu-header__title'); // Раскрытие меню информации

    await page.click('a[href="/people/488332/timetable"]'); // Переход в раздел расписания

    const array_date = await page.evaluate((tg_PersonalID) => {

        function get_name_instructor() {
            return document.querySelector(".page-header-name__title").innerText;
        }

        function get_num_lessons(element, week) {
            let num_lessons = [];
            const lesson_elements = element.querySelectorAll(`#${week} .mb-1`); // Ищем все элементы с этим классом
            lesson_elements.forEach(lesson => {
                const text = lesson.textContent.trim();
                const match = text.match(/^\d+/); // Ищем первое число (номер занятия)
                if (match) {
                    num_lessons.push(Number(match[0])); // Добавляем номер занятия
                }
            });
            return num_lessons;
        }

        function get_time_lesson(element, week) {
            let time_lesson = [];
            const time_elements = element.querySelectorAll(`#${week} div.mb-1[style*="font-size: 1.2rem"]`);
            const text = element.textContent.trim(); // Получаем текст
            const matches = text.match(/(\d{2}):(\d{2}) — (\d{2}):(\d{2})/);
            if (matches) {
                // Преобразуем в формат [[11,30],[13,00]] и добавляем ведущие нули
                time_lesson = [
                    [Number(matches[1].padStart(2, '0')), Number(matches[2].padStart(2, '0'))],
                    [Number(matches[3].padStart(2, '0')), Number(matches[4].padStart(2, '0'))]
                ];
            }
            return time_lesson;
        }

        function get_classrooms(element, week) {
            let classrooms = [];
            const classroom_elements = element.querySelectorAll(`#${week} .mb-2`); // Находим все элементы с этим классом
            classroom_elements.forEach(classroom => {
                const text = classroom.textContent.trim();
                const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                if (match) {
                    classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории
                }
            });
            return classrooms;
        }

        function parse_schedule(week) {
            let schedule = [];
            let each_day_week = document.querySelectorAll(`#${week} .show`);

            each_day_week.forEach(element => {
                const day_week = element.querySelector(`#${week} .info-block__header-text`).childNodes[0].textContent.trim();
                const date = element.querySelector(`#${week} .info-block__header-text :first-child`).textContent.trim();

                let date_array_for_lessons = [];
                date_array_for_lessons.push(date);

                const num_lessons = get_num_lessons(element, week);
                const time_lesson = get_time_lesson(element, week);
                const classrooms = get_classrooms(element, week);

                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "time_les": time_lesson,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                schedule.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });
            return schedule;
        }

        // Основная логика
        const data = {
            tg_id: tg_PersonalID,
            name: get_name_instructor(),
            schedule_1th_week: parse_schedule('week-1'), // Расписание первой недели
            schedule_2nd_week: parse_schedule('week-2') // Расписание второй недели
        };

        return data;

    }, tg_PersonalID);

    await browser.close();

    return array_date;
});



async function writeDataToFile() {
    try {
        // Дожидаемся данных от обеих функций
        const data_shatsionok = await parse_officer_shatsionok(tg_PersonalID); 
        const data_vrublevskiy = await parse_officer_vrublevskiy(tg_PersonalID); 
        const data_homutov = await parse_officer_homutov(tg_PersonalID);

        // Создаем объект с данными
        const combinedData = {
            data_shatsionok: data_shatsionok,
            data_vrublevskiy: data_vrublevskiy,
            data_homutov: data_homutov
        };

        // Преобразуем объект в JSON и записываем в файл
        await fs.writeFile('data_base_new.json', JSON.stringify(combinedData, null, 4));
        console.log('File successfully written');
    } catch (err) {
        console.log('Error writing file:', err);
    }
}

async function printData() {
    try {
        // Дожидаемся данных от функции `parse_shatsionok`
        await writeDataToFile();
  
        // Читаем данные из файла после записи
        const data = await fs.readFile('data_base_new.json', 'utf8');

        // Парсим JSON-данные и выводим их в консоль
        console.log(JSON.stringify(JSON.parse(data), null, 2));

    } catch (err) {
        console.log('Error rading file:', err);
    }
}

printData();

console.log()
