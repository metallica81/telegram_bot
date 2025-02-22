export function changeStack(stack, commonKey, redirectionKey) {
    //console.log(nextInstructorKey)
    // Если нажали перенаправить кому-либо
    const key = redirectionKey ? redirectionKey : commonKey;

    //Перемещаем выбранного инструктора в конец очереди
    const index = stack.indexOf(key);
    if (index !== -1) {
    //console.log(`Перемещаем ${instructorKey} в конец очереди`);
    stack.splice(index, 1); // Удаляем из текущего места
    stack.push(key); // Добавляем в конец
    console.log('Обновленная очередь:', [...stack]); // Логируем обновленный порядок
    } 
}