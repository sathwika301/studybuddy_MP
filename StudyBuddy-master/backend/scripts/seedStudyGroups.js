const mongoose = require('mongoose');
const StudyGroup = require('../models/StudyGroup');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');

const studyGroupsData = [
  {
    name: "Advanced Mathematics Study Group",
    description: "For students tackling calculus, linear algebra, and advanced mathematical concepts. Share problems, solutions, and study tips.",
    subject: "Mathematics",
    difficulty: "advanced",
    tags: ["calculus", "algebra", "geometry", "proofs"],
    rules: [
      "Be respectful and patient with others",
      "Share solutions after attempting problems yourself",
      "Use LaTeX for mathematical expressions when possible",
      "No cheating or sharing exam answers"
    ],
    maxMembers: 30,
    isPrivate: false
  },
  {
    name: "Computer Science Fundamentals",
    description: "Master the basics of programming, algorithms, and data structures. Perfect for beginners and those refreshing core concepts.",
    subject: "Computer Science",
    difficulty: "intermediate",
    tags: ["programming", "algorithms", "data-structures", "coding"],
    rules: [
      "Share code snippets responsibly",
      "Help others understand concepts, not just give answers",
      "Discuss different programming languages and approaches",
      "Respect intellectual property and licensing"
    ],
    maxMembers: 40,
    isPrivate: false
  },
  {
    name: "Physics Study Circle",
    description: "Explore the laws of physics from classical mechanics to quantum physics. Discuss theories, experiments, and applications.",
    subject: "Physics",
    difficulty: "intermediate",
    tags: ["mechanics", "thermodynamics", "electromagnetism", "quantum"],
    rules: [
      "Cite sources when discussing theories",
      "Share interesting physics phenomena and experiments",
      "Be open to different interpretations",
      "Safety first when discussing experiments"
    ],
    maxMembers: 25,
    isPrivate: false
  },
  {
    name: "Chemistry Lab Partners",
    description: "Connect with fellow chemistry enthusiasts for lab work, reaction mechanisms, and organic chemistry discussions.",
    subject: "Chemistry",
    difficulty: "intermediate",
    tags: ["organic", "inorganic", "lab-work", "reactions"],
    rules: [
      "Follow lab safety protocols",
      "Share resources responsibly",
      "Discuss reaction mechanisms thoroughly",
      "Help with stoichiometry problems"
    ],
    maxMembers: 20,
    isPrivate: false
  },
  {
    name: "Biology Study Network",
    description: "From molecular biology to ecology, this group covers all aspects of biological sciences and research.",
    subject: "Biology",
    difficulty: "all-levels",
    tags: ["molecular-biology", "ecology", "genetics", "physiology"],
    rules: [
      "Share scientific articles and papers",
      "Discuss current research developments",
      "Be respectful of different scientific viewpoints",
      "Encourage evidence-based discussions"
    ],
    maxMembers: 35,
    isPrivate: false
  },
  {
    name: "English Literature Discussion",
    description: "Analyze classic and contemporary literature, discuss themes, symbolism, and writing techniques.",
    subject: "English Literature",
    difficulty: "intermediate",
    tags: ["literature", "analysis", "writing", "poetry"],
    rules: [
      "Spoiler warnings for recent publications",
      "Respect diverse interpretations",
      "Share book recommendations",
      "Encourage constructive criticism"
    ],
    maxMembers: 30,
    isPrivate: false
  },
  {
    name: "History Scholars Circle",
    description: "Explore world history, civilizations, and historical events. Share primary sources and discuss historiography.",
    subject: "History",
    difficulty: "all-levels",
    tags: ["world-history", "archaeology", "politics", "culture"],
    rules: [
      "Cite reliable sources",
      "Be respectful of different historical perspectives",
      "Share primary source documents",
      "Encourage critical thinking about history"
    ],
    maxMembers: 40,
    isPrivate: false
  },
  {
    name: "Economics & Finance Study Group",
    description: "Discuss macroeconomic theory, microeconomics, finance principles, and real-world economic applications.",
    subject: "Economics",
    difficulty: "advanced",
    tags: ["macroeconomics", "finance", "markets", "policy"],
    rules: [
      "Share economic data and trends",
      "Discuss theoretical concepts with real-world examples",
      "Be open to different economic schools of thought",
      "Respect diverse political viewpoints"
    ],
    maxMembers: 25,
    isPrivate: false
  },
  {
    name: "Psychology Research Group",
    description: "Explore human behavior, cognitive processes, and psychological research methods and findings.",
    subject: "Psychology",
    difficulty: "intermediate",
    tags: ["behavior", "cognition", "research", "mental-health"],
    rules: [
      "Share peer-reviewed research",
      "Be sensitive when discussing mental health topics",
      "Encourage evidence-based discussions",
      "Respect participant confidentiality"
    ],
    maxMembers: 30,
    isPrivate: false
  },
  {
    name: "Art & Design Creative Collective",
    description: "Share artistic techniques, discuss design principles, and collaborate on creative projects across various mediums.",
    subject: "Art & Design",
    difficulty: "all-levels",
    tags: ["drawing", "painting", "digital-art", "design"],
    rules: [
      "Share work-in-progress and final pieces",
      "Give constructive feedback",
      "Respect copyright and intellectual property",
      "Be supportive of all skill levels"
    ],
    maxMembers: 35,
    isPrivate: false
  }
];

async function seedStudyGroups() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/studybuddy-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Create a sample admin user if none exists
    let sampleUser = await User.findOne();
    if (!sampleUser) {
      console.log('No users found. Creating a sample admin user...');
      sampleUser = new User({
        name: 'StudyBuddy Admin',
        email: 'admin@studybuddy.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password123
        profileImage: '/default-avatar.png'
      });
      await sampleUser.save();
      console.log('Sample admin user created');
    }

    console.log('Creating study groups...');

    for (const groupData of studyGroupsData) {
      const group = new StudyGroup({
        ...groupData,
        createdBy: sampleUser._id,
        members: [{
          user: sampleUser._id,
          role: 'admin'
        }]
      });

      await group.save();
      console.log(`Created group: ${group.name}`);
    }

    console.log('All study groups created successfully!');

    // Optional: Add some sample messages to groups
    const groups = await StudyGroup.find();
    for (const group of groups.slice(0, 3)) { // Add messages to first 3 groups
      const sampleMessage = new GroupMessage({
        groupId: group._id,
        sender: sampleUser._id,
        message: `Welcome to ${group.name}! This is a great place to discuss ${group.subject.toLowerCase()} topics.`,
        messageType: 'announcement'
      });
      await sampleMessage.save();
      console.log(`Added welcome message to ${group.name}`);
    }

  } catch (error) {
    console.error('Error seeding study groups:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedStudyGroups();
