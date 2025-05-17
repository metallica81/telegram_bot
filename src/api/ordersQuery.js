import axios from "axios";

export async function ordersQuery(staff_id) {
    try {
        const response = await axios.get(
            `http://localhost:3000/api/staff/${staff_id}`
        );
        return response.data;
    } catch (error) {
        console.error("Ошибка при получении заказов:", error);
        throw error;
    }
}



export async function ordersPatch(staff_id, data) {
    try {
        const response = await axios.patch(
            `http://localhost:3000/api/staff/${staff_id}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Данные успешно отправлены", response.data);
        return response.data;
    } catch (error) {
        console.error("Ошибка при отправке данных", error);
    }
}

ordersQuery(885326961)
    .then((res) => {
        
        if (!res || typeof res.order_amount === "undefined") {
            throw new Error("order_amount не найден в данных сотрудника");
        }
        
        return ordersPatch(885326961, {
            name: "Шационок",
            order_amount: res.order_amount + 1,
        });
    })
    .then((res) => console.log("Результат обновления:", JSON.stringify(res, null, 2)))
    .catch((error) => console.error("Ошибка в цепочке:", error));