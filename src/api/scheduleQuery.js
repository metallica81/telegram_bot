import axios from "axios";

export async function scheduleQuery() {
    try {
        const response = await axios.get("http://localhost:3000/api/schedule");
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        throw error;
    }
}