import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

interface CardData {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  route: string;
}

const cards: CardData[] = [
  {
    id: 'workflow',
    icon: Users,
    title: "Complete Recruiting Automation Workflow",
    subtitle: "See how automation transforms your hiring process from application to offer in 18 days instead of 45.",
    route: '/workflow',
  },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Recruiting Automation Demo</h1>
        </div>
        <p className="text-gray-600 ml-[52px]">Transform your hiring process with intelligent automation</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete Recruiting Automation
            </h2>
            <p className="text-xl text-gray-600">
              See how automation transforms your entire hiring process
            </p>
          </div>

          {/* Single Card */}
          <div className="flex justify-center">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  onClick={() => navigate(card.route)}
                  className="group relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border border-gray-200 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 max-w-2xl w-full"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-purple-500/10 transition-all duration-300 opacity-0 group-hover:opacity-100" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-16 h-16 gradient-bg rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      {card.subtitle}
                    </p>

                    {/* Arrow indicator */}
                    <div className="flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-base font-medium">Start Workflow Demo</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
