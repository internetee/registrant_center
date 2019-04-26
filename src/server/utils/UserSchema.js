import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  ident: {
    type: String,
    required: true,
    unique: true
  },
  companies: {
    type: Array,
  },
  created_at: Date,
  updated_at: Date,
  visited_at: Date
});

const User = mongoose.model('users', UserSchema);

export default User;