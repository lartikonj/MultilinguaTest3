#!/usr/bin/env node

/**
 * This script sets up the Multilingua application correctly.
 * It ensures proper directory structure, creates missing files, and 
 * handles database setup.
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Constants
const appDir = path.join(process.cwd(), 'multilingua_app', 'Multilingua-lartikonj-patch-1');
const clientDir = path.join(appDir, 'client');
const serverDir = path.join(appDir, 'server');
const sharedDir = path.join(appDir, 'shared');

// Make sure the app directory exists
if (!fs.existsSync(appDir)) {
  console.error(`Error: App directory not found at ${appDir}`);
  console.log("Please run 'node unzip_and_run.py' first to extract the application.");
  process.exit(1);
}

console.log("=== Setting up Multilingua application ===");

// Function to create the Subjects page
function createSubjectsPage() {
  const subjectsPath = path.join(clientDir, 'src', 'pages', 'Subjects.tsx');
  
  if (!fs.existsSync(subjectsPath)) {
    console.log("Creating Subjects.tsx page...");
    
    const subjectsContent = `
import { useQuery } from "@tanstack/react-query";
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
}
    `.trim();
    
    // Create the directory if it doesn't exist
    const pagesDir = path.join(clientDir, 'src', 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }
    
    // Write the file
    fs.writeFileSync(subjectsPath, subjectsContent);
    console.log("Subjects.tsx created successfully");
  } else {
    console.log("Subjects.tsx already exists, skipping creation");
  }
}

// Function to fix the Article component
function fixArticlePage() {
  const articlePath = path.join(clientDir, 'src', 'pages', 'Article.tsx');
  
  if (fs.existsSync(articlePath)) {
    console.log("Fixing Article.tsx page...");
    
    const articleContent = fs.readFileSync(articlePath, 'utf8');
    
    // Check if the file needs to be fixed
    if (articleContent.includes('const { subjectSlug, slug } = params!;') && 
        !articleContent.includes('slug` was being accessed before initialization')) {
      console.log("Article.tsx already fixed, skipping");
      return;
    }
    
    // Fix the declaration order to ensure slug is initialized before use
    const fixedContent = articleContent.replace(
      `export default function ArticlePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // Fetch article data
  const { data: article, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: [\`/api/articles/\${slug}\`],`,
      `export default function ArticlePage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [match, params] = useRoute("/subject/:subjectSlug/:slug");
  
  if (!match) return <NotFound />;
  const { subjectSlug, slug } = params!;
  
  // Fetch article data
  const { data: article, isLoading: isLoadingArticle } = useQuery<Article>({
    queryKey: [\`/api/articles/\${slug}\`],`
    );
    
    fs.writeFileSync(articlePath, fixedContent);
    console.log("Article.tsx fixed successfully");
  } else {
    console.log("Article.tsx doesn't exist, cannot fix");
  }
}

// Function to update App.tsx to include the Subjects route
function updateAppRoutes() {
  const appTsxPath = path.join(clientDir, 'src', 'App.tsx');
  
  if (fs.existsSync(appTsxPath)) {
    console.log("Updating App.tsx routes...");
    
    let content = fs.readFileSync(appTsxPath, 'utf8');
    
    // Check if we need to add the Subjects route
    if (!content.includes('<Route path="/subjects"')) {
      content = content.replace(
        '<Route path="/" component={Home} />',
        '<Route path="/" component={Home} />\n      <Route path="/subjects" component={Subjects} />'
      );
      
      console.log("Added /subjects route to App.tsx");
    } else {
      console.log("Subjects route already exists in App.tsx");
    }
    
    fs.writeFileSync(appTsxPath, content);
  } else {
    console.log("App.tsx doesn't exist, cannot update routes");
  }
}

// Function to push database schema
function pushDatabaseSchema() {
  console.log("Pushing database schema...");
  
  // Change to the app directory
  process.chdir(appDir);
  
  try {
    execSync('npm run db:push', { stdio: 'inherit' });
    console.log("Database schema pushed successfully");
  } catch (error) {
    console.log("Warning: Failed to push database schema. The application may not have full functionality.");
  }
}

// Set up the app in the correct order
try {
  // Create necessary files
  createSubjectsPage();
  fixArticlePage();
  updateAppRoutes();
  
  // Push database schema
  pushDatabaseSchema();
  
  console.log("Setup completed successfully!");
  console.log("Now you can run the application using 'cd multilingua_app/Multilingua-lartikonj-patch-1 && npm run dev'");
  
} catch (error) {
  console.error(`Error during setup: ${error.message}`);
  process.exit(1);
}