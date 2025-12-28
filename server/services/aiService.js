const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class AIService {
  static openai = process.env.OPENAI_API_KEY 
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  static anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

  static async analyzeReviewSentiments(reviews) {
    const reviewTexts = reviews.map(r => r.text).join('\n\n');
    
    const prompt = `Analyze the following business reviews and provide:
1. Overall sentiment analysis
2. Key themes and topics mentioned
3. Specific areas of praise or concern
4. Actionable recommendations for the business

Reviews:
${reviewTexts}

Provide a comprehensive analysis in JSON format with insights and recommendations.`;

    try {
      // Try Claude first, then OpenAI
      if (this.anthropic) {
        return await this.useClaude(prompt);
      } else if (this.openai) {
        return await this.useOpenAI(prompt);
      } else {
        return this.getDefaultAnalysis(reviews);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getDefaultAnalysis(reviews);
    }
  }

  static async useClaude(prompt) {
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = message.content[0].text;
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Claude API error:', error);
      throw error;
    }
  }

  static async useOpenAI(prompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert in business reputation analysis and sentiment analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = completion.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  static parseAIResponse(content) {
    // Try to extract JSON from response, or create structured response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Continue with text parsing
    }

    // Fallback: create structured response from text
    return {
      insights: content.substring(0, 500),
      recommendations: this.extractRecommendations(content),
      themes: this.extractThemes(content)
    };
  }

  static extractRecommendations(text) {
    const recommendations = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('should') ||
          line.toLowerCase().includes('suggest')) {
        recommendations.push(line.trim());
      }
    }

    return recommendations.slice(0, 5);
  }

  static extractThemes(text) {
    const themes = [];
    const commonThemes = ['service', 'quality', 'price', 'staff', 'location', 'atmosphere'];
    
    commonThemes.forEach(theme => {
      if (text.toLowerCase().includes(theme)) {
        themes.push(theme);
      }
    });

    return themes;
  }

  static getDefaultAnalysis(reviews) {
    return {
      insights: 'Review analysis completed. Consider improving customer service and product quality based on feedback.',
      recommendations: [
        'Respond to all reviews promptly',
        'Address negative feedback constructively',
        'Highlight positive aspects mentioned by customers',
        'Improve areas frequently mentioned in negative reviews'
      ],
      themes: ['service', 'quality']
    };
  }

  static async generateRecommendations(analysisData) {
    const prompt = `Based on the following business analysis data, provide specific, actionable recommendations:

SEO Score: ${analysisData.seoScore || 'N/A'}
Sentiment Analysis: ${JSON.stringify(analysisData.sentiment || {})}
Review Count: ${analysisData.reviewCount || 0}
Average Rating: ${analysisData.averageRating || 'N/A'}

Provide 5-10 specific recommendations to improve online reputation and SEO.`;

    try {
      if (this.anthropic) {
        const response = await this.useClaude(prompt);
        return { recommendations: response.recommendations || response.insights };
      } else if (this.openai) {
        const response = await this.useOpenAI(prompt);
        return { recommendations: response.recommendations || response.insights };
      } else {
        return {
          recommendations: [
            'Improve SEO score by optimizing website content',
            'Increase positive reviews by asking satisfied customers',
            'Respond to all reviews within 24-48 hours',
            'Monitor online reputation regularly',
            'Build quality backlinks to improve domain authority'
          ]
        };
      }
    } catch (error) {
      console.error('Recommendation generation error:', error);
      return { recommendations: ['Error generating recommendations'] };
    }
  }
}

module.exports = AIService;

