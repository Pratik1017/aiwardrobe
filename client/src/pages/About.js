import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCamera, FiFilter, FiStar, FiGift, FiShield, FiZap, FiTrendingUp, FiBarChart2, FiCalendar, FiPieChart } from 'react-icons/fi';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiCamera,
      title: 'AI-Powered Image Recognition',
      description: 'Our advanced AI uses Google Vision to automatically detect clothing type, color, and category from photos.',
      benefits: [
        'Save time with automatic categorization',
        '85-95% accuracy in detection',
        'Support for various clothing types',
        'Multi-angle photo analysis'
      ]
    },
    {
      icon: FiFilter,
      title: 'Smart Organization',
      description: 'Organize your wardrobe with powerful filtering and search capabilities.',
      benefits: [
        'Filter by type, color, size, category',
        'Advanced search functionality',
        'Custom tags and metadata',
        'Multiple view modes (grid/list)'
      ]
    },
    {
      icon: FiStar,
      title: 'AI Stylist Recommendations',
      description: 'Get personalized outfit suggestions based on weather, occasion, and your style preferences.',
      benefits: [
        'Weather-aware recommendations',
        'Occasion-specific outfits',
        'Personalized styling suggestions',
        'Save favorite combinations'
      ]
    },
    {
      icon: FiCalendar,
      title: 'Calendar & Outfit Planning',
      description: 'Plan your outfits in advance with integrated calendar system.',
      benefits: [
        'Schedule outfits for specific dates',
        'Weather forecast integration',
        'Recurring outfit patterns',
        'Special event planning'
      ]
    },
    {
      icon: FiGift,
      title: 'Sustainable Fashion',
      description: 'Track and manage clothing donations to reduce waste and support sustainability.',
      benefits: [
        'Easy donation management',
        'Local donation center finder',
        'Impact statistics tracking',
        'Promote secondhand fashion'
      ]
    },
    {
      icon: FiBarChart2,
      title: 'Wardrobe Analytics',
      description: 'Gain insights into your wardrobe with detailed statistics and usage tracking.',
      benefits: [
        'Wardrobe composition analysis',
        'Usage frequency tracking',
        'Color preference insights',
        'Shopping recommendations'
      ]
    }
  ];

  const benefits = [
    {
      title: 'Save Time',
      description: 'No more time spent deciding what to wear. Get instant outfit recommendations.',
      icon: FiZap
    },
    {
      title: 'Reduce Waste',
      description: 'Discover underutilized items and make sustainable fashion choices.',
      icon: FiTrendingUp
    },
    {
      title: 'Stay Organized',
      description: 'Keep your entire wardrobe digitally organized and easily accessible.',
      icon: FiFilter
    },
    {
      title: 'Improve Style',
      description: 'Get AI-powered suggestions to enhance and evolve your personal style.',
      icon: FiStar
    },
    {
      title: 'Save Money',
      description: 'Make smarter purchases by understanding your wardrobe and style patterns.',
      icon: FiPieChart
    },
    {
      title: 'Privacy First',
      description: 'Your wardrobe data is secure and private with enterprise-grade encryption.',
      icon: FiShield
    }
  ];

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 md:mb-8 transition"
          >
            <FiArrowLeft size={18} />
            Back to Home
          </button>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
            About AL Closet
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Revolutionizing how you organize, style, and think about your wardrobe.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-4 md:mb-6">
              Our Mission
            </h2>
            <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
              We believe fashion should be intelligent, sustainable, and personal. AL Closet combines cutting-edge technology with practical design to help you make better clothing decisions.
            </p>
            <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
              Whether you're looking to organize your existing wardrobe, discover new outfit combinations, or make more sustainable fashion choices, AL Closet is your personal digital fashion assistant.
            </p>
            <div className="space-y-3 md:space-y-4">
              {[
                'Powered by advanced AI technology',
                'Designed for real-world users',
                'Built for sustainability',
                'Focused on privacy and security'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center">
                    <FiCheck size={16} className="text-primary" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary to-primary-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-white h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/20 flex items-center justify-center mb-6 mx-auto">
                <FiCamera size={48} />
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">Smart Wardrobe Technology</h3>
              <p className="text-white/80 text-sm md:text-base">Using AI to revolutionize personal fashion management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-3 md:mb-4">
              Why Choose AL Closet?
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Transform the way you think about your wardrobe
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-light rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 md:mb-6">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-2 md:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-3 md:mb-4">
              Powerful Features
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              Everything you need to master your wardrobe
            </p>
          </div>

          <div className="space-y-12 md:space-y-16">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${i % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                  <div className={`bg-light rounded-2xl md:rounded-3xl p-8 md:p-12 flex items-center justify-center min-h-80 md:min-h-96 ${i % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary-50 flex items-center justify-center mb-4 md:mb-6 mx-auto">
                        <Icon className="text-primary" size={48} />
                      </div>
                      <p className="text-gray-600 font-heading font-semibold">{feature.title}</p>
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? 'md:col-start-1' : ''}>
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-3 md:mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-3 md:space-y-4">
                      {feature.benefits.map((benefit, j) => (
                        <div key={j} className="flex items-start gap-3 md:gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center mt-0.5">
                            <FiCheck size={16} className="text-primary" />
                          </div>
                          <span className="text-gray-600 text-sm md:text-base">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-3 md:mb-4">
              Technology Behind AL Closet
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Google Vision AI',
                description: 'Advanced image recognition and analysis for accurate clothing detection'
              },
              {
                title: 'Machine Learning',
                description: 'Personalized recommendations that improve over time'
              },
              {
                title: 'Cloud Infrastructure',
                description: 'Fast, reliable, and scalable cloud-based services'
              },
              {
                title: 'End-to-End Encryption',
                description: 'Enterprise-grade security for your personal data'
              },
              {
                title: 'Real-time Processing',
                description: 'Instant image analysis and recommendations'
              },
              {
                title: 'API Integration',
                description: 'Weather integration for context-aware suggestions'
              }
            ].map((tech, i) => (
              <div key={i} className="bg-light rounded-2xl p-6 md:p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300">
                <h3 className="font-heading font-bold text-dark mb-2 text-lg">{tech.title}</h3>
                <p className="text-gray-600 text-sm md:text-base">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-primary-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Ready to revolutionize your wardrobe?
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10">
            Start your journey with AL Closet today and discover a smarter way to manage your style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 md:py-4 rounded-xl font-semibold text-primary bg-white hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/how-to-use')}
              className="px-8 py-3 md:py-4 rounded-xl font-semibold text-white border-2 border-white hover:bg-white/10 transition-all duration-300 flex-1 sm:flex-none"
            >
              Learn How It Works
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
