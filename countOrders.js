import { setDataBase } from './dataBase/getDataBase.js';

export function countOrders(instructorKey, data) {
    data[instructorKey].order_count++;
}