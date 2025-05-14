import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";

export default function TermsPage() {
  const { t } = useTranslation();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { name: t('home'), href: "/", translationKey: "home" },
              { name: t('terms.of.service'), translationKey: "terms.of.service" }
            ]} 
          />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('terms.of.service')}</h1>
          
          <div className="prose dark:prose-invert">
            <h2>{t('terms.effective')}</h2>
            <p>{t('terms.last.updated')}: May 14, 2025</p>
            
            <h2>{t('terms.acceptance')}</h2>
            <p>{t('terms.acceptance.desc')}</p>
            
            <h2>{t('terms.access')}</h2>
            <p>{t('terms.access.desc')}</p>
            
            <h2>{t('terms.intellectual.property')}</h2>
            <p>{t('terms.intellectual.property.desc')}</p>
            
            <h2>{t('terms.user.content')}</h2>
            <p>{t('terms.user.content.desc')}</p>
            
            <h2>{t('terms.prohibited.activities')}</h2>
            <ul>
              <li>{t('terms.prohibited.1')}</li>
              <li>{t('terms.prohibited.2')}</li>
              <li>{t('terms.prohibited.3')}</li>
              <li>{t('terms.prohibited.4')}</li>
              <li>{t('terms.prohibited.5')}</li>
            </ul>
            
            <h2>{t('terms.disclaimer')}</h2>
            <p>{t('terms.disclaimer.desc')}</p>
            
            <h2>{t('terms.limitation')}</h2>
            <p>{t('terms.limitation.desc')}</p>
            
            <h2>{t('terms.indemnification')}</h2>
            <p>{t('terms.indemnification.desc')}</p>
            
            <h2>{t('terms.governing.law')}</h2>
            <p>{t('terms.governing.law.desc')}</p>
            
            <h2>{t('terms.changes')}</h2>
            <p>{t('terms.changes.desc')}</p>
            
            <h2>{t('terms.contact')}</h2>
            <p>{t('terms.contact.desc')}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}