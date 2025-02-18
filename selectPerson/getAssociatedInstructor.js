// Определяем, кто закреплён за текущей аудиторией
export function getAssociatedInstructor(num_classroom, instructorClassroomsMap) {
    let associatedInstructor = null;
    for (const [instructorKey, classrooms] of Object.entries(instructorClassroomsMap)) {
        if (classrooms.includes(+num_classroom)) {
            return associatedInstructor = instructorKey;
        }
    }
     
}

// console.log(associatedInstructor(3401, instructorClassroomsMap));
