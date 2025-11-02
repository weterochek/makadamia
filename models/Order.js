const supabase = require('../config/supabase');

class Order {
  static async create(orderData) {
    const { items, ...orderInfo } = orderData;
    
    // Создаем заказ
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderInfo.userId,
        delivery_time: orderInfo.deliveryTime,
        phone: orderInfo.phone,
        name: orderInfo.name,
        address: orderInfo.address,
        additional_info: orderInfo.additionalInfo,
        total_amount: orderInfo.totalAmount
      })
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Создаем элементы заказа
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
    }
    
    return order;
  }

  static async find(query = {}) {
    let supabaseQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          products(id, name, price)
        )
      `);
    
    if (query.userId) {
      supabaseQuery = supabaseQuery.eq('user_id', query.userId);
    }
    
    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          products(id, name, price)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

module.exports = Order;
