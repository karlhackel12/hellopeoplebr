
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormProvider, useForm } from 'react-hook-form';

interface PricingPlansProps {
  onPlanSelect?: (planId: string) => void;
  selectedPlan?: string | null;
  compact?: boolean;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ 
  onPlanSelect, 
  selectedPlan = null,
  compact = false 
}) => {
  const methods = useForm();
  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$79',
      period: '/mês',
      description: 'Perfeito para professores iniciantes',
      features: [
        'Até 10 alunos',
        'Geração de conteúdo com IA',
        'Acompanhamento de progresso',
        'Suporte por e-mail'
      ],
      cta: 'Comece Agora',
      popular: false
    },
    {
      id: 'pro',
      name: 'Profissional',
      price: 'R$149',
      period: '/mês',
      description: 'Ideal para professores estabelecidos',
      features: [
        'Até 25 alunos',
        'Tudo do plano Básico',
        'Análises avançadas',
        'Ferramentas de colaboração',
        'Suporte prioritário'
      ],
      cta: 'Escolher Profissional',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 'R$299',
      period: '/mês',
      description: 'Para escolas e grupos de professores',
      features: [
        'Até 100 alunos',
        'Tudo do plano Profissional',
        'Painel administrativo',
        'API de integração',
        'Gerenciador de equipe',
        'Suporte dedicado'
      ],
      cta: 'Contatar Vendas',
      popular: false
    }
  ];

  const handleSelectPlan = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    } else {
      // If no onPlanSelect is provided, navigate to register page with plan ID
      window.location.href = `/register?plan=${planId}`;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className={`grid ${compact ? 'grid-cols-1 md:grid-cols-3 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-8'} max-w-6xl mx-auto`}>
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-white border ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl shadow-sm overflow-hidden ${compact ? 'p-4' : 'p-6'} ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            {plan.popular && !compact && (
              <Badge className="absolute top-6 right-6" variant="default">Mais Popular</Badge>
            )}
            
            <div className={compact ? 'mb-2' : 'mb-4'}>
              <h3 className={`font-bold font-display ${compact ? 'text-lg' : 'text-xl'}`}>{plan.name}</h3>
              {!compact && <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>}
            </div>
            
            <div className={compact ? 'mb-3' : 'mb-6'}>
              <span className={`font-bold ${compact ? 'text-2xl' : 'text-3xl'}`}>{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            
            {!compact && (
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <Button 
              onClick={() => handleSelectPlan(plan.id)} 
              className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''} ${compact ? 'h-8 text-sm' : ''}`}
              variant={plan.popular ? 'default' : 'outline'}
            >
              {selectedPlan === plan.id ? (
                <span className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Selecionado
                </span>
              ) : compact ? 'Selecionar' : plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </FormProvider>
  );
};

export default PricingPlans;
