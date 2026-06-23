import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUpload, FiLayers, FiStar, FiZap, FiShield, FiTrendingUp, FiCheck, FiChevronDown, FiCamera, FiBarChart2, FiGift, FiCalendar } from 'react-icons/fi';

const Home = ({ user }) => {
  const navigate = useNavigate();
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-40 right-1/4 w-20 h-20 bg-primary-300 rounded-2xl blur-2xl opacity-20 animate-float" style={{ animationDelay: '0.8s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6 md:mb-8 animate-fade-in">
              <FiZap size={14} className="text-primary" />
              <span className="text-xs font-semibold text-primary-700 tracking-wide uppercase">AI-Powered Fashion Assistant</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-dark mb-4 md:mb-6 leading-tight animate-fade-in">
              Your Style,{' '}
              <span className="text-gradient-orange">Reimagined</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-3 md:mb-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Organize your wardrobe intelligently, get AI-powered outfit recommendations, and make sustainable fashion choices.
            </p>

            <p className="text-xs sm:text-sm text-gray-400 mb-8 md:mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Upload • Organize • Discover • Donate
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Go to Dashboard
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => navigate('/upload')}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-semibold text-primary border-2 border-primary-200 hover:border-primary hover:bg-primary-50 transition-all duration-300"
                  >
                    <FiUpload size={18} />
                    Upload Item
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-semibold text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      {!user && (
        <section className="relative py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
                Everything you need to{' '}
                <span className="text-gradient-orange">manage your style</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto px-4">
                Powered by AI to make your fashion decisions smarter, faster, and more sustainable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                {
                  icon: FiUpload,
                  title: 'Smart Upload',
                  desc: 'AI instantly detects type, color, and category automatically.',
                  delay: '0s',
                },
                {
                  icon: FiLayers,
                  title: 'Organize & Filter',
                  desc: 'Categorize and find outfit pieces in seconds.',
                  delay: '0.1s',
                },
                {
                  icon: FiStar,
                  title: 'AI Stylist',
                  desc: 'Get weather-aware outfit recommendations.',
                  delay: '0.2s',
                },
                {
                  icon: FiGift,
                  title: 'Donate Items',
                  desc: 'Reduce waste and give clothes a second life.',
                  delay: '0.3s',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-light border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-orange flex items-center justify-center mb-4 md:mb-6 shadow-orange group-hover:shadow-orange-lg transition-shadow duration-300">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How to Use Section */}
      <section className="relative py-16 md:py-24 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
              How to Get Started in <span className="text-gradient-orange">3 Simple Steps</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              Start building your AI-powered wardrobe in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up & Create Account',
                desc: 'Quick registration with email or social login. Takes less than 2 minutes to get started.',
                details: [
                  '• Create free account',
                  '• Set your style preferences',
                  '• Explore the dashboard'
                ]
              },
              {
                step: '2',
                title: 'Upload Your Clothing',
                desc: 'Take photos of your clothing items and let AI automatically categorize them.',
                details: [
                  '• Snap photos of items',
                  '• AI auto-detects type, color & category',
                  '• Add custom details if needed',
                ]
              },
              {
                step: '3',
                title: 'Get Recommendations',
                desc: 'Receive AI-powered outfit suggestions based on weather, occasion, and your style.',
                details: [
                  '• View outfit recommendations',
                  '• Check weather-based suggestions',
                  '• Plan outfits for special events',
                ]
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                {/* Connector Line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-20 left-[60%] w-[20%] h-1 bg-gradient-to-r from-primary to-transparent" />
                )}
                
                <div className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-orange flex items-center justify-center text-white font-heading font-bold text-xl md:text-2xl mb-4 md:mb-6 shadow-orange">
                    {step.step}
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-dark mb-2 md:mb-3">{step.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-5">{step.desc}</p>
                  <div className="space-y-2 text-xs md:text-sm text-gray-500">
                    {step.details.map((detail, j) => (
                      <p key={j} className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{detail.replace('• ', '')}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!user && (
            <div className="mt-12 md:mt-16 text-center space-y-4 md:space-y-6">
              <div>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Start Your Journey
                  <FiArrowRight />
                </button>
              </div>
              <div>
                <button
                  onClick={() => navigate('/how-to-use')}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-sm font-medium text-primary hover:text-primary-600 transition-all duration-200"
                >
                  Learn More →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
              Why Choose <span className="text-gradient-orange">AL Closet</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
            {[
              {
                icon: FiCamera,
                title: 'AI-Powered Recognition',
                items: [
                  'Automatic clothing type detection',
                  'Color and style identification',
                  'Category auto-assignment',
                  'No manual tagging needed'
                ]
              },
              {
                icon: FiBarChart2,
                title: 'Smart Organization',
                items: [
                  'Filter by type, color, size',
                  'Organize by season & occasion',
                  'Advanced search capabilities',
                  'Visual dashboard overview'
                ]
              },
              {
                icon: FiStar,
                title: 'Personalized Styling',
                items: [
                  'Weather-aware recommendations',
                  'Occasion-based outfit ideas',
                  'AI styling suggestions',
                  'Create favorite combinations'
                ]
              },
              {
                icon: FiGift,
                title: 'Sustainable Fashion',
                items: [
                  'Track wardrobe usage',
                  'Easy donation feature',
                  'Reduce clothing waste',
                  'Support secondhand movement'
                ]
              },
            ].map((benefit, i) => (
              <div key={i} className="bg-light rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-100 hover:border-primary-200 transition-all duration-300">
                <div className="flex items-start gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-orange shadow-orange">
                      <benefit.icon className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-3 md:mb-4">{benefit.title}</h3>
                    <ul className="space-y-2 md:space-y-3">
                      {benefit.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCheck className="text-primary flex-shrink-0" size={18} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      {!user && (
        <section className="py-12 md:py-16 bg-light border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: FiShield, label: 'Secure & Private', sub: 'Your data stays yours' },
                { icon: FiZap, label: 'AI-Powered', sub: 'Google Vision technology' },
                { icon: FiTrendingUp, label: 'Sustainable', sub: 'Donate & reduce waste' },
                { icon: FiCalendar, label: 'Plan Ahead', sub: 'Calendar & weather sync' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 md:gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary shadow-card">
                    <item.icon size={24} />
                  </div>
                  <p className="font-heading font-semibold text-dark text-sm md:text-base">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="relative py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-3 md:mb-4">
              Frequently Asked <span className="text-gradient-orange">Questions</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500">Everything you need to know about AI Closet</p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {[
              {
                q: 'Is my data safe and private?',
                a: 'Absolutely! We use enterprise-grade encryption and your data is stored securely. We never share your information with third parties. Your wardrobe is completely private.'
              },
              {
                q: 'How does the AI recognition work?',
                a: 'We use Google Vision AI technology to automatically detect clothing type, color, category, and other attributes from photos. This saves you time from manual tagging.'
              },
              {
                q: 'Can I use this on mobile devices?',
                a: 'Yes! Our app is fully responsive and optimized for mobile, tablets, and desktops. Take photos directly from your phone to build your wardrobe.'
              },
              {
                q: 'How often do I get new outfit recommendations?',
                a: 'Recommendations update automatically based on weather, occasion, and your calendar. You can also manually generate recommendations anytime.'
              },
              {
                q: 'Can I donate items through the app?',
                a: 'Yes! Mark items you want to donate, and we help connect you with local donation centers. Reduce waste and help others.'
              },
              {
                q: 'Is there a cost to use AI Closet?',
                a: 'No! AI Closet is completely free to use. Start building your smart wardrobe today with no hidden fees.'
              },
            ].map((faq, i) => (
              <div key={i} className="bg-light rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden hover:border-primary-200 transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full px-6 md:px-8 py-4 md:py-5 text-left flex items-center justify-between hover:bg-primary-50/30 transition-colors duration-200"
                >
                  <span className="font-heading font-semibold text-dark text-sm md:text-base">{faq.q}</span>
                  <FiChevronDown
                    size={20}
                    className={`text-primary flex-shrink-0 transition-transform duration-300 ${
                      expandedFAQ === i ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {expandedFAQ === i && (
                  <div className="px-6 md:px-8 pb-4 md:pb-5 border-t border-gray-100 bg-white">
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      {!user && (
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary to-primary-600 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -ml-48 -mb-48" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Ready to revolutionize your wardrobe?
            </h2>
            <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto">
              Join thousands of fashion-forward users building smarter, more sustainable wardrobes with AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-primary bg-white shadow-orange hover:shadow-orange-lg transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started Free
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white border-2 border-white/30 hover:border-white/60 bg-transparent transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
