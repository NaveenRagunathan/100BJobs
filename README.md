# 100BJobs - AI-Powered Candidate Matching

A sophisticated full-stack application that uses artificial intelligence to screen, rank, and match job candidates based on natural language requirements. Built with Next.js 14 and powered by Mistral AI.

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-38B2AC)
![Mistral AI](https://img.shields.io/badge/Mistral_AI-1.10.0-orange)

## 🚀 Features

### Core Functionality
- **Intelligent File Upload**: Support for JSON candidate data files up to 50MB
- **Natural Language Queries**: Describe job requirements in plain English
- **Multi-Stage Processing**: Advanced filtering, scoring, and deep analysis pipeline
- **Real-Time Progress**: Live streaming of processing stages with detailed feedback
- **Export Capabilities**: Download results as CSV files for further analysis

### AI-Powered Analysis
- **Rule-Based Filtering**: Automatic candidate screening based on must-have skills, experience, and salary requirements
- **Intelligent Scoring**: AI-powered candidate ranking using Mistral's advanced language models
- **Deep Analysis**: Comprehensive candidate evaluation with detailed reasoning
- **Multi-Role Support**: Process multiple job roles in a single session

### User Experience
- **Intuitive Interface**: Clean, modern UI built with Tailwind CSS
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Session Management**: Persistent sessions for complex multi-role hiring processes

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework

### Backend & AI
- **Next.js API Routes** - Server-side processing and API endpoints
- **Mistral AI** - Advanced language model for candidate analysis
- **Hash-wasm** - High-performance hashing for file processing
- **PapaParse** - CSV parsing and generation

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS post-processing
- **TypeScript Compiler** - Type checking and compilation

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js 18+** installed on your system
- **npm** or **yarn** package manager
- **Mistral AI API Key** (get from [Mistral Console](https://console.mistral.ai/))

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/NaveenRagunathan/100BJobs.git
cd 100BJobs
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Mistral AI API key:
```env
MISTRAL_API_KEY=your_api_key_here
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
CACHE_TTL_MINUTES=60
NODE_ENV=development
```

### 4. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

## 🎯 Usage Guide

### Basic Workflow

1. **Upload Candidate Data**
   - Click "Choose File" and select your JSON candidate file
   - Supports files up to 50MB with automatic field detection
   - Wait for upload completion and validation

2. **Define Job Requirements**
   - Describe the role in natural language
   - Examples:
     - "I need 2 senior frontend engineers with React experience"
     - "Looking for a backend engineer proficient in Node.js and 1 UX designer"
     - "Find 3 full-stack developers with 3+ years experience"

3. **Monitor Processing**
   - Watch real-time progress as the system processes candidates
   - View detailed logs and processing stages
   - Track filtering, scoring, and deep analysis phases

4. **Review Results**
   - Examine ranked candidates with match percentages
   - View detailed strengths, concerns, and reasoning
   - Export results as CSV for further analysis

### Advanced Features

#### Multi-Role Processing
The system supports processing multiple job roles in sequence:
- Upload once, query multiple times
- Automatic candidate pool management
- Prevents duplicate selections across roles

#### Custom Candidate Fields
The system automatically detects and processes various candidate data formats:
- Personal information (name, email, location)
- Professional details (experience, skills, current role)
- Education and certifications
- Salary expectations and availability

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MISTRAL_API_KEY` | Your Mistral AI API key | - | ✅ |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum upload file size in bytes | 52428800 | ❌ |
| `CACHE_TTL_MINUTES` | Cache expiration time | 60 | ❌ |
| `NODE_ENV` | Node environment | development | ❌ |

### File Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── export/        # CSV export endpoint
│   │   ├── process/       # Candidate processing
│   │   └── upload/        # File upload handling
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── CandidateCard.tsx  # Individual candidate display
│   ├── FileUpload.tsx     # File upload component
│   ├── ProgressStream.tsx # Real-time progress display
│   ├── QueryInput.tsx     # Job requirement input
│   └── ResultsDisplay.tsx # Results presentation
├── lib/                   # Core business logic
│   ├── filters/          # Candidate filtering logic
│   ├── llm/              # AI/LLM integration
│   ├── parsers/          # Data parsing utilities
│   └── rankers/          # Candidate ranking algorithms
└── types/                # TypeScript type definitions
```

## 🚀 API Endpoints

### POST `/api/upload`
Upload and process candidate data files.

**Request:**
- `Content-Type: multipart/form-data`
- `file`: JSON file containing candidate data

**Response:**
```json
{
  "sessionId": "unique-session-identifier",
  "stats": {
    "totalCandidates": 150,
    "validCandidates": 145,
    "processingErrors": 5
  }
}
```

### POST `/api/process`
Process candidate matching with job requirements.

**Request:**
```json
{
  "sessionId": "unique-session-identifier",
  "query": "Senior React developer with 3+ years experience"
}
```

**Response:** Streamed processing updates with final results.

### POST `/api/export`
Export results to CSV format.

**Request:**
```json
{
  "results": [/* FinalSelection array */]
}
```

**Response:** CSV file download.

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Project Structure Deep Dive

#### Processing Pipeline
1. **Upload & Validation**: File parsing and candidate data normalization
2. **Rule-Based Filtering**: Apply must-have requirements and basic filters
3. **Batch Processing**: Efficient candidate scoring using Mistral AI
4. **Deep Analysis**: Comprehensive candidate evaluation and ranking
5. **Result Presentation**: Formatted results with detailed insights

#### AI Integration
- **Mistral Medium Model**: Used for candidate analysis and scoring
- **Custom Prompt Engineering**: Optimized prompts for candidate evaluation
- **Batch Processing**: Efficient handling of large candidate datasets
- **Error Recovery**: Robust error handling for API failures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and not licensed for public use.

## 🆘 Support

For support and questions, please contact the development team.

## 🔄 Updates

This application uses modern web technologies and AI services. Regular updates may be required to maintain compatibility with:
- Next.js framework updates
- Mistral AI API changes
- Security patches and dependencies

---

**Built with ❤️ for efficient, AI-powered candidate matching**
