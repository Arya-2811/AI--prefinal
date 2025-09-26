import { userService } from '../services/userService';
import { questionService } from '../services/questionService';

async function initializeUserProfiles() {
  try {
    console.log('🔄 Initializing user profiles for existing users...');
    
    // Get all users
    const users = await userService.getAllUsers();
    
    for (const user of users) {
      // Check if profile already exists
      const existingProfile = await questionService.getUserProfile(user.id);
      
      if (!existingProfile) {
        // Create user profile
        await questionService.createUserProfile({
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          stats: {
            totalSolved: 0,
            easyCount: 0,
            mediumCount: 0,
            hardCount: 0,
            totalTimeSpent: 0,
            streak: 0,
            lastActiveDate: new Date()
          },
          preferences: {
            preferredLanguage: 'javascript',
            theme: 'light',
            notifications: true
          }
        });
        
        console.log(`✅ Created profile for user: ${user.name} (${user.email})`);
      } else {
        console.log(`⏭️  Profile already exists for: ${user.name} (${user.email})`);
      }
    }
    
    console.log('🎉 User profile initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing user profiles:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeUserProfiles()
    .then(() => {
      console.log('✨ Initialization completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export { initializeUserProfiles };
