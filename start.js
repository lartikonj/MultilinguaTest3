#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const appDir = path.join(process.cwd(), 'multilingua_app', 'Multilingua-lartikonj-patch-1');

// Check if app directory exists
if (!fs.existsSync(appDir)) {
  console.error(`Error: App directory not found at ${appDir}`);
  process.exit(1);
}

console.log('=== Multilingua Web Application Setup ===');
console.log(`Setting up application in ${appDir}`);

try {
  // Change to app directory
  process.chdir(appDir);
  
  // Update App.tsx to add new Subjects page route
  updateAppRoutes();
  
  // Create missing Subject page if needed
  createSubjectsPage();
  
  // Fix the Article page
  fixArticlePage();
  
  // Push database schema
  console.log('Pushing database schema...');
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
  } catch (error) {
    console.log('Warning: Database schema push failed, continuing anyway');
  }
  
  // Start the development server
  console.log('Starting development server...');
  const server = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.error(`Development server exited with code ${code}`);
    }
    process.exit(code || 0);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.kill('SIGTERM');
  });
  
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

// Function to update the App.tsx file to add the Subjects page route
function updateAppRoutes() {
  const appTsxPath = path.join(appDir, 'client', 'src', 'App.tsx');
  
  if (fs.existsSync(appTsxPath)) {
    let content = fs.readFileSync(appTsxPath, 'utf8');
    
    // Check if we need to import the Subjects component
    if (!content.includes('import Subjects from')) {
      content = content.replace(
        'import About from "@/pages/About";',
        'import About from "@/pages/About";\nimport Subjects from "@/pages/Subjects";'
      );
    }
    
    // Check if we need to add the Subjects route
    if (!content.includes('<Route path="/subjects"')) {
      content = content.replace(
        '<Route path="/about" component={About} />',
        '<Route path="/about" component={About} />\n      <Route path="/subjects" component={Subjects} />'
      );
    }
    
    fs.writeFileSync(appTsxPath, content);
    console.log('Updated App.tsx to include Subjects route');
  }
}

// Function to create the Subjects page if it doesn't exist
function createSubjectsPage() {
  const subjectsPagePath = path.join(appDir, 'client', 'src', 'pages', 'Subjects.tsx');
  
  if (!fs.existsSync(subjectsPagePath)) {
    const subjectsPageContent = `import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Subject } from "@shared/schema";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function SubjectsPage() {
  const { t } = useTranslation();
  
  // Fetch all subjects
  const { data: subjects, isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { name: t('subjects'), translationKey: "subjects" }
            ]} 
          />
        </div>
        
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('explore.by.subject')}</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('subjects.description')}
          </p>
        </div>
        
        {/* Subjects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden animate-pulse h-48">
                <div className="p-6 flex flex-col items-center justify-center space-y-4 h-full">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          subjects && subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map(subject => (
                <Link key={subject.id} href={\`/subject/\${subject.slug}\`}>
                  <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <i className={\`\${subject.icon} text-2xl text-primary-700 dark:text-primary-400\`}></i>
                      </div>
                      <h3 className="text-xl font-semibold">{t(subject.slug)}</h3>
                    </CardContent>
                    <CardFooter className="text-center border-t border-gray-200 dark:border-gray-800 py-3 px-6">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {subject.articleCount} {t('articles')}
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">{t('no.subjects.found')}</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
}`;

    fs.writeFileSync(subjectsPagePath, subjectsPageContent);
    console.log('Created Subjects.tsx page');
  }
}