import React from 'react';

interface ColorBlockProps {
  name: string;
  color: string;
  textColor: string;
  description: string;
}

const ColorBlock = ({ name, color, textColor, description }: ColorBlockProps) => {
  return (
    <div className="flex flex-col">
      <div 
        className={`h-24 w-full ${color} rounded-t-md flex items-end p-3`}
      >
        <span className={`font-medium ${textColor}`}>{name}</span>
      </div>
      <div className="bg-card p-3 rounded-b-md border shadow-sm h-24">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export function ColorPalette() {
  const colors = [
    {
      name: 'Primary',
      color: 'bg-primary',
      textColor: 'text-white',
      description: 'Verde principal para ações, botões principais e elementos de destaque',
    },
    {
      name: 'Secondary',
      color: 'bg-secondary',
      textColor: 'text-white',
      description: 'Azul para elementos secundários, links e informações',
    },
    {
      name: 'Accent',
      color: 'bg-accent',
      textColor: 'text-white',
      description: 'Roxo para destaques especiais e elementos diferenciados',
    },
    {
      name: 'Warning',
      color: 'bg-warning',
      textColor: 'text-black',
      description: 'Laranja para avisos, alertas e chamadas de atenção',
    },
    {
      name: 'Danger',
      color: 'bg-destructive',
      textColor: 'text-white',
      description: 'Vermelho para erros, ações destrutivas e alertas críticos',
    },
    {
      name: 'Success',
      color: 'bg-success',
      textColor: 'text-white',
      description: 'Verde para confirmações, ações bem-sucedidas e feedback positivo',
    },
    {
      name: 'Info',
      color: 'bg-info',
      textColor: 'text-white',
      description: 'Azul para informações, dicas e mensagens de ajuda',
    },
    {
      name: 'Neutral',
      color: 'bg-neutral',
      textColor: 'text-white',
      description: 'Cor neutra para textos principais e elementos neutros',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paleta de Cores</h2>
        <p className="text-muted-foreground">
          Uma paleta de cores consistente para aplicação em toda a interface, com hierarquia visual definida.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {colors.map((color) => (
          <ColorBlock
            key={color.name}
            name={color.name}
            color={color.color}
            textColor={color.textColor}
            description={color.description}
          />
        ))}
      </div>
      
      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold">Como usar</h3>
        <div className="bg-muted p-4 rounded-md">
          <p className="mb-2 font-medium">Classes para fundos:</p>
          <code className="text-sm">bg-primary, bg-secondary, bg-accent, bg-warning, bg-destructive, bg-success, bg-info, bg-neutral</code>
          
          <p className="mt-4 mb-2 font-medium">Classes para texto:</p>
          <code className="text-sm">text-primary, text-secondary, text-accent, text-warning, text-destructive, text-success, text-info, text-neutral</code>
          
          <p className="mt-4 mb-2 font-medium">Classes para bordas:</p>
          <code className="text-sm">border-primary, border-secondary, border-accent, border-warning, border-danger, border-success, border-info</code>
          
          <p className="mt-4 mb-2 font-medium">Utilitários para botões:</p>
          <code className="text-sm">btn-primary, btn-secondary, btn-accent, btn-warning, btn-danger, btn-success, btn-info</code>
        </div>
        
        <div className="bg-muted p-4 rounded-md">
          <p className="mb-2 font-medium">Hierarquia de importância visual:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li><strong>Primary (Verde):</strong> Ações principais, CTA, elementos críticos</li>
            <li><strong>Secondary (Azul):</strong> Ações secundárias, informações importantes</li>
            <li><strong>Accent (Roxo):</strong> Destaques, elementos diferenciados</li>
            <li><strong>Estados e feedback:</strong> Success, Warning, Danger, Info</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ColorPalette; 