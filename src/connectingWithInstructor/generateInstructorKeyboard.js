import { getRestPersons } from "./getRestPersons.js";
import { getInstructorNameFromEn } from "../selectPerson/getEnName.js";
import { getAvailableStack } from "../selectPerson/getAvailableStack.js";
import { InlineKeyboard } from "grammy";

export function generateInstructorKeyboard(excludeKey, data) {
    const currentStack = [...getAvailableStack(data.instructorStack)];

    if (!currentStack.includes("osipovSchedule")) {
        currentStack.push("osipovSchedule");
    }
    if (!currentStack.includes("egorovSchedule")) {
        currentStack.push("egorovSchedule");
    }

    const restPersons = getRestPersons(excludeKey, currentStack);
    const keyboard = new InlineKeyboard();
    

    restPersons.forEach((person, index) => {
        if (index % 2 === 0) keyboard.row();
        const instructorName = getInstructorNameFromEn(person, data);
        keyboard.text(instructorName);
    });

    return keyboard;
}
