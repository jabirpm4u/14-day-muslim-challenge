# 14-Day Proud Muslim Challenge

A beautiful, interactive web application to help Muslims strengthen their Islamic identity through a structured 14-day challenge program.

## 🌙 Features

- **Google Authentication**: Simple and secure sign-in
- **Role-based Access**: Separate dashboards for admins and participants
- **Real-time Updates**: Live progress tracking using Firestore
- **Responsive Design**: Works perfectly on mobile and desktop
- **Islamic Theme**: Beautiful UI with Islamic-inspired colors and typography
- **Progress Visualization**: Charts and progress bars to track completion
- **Admin Dashboard**: Comprehensive participant management and analytics

## 🚀 Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with Islamic-themed custom colors
- **Backend**: Firebase (Authentication + Firestore)
- **Charts**: Recharts for progress visualization
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📱 Challenge Tasks

The 14-day challenge includes rotating tasks focused on:

1. **Greetings**: Saying "As-salamu alaykum" to fellow Muslims
2. **Prayer**: Attending Fajr prayer in congregation
3. **Knowledge Sharing**: Sharing Hadith, Quran verses, or Islamic talks
4. **Islamic Phrases**: Using blessed phrases in daily conversation
5. **Islamic Identity**: Maintaining visible signs of Islamic identity

## 🎨 Design Features

- **Islamic Color Palette**: Green tones representing peace and growth
- **Arabic Typography**: Beautiful Arabic fonts for Quranic verses
- **Responsive Layout**: Mobile-first design approach
- **Subtle Animations**: Smooth transitions and loading states
- **Islamic Patterns**: Background patterns inspired by Islamic art

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Firebase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd 14-day-proud-muslim-challenge
npm install
```

### 2. Firebase Setup
Follow the detailed instructions in `FIREBASE_SETUP.md`

### 3. Configure Firebase
Update `src/firebase/config.ts` with your Firebase project credentials

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📊 Admin Features

- **Participant Overview**: View all registered participants
- **Progress Tracking**: Monitor individual and collective progress
- **Visual Analytics**: Pie charts and bar graphs for insights
- **Reset Functionality**: Reset participant progress if needed
- **Real-time Updates**: Live updates when participants complete tasks

## 👥 User Roles

### Participant
- View 14-day challenge tasks
- Mark tasks as completed
- Track personal progress
- View motivational messages and Quranic verses

### Admin
- View all participants and their progress
- Access analytics dashboard
- Reset participant progress
- Monitor challenge completion rates

## 🔐 Security Features

- **Google OAuth**: Secure authentication
- **Role-based Access**: Proper user permissions
- **Firestore Security Rules**: Database-level security
- **Protected Routes**: Client-side route protection

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Friendly**: Perfect layout for tablets
- **Desktop Experience**: Full-featured desktop interface
- **Touch Interactions**: Mobile-friendly touch targets

## 🌟 Islamic Elements

- **Quranic Verses**: Inspirational verses throughout the app
- **Arabic Calligraphy**: Beautiful Arabic text styling
- **Islamic Greetings**: Proper Islamic salutations
- **Islamic Colors**: Green palette representing growth and peace
- **Halal Design**: Respectful and modest visual approach

## 🚀 Deployment Options

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Other Hosting Options
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤲 Islamic Disclaimer

This application is created with the intention of helping Muslims strengthen their faith and practice. We ask Allah (SWT) to accept our efforts and make this beneficial for the Muslim community. 

*Barakallahu feekum* (May Allah bless you all)

## 📞 Support

If you encounter any issues or have suggestions, please create an issue in the repository or contact the development team.

---

*"And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose."* - Quran 65:3

**As-salāmu ʿalaykum wa-raḥmatu -llāhi wa-barakātuh**