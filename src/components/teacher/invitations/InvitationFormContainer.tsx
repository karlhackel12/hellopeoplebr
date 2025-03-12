
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Copy } from 'lucide-react';
import EmailInviteForm from './EmailInviteForm';
import CodeGenerationForm from './CodeGenerationForm';

interface InvitationFormContainerProps {
  onSuccess: () => void;
}

const InvitationFormContainer: React.FC<InvitationFormContainerProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState('email');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span>Email Invitation</span>
        </TabsTrigger>
        <TabsTrigger value="code" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          <span>Generate Code</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="email">
        <EmailInviteForm onSuccess={onSuccess} />
      </TabsContent>
      
      <TabsContent value="code">
        <CodeGenerationForm onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  );
};

export default InvitationFormContainer;
