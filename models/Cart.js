const supabase = require('../config/supabase');

class Cart {
  static async findOne(query) {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        *,
        cart_items(
          id,
          quantity,
          products(id, name, price)
        )
      `)
      .eq('user_id', query.userId)
      .single();
    
    if (error && error.code !== 'PGRST116') return null;
    if (error) throw error;
    return data;
  }

  static async create(cartData) {
    const { data, error } = await supabase
      .from('cart')
      .insert({ user_id: cartData.userId })
      .select()
      .single();
    
    if (error) throw error;
    return { ...data, items: [] };
  }

  static async addItem(cartId, productId, quantity) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .single();
    
    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          product_id: productId,
          quantity
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
}

module.exports = Cart;
