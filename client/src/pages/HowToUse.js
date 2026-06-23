import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCamera, FiFilter, FiStar, FiGift, FiPlay, FiCheck, FiChevronDown } from 'react-icons/fi';

const HowToUse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [expandedStep, setExpandedStep] = useState(0);

  const guides = [
    {
      title: 'Getting Started',
      icon: FiCheck,
      sections: [
        {
          title: 'Create Your Account',
          steps: [
            'Visit the home page and click "Get Started Free"',
            'Enter your email address and create a password',
            'Verify your email (check your inbox)',
            'Complete your profile with style preferences',
            'Start exploring your personalized dashboard'
          ],
          tips: 'Use a strong password with mix of letters, numbers, and symbols for better security.'
        },
        {
          title: 'Set Your Preferences',
          steps: [
            'Go to Settings (profile icon)',
            'Set your clothing size and preferred styles',
            'Choose your climate/weather zone',
            'Select your body type for better recommendations',
            'Save your preferences'
          ],
          tips: 'You can update these anytime as your preferences change.'
        }
      ]
    },
    {
      title: 'Uploading Clothes',
      icon: FiCamera,
      sections: [
        {
          title: 'How to Upload',
          steps: [
            'Click the "Upload Item" button from dashboard',
            'Take or select a clear photo of the clothing',
            'AI will auto-detect type, color, and category',
            'Review the AI suggestions (you can edit if needed)',
            'Add optional details like brand, size, purchase date',
            'Click "Save" to add to your wardrobe'
          ],
          tips: 'For best results, take photos with good lighting and clear visibility of the entire item.'
        },
        {
          title: 'Photo Tips for Better AI Recognition',
          steps: [
            'Use good natural lighting or bright indoor lighting',
            'Take photos against a plain background',
            'Show the full item clearly in frame',
            'Take multiple angles for complex items like jackets',
            'Ensure colors are displayed accurately'
          ],
          tips: 'The clearer the photo, the more accurate the AI detection.'
        },
        {
          title: 'Batch Upload',
          steps: [
            'You can upload multiple items one after another',
            'Each item is analyzed individually',
            'Save time by uploading several items in one session',
            'All items will be added to your digital wardrobe'
          ],
          tips: 'Organize your clothes before uploading for faster processing.'
        }
      ]
    },
    {
      title: 'Organizing Your Wardrobe',
      icon: FiFilter,
      sections: [
        {
          title: 'Using Filters',
          steps: [
            'Go to Dashboard to see all your clothing',
            'Click the "Filter Items" button',
            'Filter by: Type (shirt, pants, dress, etc.)',
            'Filter by: Color (blue, red, black, etc.)',
            'Filter by: Category (casual, formal, sports, etc.)',
            'Filter by: Size (XS, S, M, L, XL, etc.)',
            'Click "Apply" to see filtered results'
          ],
          tips: 'Use filters to quickly find specific items for styling.'
        },
        {
          title: 'Advanced Organization',
          steps: [
            'Tag items with seasons (summer, winter, etc.)',
            'Add custom tags like "work", "casual", "gym"',
            'Group items by brand or collection',
            'Create outfit combinations and save them',
            'Sort by recently added or most used'
          ],
          tips: 'Well-organized wardrobe makes finding items much faster.'
        },
        {
          title: 'Managing Your Items',
          steps: [
            'Click on any item to see full details',
            'Edit item information anytime',
            'Add or change tags and descriptions',
            'Update condition status (new, like-new, worn, etc.)',
            'Delete items you no longer own'
          ],
          tips: 'Keep your wardrobe updated for accurate recommendations.'
        }
      ]
    },
    {
      title: 'Getting Recommendations',
      icon: FiStar,
      sections: [
        {
          title: 'AI Stylist Feature',
          steps: [
            'Navigate to "AI Stylist" from the main menu',
            'Select the occasion (casual, work, date, party, etc.)',
            'Choose the weather/season',
            'Specify any preferences or requirements',
            'AI will suggest 3-5 outfit combinations',
            'Click on suggestions to see detailed breakdowns'
          ],
          tips: 'The more items you upload, the better the recommendations.'
        },
        {
          title: 'Weather-Based Recommendations',
          steps: [
            'AI automatically checks your local weather',
            'Recommendations adjust based on temperature',
            'Get suggestions for rainy, sunny, or cold days',
            'See recommended layers for each outfit',
            'Save favorite outfit combinations'
          ],
          tips: 'Enable location services for accurate weather integration.'
        },
        {
          title: 'Occasion-Specific Outfits',
          steps: [
            'Select from predefined occasions (Work, Casual, Date, Party, etc.)',
            'Or create custom occasions',
            'AI considers dress codes and style appropriateness',
            'Get multiple outfit options to choose from',
            'Pin your favorite combinations'
          ],
          tips: 'Create custom occasions for frequent events in your life.'
        }
      ]
    },
    {
      title: 'History & Calendar',
      icon: FiFilter,
      sections: [
        {
          title: 'Outfit History',
          steps: [
            'Access your "History" section from the menu',
            'See all outfits you\'ve worn',
            'View dates and occasions',
            'See how often each item is used',
            'Identify your most-worn pieces'
          ],
          tips: 'History helps you understand your style patterns.'
        },
        {
          title: 'Plan Ahead with Calendar',
          steps: [
            'Go to "Calendar" to plan upcoming outfits',
            'Click on specific dates to add outfit plans',
            'Set reminders for special events',
            'Plan outfits in advance',
            'See weather forecast for planned days'
          ],
          tips: 'Planning outfits ahead reduces daily decision fatigue.'
        }
      ]
    },
    {
      title: 'Sustainability & Donations',
      icon: FiGift,
      sections: [
        {
          title: 'Donate Items',
          steps: [
            'Navigate to the "Impact" section',
            'Select items you want to donate',
            'Choose a donation method (charity, resale, etc.)',
            'Find local donation centers',
            'Get impact statistics for your contributions'
          ],
          tips: 'Donating reduces waste and helps the environment.'
        },
        {
          title: 'Track Your Impact',
          steps: [
            'See how many items you\'ve donated',
            'Track your sustainable fashion journey',
            'View environmental impact statistics',
            'Get badges for achievements',
            'Share your impact with friends'
          ],
          tips: 'Every donation contributes to a more sustainable future.'
        }
      ]
    }
  ];

  const toggleStep = (index) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const CurrentGuide = guides[activeTab];
  const CurrentIcon = CurrentGuide.icon;

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
            How to Use AL Closet
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            Complete guide to mastering your digital wardrobe and getting the best outfit recommendations.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar - Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 sticky top-24 max-h-[calc(100vh-140px)] overflow-y-auto">
              <h3 className="font-heading font-bold text-dark text-sm uppercase tracking-wide mb-4 md:mb-6 px-2">
                Guides
              </h3>
              <div className="space-y-2">
                {guides.map((guide, index) => {
                  const Icon = guide.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === index
                          ? 'bg-primary text-white shadow-orange'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{guide.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Guide Header */}
              <div className="bg-gradient-to-br from-primary to-primary-600 px-6 md:px-8 py-8 md:py-12 text-white">
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 flex items-center justify-center">
                    <CurrentIcon size={32} />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl md:text-3xl font-bold">{CurrentGuide.title}</h2>
                    <p className="text-white/80 text-sm md:text-base">Step-by-step instructions and tips</p>
                  </div>
                </div>
              </div>

              {/* Guide Content */}
              <div className="p-6 md:p-8">
                <div className="space-y-4 md:space-y-6">
                  {CurrentGuide.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-100 rounded-xl overflow-hidden">
                      {/* Section Header */}
                      <button
                        onClick={() => toggleStep(sectionIndex)}
                        className="w-full px-6 md:px-8 py-4 md:py-6 bg-gray-50 hover:bg-primary-50/50 flex items-center justify-between transition-colors duration-200"
                      >
                        <div className="text-left">
                          <h3 className="font-heading font-bold text-dark text-base md:text-lg">{section.title}</h3>
                        </div>
                        <FiChevronDown
                          size={20}
                          className={`text-primary flex-shrink-0 transition-transform duration-300 ${
                            expandedStep === sectionIndex ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Section Content */}
                      {expandedStep === sectionIndex && (
                        <div className="px-6 md:px-8 py-6 md:py-8 bg-white border-t border-gray-100">
                          <div className="space-y-6 md:space-y-8">
                            {/* Steps */}
                            <div>
                              <h4 className="font-semibold text-dark mb-4 text-sm uppercase tracking-wide text-gray-600">
                                Steps
                              </h4>
                              <ol className="space-y-3 md:space-y-4">
                                {section.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                      <div className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-primary-50 border-2 border-primary text-sm font-semibold text-primary">
                                        {stepIndex + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1 pt-1">
                                      <p className="text-sm md:text-base text-gray-700">{step}</p>
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Tips */}
                            {section.tips && (
                              <div className="bg-primary-50 border-l-4 border-primary rounded-lg p-4 md:p-6">
                                <p className="text-xs uppercase tracking-wide font-semibold text-primary mb-2">
                                  💡 Pro Tip
                                </p>
                                <p className="text-sm md:text-base text-primary-900">{section.tips}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 md:mt-12">
              <button
                onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                disabled={activeTab === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 0
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <FiArrowLeft size={18} />
                Previous
              </button>
              <button
                onClick={() => setActiveTab(Math.min(guides.length - 1, activeTab + 1))}
                disabled={activeTab === guides.length - 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === guides.length - 1
                    ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                    : 'text-white bg-primary hover:shadow-orange'
                }`}
              >
                Next
                <FiArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <section className="bg-white border-t border-gray-100 mt-16 md:mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark mb-8 md:mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                q: 'How long does AI analysis take?',
                a: 'Typically 1-3 seconds per image. Depends on image quality and internet speed.'
              },
              {
                q: 'Can I edit AI-detected information?',
                a: 'Yes! You can edit any information after upload. AI suggestions are just starting points.'
              },
              {
                q: 'What file formats are supported?',
                a: 'JPG, PNG, GIF, and WebP. Maximum file size is 5MB.'
              },
              {
                q: 'How accurate is the AI recognition?',
                a: 'Around 85-95% accurate. We continuously improve with more data.'
              },
              {
                q: 'Can I delete items from my wardrobe?',
                a: 'Yes! Deleted items are moved to trash and can be recovered within 30 days.'
              },
              {
                q: 'How do recommendations work?',
                a: 'AI considers weather, season, occasion, and your past preferences to suggest outfits.'
              }
            ].map((faq, i) => (
              <div key={i} className="bg-light rounded-xl p-6 md:p-8 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-2 md:mb-3">{faq.q}</h3>
                <p className="text-sm md:text-base text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-primary-600 text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Ready to get started?
          </h2>
          <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10">
            Begin building your AI-powered wardrobe today and discover your perfect outfits!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 md:py-4 rounded-xl font-semibold text-primary bg-white hover:shadow-lg transition-all duration-300"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 md:py-4 rounded-xl font-semibold text-white border-2 border-white hover:bg-white/10 transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowToUse;
