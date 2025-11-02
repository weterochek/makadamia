const supabase = require('../config/supabase');

class Product {
  static async find(query = {}) {
    let supabaseQuery = supabase.from('products').select('*');
    
    Object.keys(query).forEach(key => {
      supabaseQuery = supabaseQuery.eq(key, query[key]);
    });
    
    const { data, error } = await supabaseQuery;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async create(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Product;
