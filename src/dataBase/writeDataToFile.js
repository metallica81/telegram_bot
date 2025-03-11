import { tgPersonalID } from './tryParse.js';
import { parseData } from './parseData.js';     // URL и href для пагинации
import { parseStaff } from './tryParse.js';
import { allData } from './getDataBase.js';
import fs from 'fs/promises';

export async function writeDataToFile() {
    try {
        // Дожидаемся данных от функций
        const dataShatsionok = await parseStaff(tgPersonalID, 
            parseData.staffMenu, 
            parseData.shatsionok.instructorPage,
            parseData.shatsionok.infoMenu,
            parseData.shatsionok.schedulePart,
            parseData.shatsionok.instructorKey
        ); 
        const dataVrublevskiy = await parseStaff(tgPersonalID, 
            parseData.staffMenu, 
            parseData.vrublevskiy.instructorPage,
            parseData.vrublevskiy.infoMenu,
            parseData.vrublevskiy.schedulePart,
            parseData.vrublevskiy.instructorKey
        ); 
        const dataHomutov = await parseStaff(tgPersonalID, 
            parseData.staffMenu, 
            parseData.homutov.instructorPage,
            parseData.homutov.infoMenu,
            parseData.homutov.schedulePart,
            parseData.homutov.instructorKey
        );

        // Создаем объект с данными
        const combinedData = {
            countCommonOrders: allData.countCommonOrders,
            countRedirectedOrders: allData.countRedirectedOrders,
            countOfEachClickRedirect: allData.countOfEachClickRedirect,
            instructorStack: allData.instructorStack,
            osipovSchedule: allData.osipovSchedule,
            egorovSchedule: allData.egorovSchedule,
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