const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { timestamps: true },
);

const projectSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    story: { type: String, default: '' },
    tools: { type: [String], default: [] },
    stack: { type: [String], default: [] },
    outcomes: {
      hoursSaved: { type: Number, default: 0 },
      featuresShipped: { type: Number, default: 0 },
      users: { type: Number, default: 0 },
    },
    difficulty: { type: Number, required: true },
    coverage: { type: Number, required: true },
    githubUrl: { type: String, default: '' },
    shippedAt: { type: String, required: true },
  },
  { timestamps: true },
);

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
const ProjectModel = mongoose.models.Project || mongoose.model('Project', projectSchema);

function mapUser(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    username: doc.username,
    email: doc.email,
    passwordHash: doc.passwordHash,
    name: doc.name,
    headline: doc.headline || '',
    location: doc.location || '',
    bio: doc.bio || '',
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

function mapProject(doc) {
  if (!doc) return null;
  return {
    id: String(doc._id),
    ownerId: String(doc.ownerId),
    title: doc.title,
    summary: doc.summary,
    story: doc.story || '',
    tools: doc.tools || [],
    stack: doc.stack || [],
    outcomes: {
      hoursSaved: doc.outcomes?.hoursSaved || 0,
      featuresShipped: doc.outcomes?.featuresShipped || 0,
      users: doc.outcomes?.users || 0,
    },
    difficulty: doc.difficulty,
    coverage: doc.coverage,
    githubUrl: doc.githubUrl || '',
    shippedAt: doc.shippedAt,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

function createMongoRepository() {
  return {
    kind: 'mongo',
    users: {
      async create(data) {
        const doc = await UserModel.create(data);
        return mapUser(doc);
      },
      async findByEmail(email) {
        const doc = await UserModel.findOne({ email: String(email || '').toLowerCase() });
        return mapUser(doc);
      },
      async findByUsername(username) {
        const doc = await UserModel.findOne({ username: String(username || '').toLowerCase() });
        return mapUser(doc);
      },
      async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await UserModel.findById(id);
        return mapUser(doc);
      },
      async count() {
        return UserModel.countDocuments();
      },
    },
    projects: {
      async create(data) {
        const doc = await ProjectModel.create({
          ...data,
          ownerId: data.ownerId,
        });
        return mapProject(doc);
      },
      async update(id, data) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await ProjectModel.findByIdAndUpdate(id, data, { new: true });
        return mapProject(doc);
      },
      async remove(id) {
        if (!mongoose.isValidObjectId(id)) return false;
        const doc = await ProjectModel.findByIdAndDelete(id);
        return Boolean(doc);
      },
      async findById(id) {
        if (!mongoose.isValidObjectId(id)) return null;
        const doc = await ProjectModel.findById(id);
        return mapProject(doc);
      },
      async list() {
        const docs = await ProjectModel.find().sort({ shippedAt: -1 });
        return docs.map(mapProject);
      },
      async findByOwner(ownerId) {
        if (!mongoose.isValidObjectId(ownerId)) return [];
        const docs = await ProjectModel.find({ ownerId }).sort({ shippedAt: -1 });
        return docs.map(mapProject);
      },
    },
  };
}

async function connectMongo(uri) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  return createMongoRepository();
}

module.exports = { connectMongo, createMongoRepository };
