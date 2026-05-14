const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [2, 'Project name must be at least 2 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Admin', 'Member'],
      default: 'Member'
    }
  }],
  color: {
    type: String,
    default: '#6366f1'
  }
}, { timestamps: true });

// Ensure admin is always in members list
projectSchema.pre('save', function(next) {
  const adminExists = this.members.some(
    m => m.user.toString() === this.admin.toString()
  );
  if (!adminExists) {
    this.members.unshift({ user: this.admin, role: 'Admin' });
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
