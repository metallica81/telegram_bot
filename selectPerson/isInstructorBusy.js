// Функция для проверки занятости преподавателя
export function isInstructorBusy(instructor, currentFormattedDate, time24) {
    for (const scheduleKey of ['schedule_1th_week', 'schedule_2nd_week']) {
        const schedule = instructor[scheduleKey];
        if (!schedule) continue; // у препода нет пар на это неделе

        for (const day of schedule) {
            const dayOfWeek = Object.keys(day)[0];
            const lessonsArray = day[dayOfWeek];

            if (Array.isArray(lessonsArray) && lessonsArray[0] === currentFormattedDate) {
                for (let i = 1; i < lessonsArray.length; i++) {
                    const lesson = lessonsArray[i];
                    if (!lesson.lessonTime || !Array.isArray(lesson.lessonTime)) continue;

                    const [startTime, endTime] = lesson.lessonTime;
                    const isDuringLesson = (
                        (time24[0] > startTime[0] || (time24[0] === startTime[0] && time24[1] >= startTime[1])) &&
                        (time24[0] < endTime[0] || (time24[0] === endTime[0] && time24[1] <= endTime[1]))
                    );

                    if (isDuringLesson) {
                        return true; // Преподаватель занят
                    }
                }
            }
        }
    }
    return false; // Преподаватель свободен
}