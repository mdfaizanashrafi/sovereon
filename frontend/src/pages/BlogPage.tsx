/**
 * ============================================================================
 * BLOG/RESOURCES PAGE
 * ============================================================================
 * 
 * Features:
 * - AI advanced usage education
 * - Marketing tips and insights
 * - Industry news
 * - Author information
 * 
 * PLACEHOLDERS:
 * - [PLACEHOLDER_BLOG_IMAGE_*]: Blog post featured images
 * 
 * @page
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Clock, User, BookOpen } from 'lucide-react';
import { blogPosts } from '@/data/siteData';

export function BlogPage() {
  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="badge-ai mb-4">Resources</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Insights & <span className="text-gradient">Resources</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Learn about AI-powered marketing, digital strategies, 
            and industry trends from our experts.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <Card className="ai-card overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-primary/30" />
              </div>
              <div className="p-8">
                <Badge className="badge-ai mb-4">{blogPosts[0].category}</Badge>
                <h2 className="text-2xl font-bold mb-4">{blogPosts[0].title}</h2>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(blogPosts[0].date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {blogPosts[0].readTime}
                  </span>
                </div>
                <a href="#" className="inline-flex items-center text-primary font-medium hover:underline">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post, index) => (
            <Card
              key={post.id}
              className="ai-card group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="h-40 bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-primary/30" />
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <Card className="ai-card bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Stay Updated</h2>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter for the latest insights and tips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-ai w-full px-4 py-2 rounded-lg"
              />
              <button className="btn-ai px-4 py-2 rounded-lg font-medium whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
