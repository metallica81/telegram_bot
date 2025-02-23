import { setDataBase } from '../dataBase/getDataBase.js';

export function changeStack(data, commonKey, redirectionKey) {
    if (!data.instructorStack) return;

    const key = redirectionKey || commonKey;
    if (!key) return;

    const stack = data.instructorStack;
    const instructorOrders = stack.map(instructorKey => data[instructorKey]?.order_count || 0);
    
    const minOrders = Math.min(...instructorOrders);
    const maxOrders = Math.max(...instructorOrders);
    const index = stack.indexOf(key);

    if (index === -1) return;
    
    const currentOrders = data[key]?.order_count || 0;

    if (currentOrders > minOrders) {
        // Сортируем очередь по количеству заявок: меньше заявок - выше в очереди
        stack.sort((a, b) => {
            const ordersA = data[a]?.order_count || 0;
            const ordersB = data[b]?.order_count || 0;
        
            if (ordersA !== ordersB) {
                return ordersA - ordersB; // Сортируем только по количеству заявок
            }
        
            // Если заявки одинаковые, сдвигаем только key
            if (a === key) return 1;
            if (b === key) return -1;
        
            return 0; // Остальные остаются в том же порядке
        });
        
    }

    console.log('Обновленная очередь:', [...stack]);
    setDataBase(data); // Сохраняем изменения обратно в базу
}
