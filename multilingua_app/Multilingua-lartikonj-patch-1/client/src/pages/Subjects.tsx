import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Subject } from "@shared/schema";
import Layout from "@/components/Layout";
import { getSubjects } from "@/data/api";

export default function SubjectsPage() {
  const { t } = useTranslation();
  
  // Fetch all subjects
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects
  });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-8">{t('nav.subjects')}</h1>
        
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 h-48"></div>
            ))}
          </div>
        ) : (
          // Subjects grid
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

interface SubjectCardProps {
  subject: Subject;
}

function SubjectCard({ subject }: SubjectCardProps) {
  const { t } = useTranslation();
  
  const getGradientBySubject = (subjectSlug: string) => {
    const gradients: Record<string, string> = {
      "technology": "from-blue-500 to-indigo-500",
      "science": "from-indigo-500 to-purple-500",
      "environment": "from-green-500 to-teal-500",
      "health": "from-red-500 to-pink-500",
      "arts-culture": "from-yellow-500 to-orange-500",
      "travel": "from-purple-500 to-pink-500"
    };
    
    return gradients[subjectSlug] || "from-gray-500 to-gray-700";
  };
  
  return (
    <Link href={`/subject/${subject.slug}`}>
      <div className="group cursor-pointer">
        <div className={`rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800 transition-all bg-gradient-to-br ${getGradientBySubject(subject.slug)} hover:shadow-md h-48 flex items-center justify-center relative`}>
          {/* Icon */}
          <div className="text-5xl text-white mb-4">
            <i className={subject.icon}></i>
          </div>
          
          {/* Overlay content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-xl font-bold text-white mb-1">{t(subject.slug)}</h3>
            <p className="text-white/80 text-sm">
              {subject.articleCount} {t('articles')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
