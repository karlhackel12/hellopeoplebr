import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ColorPalette from '@/components/ui/ColorPalette';

const DesignLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sistema de Design</h1>
          <p className="text-muted-foreground">
            Documentação e recursos para manter consistência visual no desenvolvimento
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <a 
                    href="/design/colors" 
                    className="block p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    Cores
                  </a>
                  <a 
                    href="/design/typography" 
                    className="block p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    Tipografia
                  </a>
                  <a 
                    href="/design/buttons" 
                    className="block p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    Botões
                  </a>
                  <a 
                    href="/design/forms" 
                    className="block p-2 rounded-md hover:bg-muted transition-colors"
                  >
                    Formulários
                  </a>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-9">
            <Card>
              {children}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder para páginas ainda não implementadas
const PlaceholderPage = ({ title }: { title: string }) => (
  <CardContent className="p-6">
    <h2 className="text-2xl font-bold mb-4">{title}</h2>
    <p className="text-muted-foreground">
      Esta seção está em desenvolvimento e será implementada em breve.
    </p>
  </CardContent>
);

export const DesignSystemRoutes = () => {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <DesignLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/design/colors" replace />} />
              <Route path="colors" element={<ColorPalette />} />
              <Route path="typography" element={<PlaceholderPage title="Tipografia" />} />
              <Route path="buttons" element={<PlaceholderPage title="Botões" />} />
              <Route path="forms" element={<PlaceholderPage title="Formulários" />} />
              <Route path="*" element={<Navigate to="/design/colors" replace />} />
            </Routes>
          </DesignLayout>
        }
      />
    </Routes>
  );
}; 