import axios from 'axios';

export async function ordersQuery() {
  try {
    const response = await axios.get('http://localhost:3000/api/orders');
    return response.data; 
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    throw error;
  }
}