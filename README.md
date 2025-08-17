# TPT Seller Hub - All-in-One SEO & Analytics Platform

A comprehensive optimization tool for Teachers Pay Teachers sellers featuring SEO analysis, rank tracking, social content generation, and sales analytics. Built with vanilla JavaScript, Vite, and Supabase.

## 🚀 Features

- **Authentication**: Magic-link email authentication with Supabase
- **Product Management**: CSV import and manual product entry
- **SEO Optimization**: AI-powered title and description rewriting with scoring
- **Rank Tracking**: Keyword position monitoring with SerpAPI integration
- **Social Content**: Auto-generate Pinterest pins, Instagram captions, and Facebook posts
- **Analytics**: Sales data import and performance visualization
- **Demo Mode**: Full functionality without API keys for testing

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, Vite, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **APIs**: OpenAI GPT-4o, SerpAPI, Chart.js
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Static hosting with Supabase Edge Functions

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- (Optional) OpenAI API key for AI features
- (Optional) SerpAPI key for rank tracking

## 🔧 Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Once created, go to Settings → API
4. Copy your project URL and anon key
5. Go to Settings → Database
6. Copy the connection string from "Connection pooler" → "Transaction mode"
7. Replace `[YOUR-PASSWORD]` with your database password

### 2. Clone and Install

```bash
git clone <repository-url>
cd tpt-seller-hub
npm install
