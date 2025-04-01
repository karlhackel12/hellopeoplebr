
import React from 'react';
import { Check, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormLabel } from '@/components/ui/form';

interface PricingPlansProps {
  onPlanSelect?: (plan: string) => void;
  selectedPlan?: string | null;
  compact?: boolean;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ 
  onPlanSelect, 
  selectedPlan,
  compact = false 
}) => {
  const handlePlanChange = (value: string) => {
    if (onPlanSelect) {
      onPlanSelect(value);
    }
  };
  
  const plans = [
    {
      id: 'basic',
      name: 'Iniciante',
      price: 'R$29,90',
      features: [
        'Acesso a todas as ferramentas',
        'Geração ilimitada de lições',
        'Dashboard de alunos',
        'Até 10 alunos'
      ],
      capacity: 10,
      icon: <Users className="h-5 w-5 text-[#26A69A] shrink-0" />
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$49,90',
      features: [
        'Acesso a todas as ferramentas',
        'Geração ilimitada de lições',
        'Dashboard avançado',
        'Até 20 alunos'
      ],
      capacity: 20,
      popular: true,
      icon: <Users className="h-5 w-5 text-[#26A69A] shrink-0" />
    },
    {
      id: 'premium',
      name: 'Avançado',
      price: 'R$69,90',
      features: [
        'Acesso a todas as ferramentas',
        'Geração ilimitada de lições',
        'Suporte premium',
        'Alunos ilimitados'
      ],
      capacity: null,
      icon: <Users className="h-5 w-5 text-[#26A69A] shrink-0" />
    }
  ];

  if (compact) {
    return (
      <RadioGroup 
        value={selectedPlan || ''} 
        onValueChange={handlePlanChange}
        className="space-y-2"
      >
        {plans.map((plan) => (
          <div key={plan.id} className={`flex items-center space-x-2 border rounded-md p-3 ${
            plan.popular ? 'border-primary' : 'border-border'
          } ${selectedPlan === plan.id ? 'bg-primary/5' : ''}`}>
            <RadioGroupItem value={plan.id} id={plan.id} />
            <FormLabel htmlFor={plan.id} className="flex-1 cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{plan.name}</span>
                  {plan.popular && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-white rounded-sm">
                      POPULAR
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">/mês</span>
                </div>
              </div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                {plan.icon}
                <span className="ml-1">
                  {plan.capacity ? `Até ${plan.capacity} alunos` : 'Alunos ilimitados'}
                </span>
              </div>
            </FormLabel>
          </div>
        ))}
      </RadioGroup>
    );
  }

  // Default fuller version
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <div 
          key={plan.id}
          className={`relative bg-white rounded-xl shadow-md border overflow-hidden transform transition-transform hover:scale-105 ${
            plan.popular ? 'border-2 border-[#1E88E5] shadow-lg' : 'border-border'
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 right-0">
              <div className="bg-[#1E88E5] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
            </div>
          )}
          <div className="p-8">
            <h3 className="text-2xl font-bold font-display mb-4">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#1E88E5]">{plan.price}</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={`${plan.id}-feature-${index}`} className="flex items-start gap-3">
                  {index === plan.features.length - 1 ? plan.icon : (
                    <Check className="h-5 w-5 text-[#26A69A] shrink-0 mt-0.5" />
                  )}
                  <span className={index === plan.features.length - 1 ? "font-bold" : ""}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            {onPlanSelect && (
              <button 
                onClick={() => handlePlanChange(plan.id)}
                className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
                  selectedPlan === plan.id 
                    ? 'bg-primary/80'
                    : plan.popular 
                      ? 'bg-[#36B37E] hover:bg-[#36B37E]/90' 
                      : 'bg-[#1E88E5] hover:bg-[#1E88E5]/90'
                }`}
              >
                {selectedPlan === plan.id ? 'Selecionado' : 'Escolher Plano'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PricingPlans;
