export const allFunctions = {
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