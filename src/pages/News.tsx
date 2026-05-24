import { SiteHeader } from "@/components/SiteHeader";
import { NewsFeed } from "@/components/NewsFeed";
import { useI18n } from "@/hooks/useI18n";

const News = () => {
  const { lang } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <NewsFeed lang={lang} />
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-serif text-base">
            <strong>EchoBrief AI</strong> · Intelligent News & Daily Games
          </p>
        </div>
      </footer>
    </div>
  );
};

export default News;
