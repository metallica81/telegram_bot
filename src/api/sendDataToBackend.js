import { getDataBase } from "../dataBase/getDataBase.js";
import axios from "axios";

const data = getDataBase();

async function sendDataToBackend(data) {
    try {
        const response = await axios.post("http://localhost:3000/api/schedule", data, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log("Данные успешно отправлены", response.data);
    } catch (error) {
        console.error("Ошибка при отправке данных", error);
    }
}

sendDataToBackend(data);
