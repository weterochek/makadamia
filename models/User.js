const supabase = require('../config/supabase');

class User {
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findOne(query) {
    let supabaseQuery = supabase.from('users').select('*');
    
    Object.keys(query).forEach(key => {
      supabaseQuery = supabaseQuery.eq(key, query[key]);
    });
    
    const { data, error } = await supabaseQuery.single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateById(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = User;
