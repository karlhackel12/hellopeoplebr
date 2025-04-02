
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormProvider, useForm } from 'react-hook-form';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$29,90',
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
      price: 'R$49,90',
      period: '/mês',
      description: 'Ideal para professores estabelecidos',
      features: [
        'Até 20 alunos',
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
      price: 'R$59,90',
      period: '/mês',
      description: 'Para escolas e grupos de professores',
      features: [
        'Mais de 20 alunos',
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
      <div className={`grid grid-cols-1 ${compact ? 'gap-3 sm:gap-4' : 'gap-6 sm:gap-8'} ${compact ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'} max-w-6xl mx-auto`}>
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative bg-white border ${selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl shadow-sm overflow-hidden ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6'} ${plan.popular && !compact ? 'md:-mt-4 md:mb-4' : ''}`}
          >
            {plan.popular && !compact && (
              <Badge className="absolute top-2 right-2 sm:top-6 sm:right-6" variant="default">Mais Popular</Badge>
            )}
            
            <div className={compact ? 'mb-2' : 'mb-3 sm:mb-4'}>
              <h3 className={`font-bold font-display ${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>{plan.name}</h3>
              {!compact && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{plan.description}</p>}
            </div>
            
            <div className={compact ? 'mb-2 sm:mb-3' : 'mb-4 sm:mb-6'}>
              <span className={`font-bold ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </div>
            
            {!compact && (
              <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <Button 
              onClick={() => handleSelectPlan(plan.id)} 
              className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''} ${compact ? 'h-7 text-xs sm:h-8 sm:text-sm' : ''}`}
              variant={plan.popular ? 'default' : 'outline'}
              size={compact ? 'sm' : 'default'}
            >
              {selectedPlan === plan.id ? (
                <span className="flex items-center">
                  <CheckCircle2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {isMobile && compact ? 'Selecionado' : 'Selecionado'}
                </span>
              ) : compact ? 'Selecionar' : isMobile ? plan.cta.split(' ')[0] : plan.cta}
            </Button>
          </div>
        ))}
      </div>
    </FormProvider>
  );
};

export default PricingPlans;
