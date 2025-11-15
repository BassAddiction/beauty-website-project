import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { createBreadcrumbSchema, addStructuredData } from '@/utils/seo';

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  useEffect(() => {
    const schemaItems = [
      { name: 'Главная', url: 'https://speedvpn.io' },
      ...items.map(item => ({
        name: item.name,
        url: `https://speedvpn.io${item.path}`
      }))
    ];
    
    const schema = createBreadcrumbSchema(schemaItems);
    addStructuredData(schema);
  }, [items]);

  return (
    <nav aria-label="breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        <li>
          <Link 
            to="/" 
            className="hover:text-foreground transition-colors"
          >
            Главная
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4" />
            {index === items.length - 1 ? (
              <span className="text-foreground font-medium">{item.name}</span>
            ) : (
              <Link 
                to={item.path} 
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};