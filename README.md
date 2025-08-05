# Digital Daily Journal

A comprehensive digital journaling application with built-in analytics for personal reflection and growth tracking. This tool helps users maintain a daily journaling habit while providing insights into mood trends, patterns, and personal development.

## Features

### 📝 **Dynamic Daily Questions**
- **Free Text Questions**: Deep reflection prompts for thoughtful writing
- **Deterministic Questions**: Trackable metrics (mood scales, yes/no, numbers)
- **Non-Deterministic Questions**: Multiple choice selections for patterns
- **Smart Question Rotation**: Priority-based system ensures variety without overwhelming

### 📊 **Comprehensive Analytics**
- **Mood Tracking**: Visualize mood trends over time with interactive charts
- **Sentiment Analysis**: Automated analysis of journal text for emotional insights
- **Sleep & Health Correlations**: Understand how sleep and exercise impact your mood
- **Keyword Extraction**: Discover recurring themes in your writing
- **Streak Tracking**: Monitor journaling consistency and completion rates
- **Pattern Recognition**: Identify productive days and emotional patterns

### 🎨 **Beautiful User Experience**
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Intuitive Navigation**: Easy-to-use sidebar and dashboard
- **Progress Tracking**: Visual indicators for completion and streaks
- **Date-based Filtering**: Flexible date ranges for analytics
- **Search & Filter**: Find specific entries quickly

### 🔧 **Technical Excellence**
- **Full-Stack JavaScript**: React frontend with Node.js/Express backend
- **MongoDB Database**: Flexible document storage for journal entries
- **Real-time Analytics**: Advanced data processing with sentiment analysis
- **API-First Design**: RESTful endpoints for all functionality
- **Responsive Design**: Works perfectly on desktop and mobile

## Sample Daily Questions

### Free Text (Reflection)
- "What are three things you're grateful for today? Describe why each one matters to you."
- "What was the biggest challenge you faced today? How did you handle it, and what did you learn?"
- "Reflect on your day. What moment stood out to you the most and why?"

### Deterministic (Metrics)
- Mood scale (1-10)
- Energy level (1-10)
- Sleep hours and quality
- Exercise and meditation tracking
- Productivity and stress levels

### Non-Deterministic (Multiple Choice)
- Primary emotion selection
- Activity priorities
- Coping strategies used
- Learning sources
- Communication style

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd digital-daily-journal
npm run install:all
```

2. **Configure Environment**
```bash
# In server/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/digital-journal

# In client/.env (optional)
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start Development**
```bash
# Start both frontend and backend
npm run dev

# Or start separately
npm run server:dev  # Backend only
npm run client      # Frontend only
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Project Structure

```
digital-daily-journal/
├── server/                 # Backend API
│   ├── config/            # Daily questions configuration
│   ├── models/            # MongoDB schemas
│   ├── services/          # Analytics and business logic
│   ├── index.js           # Main server file
│   └── package.json
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API communication
│   │   └── App.js         # Main app component
│   ├── public/
│   └── package.json
└── package.json           # Root package for scripts
```

## API Endpoints

### Questions
- `GET /api/questions/:date?` - Get daily questions for date
- Question rotation based on priority system

### Journal Entries
- `POST /api/entries` - Create/update journal entry
- `GET /api/entries/:userId` - Get user's entries (with date filtering)
- `GET /api/entries/:userId/:date` - Get specific entry
- `DELETE /api/entries/:userId/:date` - Delete entry

### Analytics
- `GET /api/analytics/:userId` - Get comprehensive analytics
- Supports date range filtering
- Returns mood trends, sentiment analysis, patterns, insights

## Analytics Features

### Mood Analysis
- Daily mood tracking with trend analysis
- Mood distribution visualization
- Correlation with sleep and exercise

### Sentiment Processing
- Automatic sentiment analysis of free text
- Positive/negative word identification
- Emotional pattern recognition

### Pattern Recognition
- Most productive days of the week
- Sleep quality correlations
- Exercise impact on mood
- Common emotional states

### Insights Generation
- Personalized insights based on data
- Achievement recognition
- Areas needing attention
- Confidence scoring

## Data Privacy

- **Local Storage**: User ID generated and stored locally
- **No Authentication**: Simplified for demo/personal use
- **Data Isolation**: Each user's data is separate
- **Export Ready**: Easy to add data export features

## Customization

### Adding New Questions
Edit `server/config/dailyQuestions.js`:
```javascript
// Add to appropriate category
freeText: [
  {
    id: 'ft_custom',
    text: 'Your custom question?',
    category: 'reflection',
    priority: 1
  }
]
```

### Extending Analytics
Modify `server/services/analyticsService.js` to add:
- New correlation analysis
- Custom insights
- Additional visualizations

### UI Customization
- Tailwind CSS classes in components
- Color scheme in `client/tailwind.config.js`
- Custom styles in `client/src/index.css`

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```bash
# Production settings
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
PORT=your-port
```

### Hosting Options
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean
- **Database**: MongoDB Atlas, mLab

## Future Enhancements

### Planned Features
- [ ] User authentication and profiles
- [ ] Data export (PDF, CSV)
- [ ] Mobile app version
- [ ] Advanced AI insights
- [ ] Goal setting and tracking
- [ ] Social sharing features
- [ ] Backup and sync

### Technical Improvements
- [ ] Offline support
- [ ] Real-time notifications
- [ ] Advanced search
- [ ] Data visualization improvements
- [ ] Performance optimizations

## Contributing

This is a personal/demo project, but suggestions and improvements are welcome!

### Development Guidelines
1. Follow existing code style
2. Add comments for complex logic
3. Test new features thoroughly
4. Update documentation

## License

This project is open source and available under the MIT License.

## Success Metrics

The application focuses on:
- **User Experience**: Intuitive interface, minimal friction
- **Analytics Accuracy**: Reliable insights based on solid data
- **Engagement**: Features that encourage daily use
- **Personal Growth**: Tools for meaningful self-reflection

## Support

For questions or issues:
1. Check existing documentation
2. Review API endpoints and data structure
3. Examine sample data and responses
4. Create detailed issue reports with examples

---

**Built with ❤️ for better self-reflection and personal growth**