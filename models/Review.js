const supabase = require('../config/supabase');

class Review {
  static async find() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async create(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: reviewData.userId,
        username: reviewData.username,
        display_name: reviewData.displayName,
        rating: reviewData.rating,
        comment: reviewData.comment
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Review;

