import { isInstructorBusy } from "../selectPerson/isInstructorBusy.js";
import { getTime } from "../selectPerson/getTime.js";

export function getRestPersons(instructor_name, instructor_stack) {
    const { time24, currentFormattedDate } = getTime();
    if (instructor_stack && instructor_name.length !== 0) {
        try {
            let restNames = instructor_stack.filter(
                (element) =>
                    element != instructor_name &&
                    !isInstructorBusy(element, currentFormattedDate, time24)
            );
            return restNames;
        } catch (error) {
            console.error(error.message);
        }
    }
}