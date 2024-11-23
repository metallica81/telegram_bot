
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
// const data_base_info = require("./data_base_new");

const tg_PersonalID = 885326963;

let parse_officer_shatsionok = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({headless: false}); //headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); //переходим в раздел сотрудников отдела инф ИЭФ

    await page.click('a[href="/people/27900"]'); //переходим на стринцу Павла Васильевича

    //здесь же оставлю на Врублёвского href="/people/405" на будущее
    //Хомутов href="/people/488332"

    await page.click('.page__sub-menu-header__title'); //раскрываем меню информации

    await page.click('a[href="/people/27900/timetable"]'); //переходим в расписание

    let array_date = await page.evaluate((tg_PersonalID) => {
        
        function parse_date() {
            
            const data = {
                name: "Шационок Павел Васильевич",
                tg_id: tg_PersonalID,
            };
            

            

            // Для второй недели
            let each_day_week_2 = document.querySelectorAll("#week-2 .show");

            each_day_week_2.forEach(element => {
                let day_week = element.querySelector("#week-2 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-2 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-2 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-2 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_2nd_week = data.schedule_2nd_week || []; // Добавляем расписание для второй недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание второй недели
                data.schedule_2nd_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            // Для первой недели
            let each_day_week_1 = document.querySelectorAll("#week-1 .show");

            each_day_week_1.forEach(element => {
                let day_week = element.querySelector("#week-1 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-1 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-1 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-1 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_1th_week = data.schedule_1th_week || []; // Добавляем расписание для первой недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание первой недели
                data.schedule_1th_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            return data;
        }
        
        return parse_date();

    }, tg_PersonalID)
    
    await browser.close();

    return array_date;
});


let parse_officer_vrublevskiy = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({headless: false}); //headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); //переходим в раздел сотрудников отдела инф ИЭФ

    await page.click('a[href="/people/405"]'); //переходим на стринцу Павла Васильевича
    //Хомутов href="/people/488332"

    await page.click('.page__sub-menu-header__title'); //раскрываем меню информации

    await page.click('a[href="/people/405/timetable"]'); //переходим в расписание

    let array_date = await page.evaluate((tg_PersonalID) => {
        
        function parse_date() {
            
            const data = {
                name: "Врублевский Константин Эдуардович",
                tg_id: tg_PersonalID,
                
            };
            

            

            // Для второй недели
            let each_day_week_2 = document.querySelectorAll("#week-2 .show");

            each_day_week_2.forEach(element => {
                let day_week = element.querySelector("#week-2 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-2 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-2 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-2 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_2nd_week = data.schedule_2nd_week || []; // Добавляем расписание для второй недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание второй недели
                data.schedule_2nd_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            // Для первой недели
            let each_day_week_1 = document.querySelectorAll("#week-1 .show");

            each_day_week_1.forEach(element => {
                let day_week = element.querySelector("#week-1 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-1 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-1 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-1 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_1th_week = data.schedule_1th_week || []; // Добавляем расписание для первой недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание первой недели
                data.schedule_1th_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            return data;
        }
        
        return parse_date();

    }, tg_PersonalID)
    
    await browser.close();

    return array_date;
});

let parse_officer_homutov = (async (tg_PersonalID) => {

    const browser = await puppeteer.launch({headless: false}); //headless - открытие в фоновом режиме
    const page = await browser.newPage();
    await page.goto('https://www.miit.ru/depts/21123/people'); //переходим в раздел сотрудников отдела инф ИЭФ

    await page.click('a[href="/people/488332"]'); //переходим на стринцу Андрей Сергеевич

    await page.click('.page__sub-menu-header__title'); //раскрываем меню информации

    await page.click('a[href="/people/488332/timetable"]'); //переходим в расписание

    let array_date = await page.evaluate((tg_PersonalID) => {
        
        function parse_date() {
            
            const data = {
                name: "Хомутов Андрей Сергеевич",
                tg_id: tg_PersonalID,
            };
            

            

            // Для второй недели
            let each_day_week_2 = document.querySelectorAll("#week-2 .show");

            each_day_week_2.forEach(element => {
                let day_week = element.querySelector("#week-2 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-2 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-2 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-2 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_2nd_week = data.schedule_2nd_week || []; // Добавляем расписание для второй недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание второй недели
                data.schedule_2nd_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            // Для первой недели
            let each_day_week_1 = document.querySelectorAll("#week-1 .show");

            each_day_week_1.forEach(element => {
                let day_week = element.querySelector("#week-1 .info-block__header-text").childNodes[0].textContent.trim();
                let date = element.querySelector("#week-1 .info-block__header-text :first-child").textContent.trim();

                // Функция для получения всех номеров занятий (если их несколько)
                function get_num_lessons() {
                    let num_lessons = [];
                    let lesson_elements = element.querySelectorAll("#week-1 .mb-1"); // Находим все элементы с этим классом

                    lesson_elements.forEach(lesson => {
                        const text = lesson.textContent.trim();
                        const match = text.match(/^\d+/); // Ищем первое число
                        if (match) {
                            num_lessons.push(Number(match[0])); // Добавляем номер занятия в массив
                        }
                    });

                    return num_lessons; // Массив всех номеров занятий
                };

                // Функция для получения всех номеров аудиторий (если их несколько)
                function get_classrooms() {
                    let classrooms = [];
                    let classroom_elements = element.querySelectorAll("#week-1 .mb-2"); // Находим все элементы с этим классом

                    classroom_elements.forEach(classroom => {
                        const text = classroom.textContent.trim();
                        const match = text.match(/\d+$/); // Ищем последнее число (номер аудитории)
                        if (match) {
                            classrooms.push(parseInt(match[0], 10)); // Добавляем номер аудитории в массив
                        }
                    });

                    return classrooms; // Массив всех аудиторий
                };

                let date_array_for_lessons = [];
                data.schedule_1th_week = data.schedule_1th_week || []; // Добавляем расписание для первой недели

                // Добавляем дату в массив
                date_array_for_lessons.push(date);

                // Получаем все занятия и аудитории для этого дня
                let num_lessons = get_num_lessons();
                let classrooms = get_classrooms();

                // Если количество занятий и аудиторий совпадает, добавляем их в один объект
                let lessons_info = num_lessons.map((num, index) => {
                    return {
                        "num_les": num,
                        "classroom": classrooms[index] || null // Если аудитория отсутствует, ставим null
                    };
                });

                // Добавляем информацию о занятиях в расписание первой недели
                data.schedule_1th_week.push({ [day_week]: date_array_for_lessons.concat(lessons_info) });
            });

            return data;
        }
        
        return parse_date();

    }, tg_PersonalID)
    
    await browser.close();

    return array_date;
})


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
