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

        return response.data;
    } catch (error) {
        console.error("Ошибка при отправке данных", error);
    }
}

export async function incrementOrderAmount(staff_id) {
    try {
        const res = await ordersQuery(staff_id);
        
        if (!res || typeof res.order_amount === "undefined") {
            throw new Error("order_amount не найден в данных сотрудника");
        }
        
        return await ordersPatch(staff_id, {
            order_amount: res.order_amount + 1,
        });
    } catch (error) {
        console.error("Ошибка в цепочке:", error);
    }
}