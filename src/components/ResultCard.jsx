import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function ResultCard({ result, index, formatDate, getBadgeVariant }) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass-effect border-gray-200 hover:border-gray-300 transition-all duration-300">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-gray-800 border-gray-300">
                  {result.meta?.platform || 'Web'}
                </Badge>
                {result.meta?.url && (
                  <a
                    href={result.meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-green-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              {result.meta?.published_at && (
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Calendar className="h-4 w-4" />
                  {formatDate(result.meta.published_at)}
                </div>
              )}
            </div>

            {result.meta?.title && (
              <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                {result.meta.title}
              </h3>
            )}

            {result.meta?.author_name && (
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <User className="h-4 w-4" />
                {result.meta.author_name}
              </div>
            )}

            {result.meta?.description && (
              <p className="text-gray-700 text-sm line-clamp-2">
                {result.meta.description}
              </p>
            )}

            {result.ai?.summary && (
              <div className="bg-gray-100/70 rounded-lg p-4">
                <h4 className="text-foreground font-medium mb-2">Resumen</h4>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {result.ai.summary}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {result.ai?.sentiment && (
                <Badge variant={getBadgeVariant('sentiment', result.ai.sentiment)}>
                  {result.ai.sentiment}
                </Badge>
              )}
              {result.ai?.stance && (
                <Badge variant="secondary">
                  {result.ai.stance}
                </Badge>
              )}
              {result.ai?.topic && (
                <Badge variant="secondary">
                  {result.ai.topic}
                </Badge>
              )}
            </div>

            {result.ai?.entities && result.ai.entities.length > 0 && (
              <div>
                <h4 className="text-foreground font-medium mb-2 text-sm">Entidades mencionadas</h4>
                <div className="flex flex-wrap gap-1">
                  {result.ai.entities.map((entity, entityIndex) => (
                    <Badge
                      key={entityIndex}
                      variant="secondary"
                      className="text-xs text-gray-700 border-gray-400"
                    >
                      {entity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ResultCard;