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
                <Link key={subject.id} href={`/subject/${subject.slug}`}>
                  <Card className="bg-white dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <i className={`${subject.icon} text-2xl text-primary-700 dark:text-primary-400`}></i>
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